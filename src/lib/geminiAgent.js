import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabase";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let aiClient = null;

if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// Default model as requested
const MODEL_NAME = "gemini-3.0-flash"; // gemini-3-flash-preview ? actually there's gemini-2.0-flash, but prompt says "gemini-3-flash-preview". Let's use it or 3.0. We will use exactly "gemini-3-flash-preview" as requested by user. Wait, usually the current version is gemini-2.5-flash or gemini-2.0-flash. The prompt said gemini-3-flash-preview. I'll use it to respect the explicit request.
// Wait, user explicitly specified: gemini-3-flash-preview. I'll use the value from prompt.
const MODEL = "gemini-3-flash-preview";

const systemPrompt = `Você é o Makini Agent, um assistente de gestão logística agrícola especializado em Angola.
Seu papel é ajudar agricultores angolanos a encontrar e reservar equipamentos e serviços agrícolas.

Quando o utilizador fizer um pedido:
1. Extraia os parâmetros: localização, tipo de equipamento, data/urgência, quantidade, requisitos especiais
2. Use as ferramentas disponíveis para pesquisar na base de dados
3. Apresente as melhores opções de forma clara e acionável
4. Sempre responda em Português, com linguagem simples e acessível
5. Se não houver opções exatas, sugira alternativas próximas (outra localização, data diferente, etc.)

Categorias de equipamentos disponíveis:
- Preparação do Solo (tractores, charruas, escarificadores)
- Plantio (semeadoras, transplantadoras)
- Aplicação de Insumos (pulverizadores, distribuidores de fertilizante)
- Colheita (colheitadeiras, debulhadores, ceifeiras)
- Transporte (camiões, atrelados, reboques)
- Irrigação (bombas, sistemas de rega)`;

const tools = [
  {
    name: "search_equipment",
    description: "Pesquisa equipamentos e serviços disponíveis na base de dados Makini com base em critérios específicos",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "Localização/cidade onde o agricultor precisa do equipamento (ex: Huambo, Malanje, Luanda)"
        },
        equipment_type: {
          type: "string",
          description: "Tipo de equipamento ou serviço (ex: tractor, colheitadeira, camião, pulverizador)"
        },
        category: {
          type: "string",
          enum: ["preparacao_solo", "plantio", "aplicacao_insumos", "colheita", "transporte", "irrigacao"],
          description: "Categoria do equipamento"
        },
        date_needed: {
          type: "string",
          description: "Data em que o equipamento é necessário (formato: YYYY-MM-DD ou 'hoje', 'amanhã', 'esta semana')"
        },
        quantity: {
          type: "number",
          description: "Quantidade de unidades necessárias"
        },
        min_rating: {
          type: "number",
          description: "Classificação mínima do fornecedor (1-5)"
        },
        max_price_per_day: {
          type: "number",
          description: "Preço máximo por dia em Kwanzas (AOA)"
        }
      },
      required: ["location", "equipment_type"]
    }
  },
  {
    name: "check_availability",
    description: "Verifica se um fornecedor específico tem disponibilidade para uma data e duração",
    parameters: {
      type: "object",
      properties: {
        provider_id: {
          type: "string",
          description: "ID do fornecedor/listing"
        },
        start_date: {
          type: "string",
          description: "Data de início (YYYY-MM-DD)"
        },
        duration_days: {
          type: "number",
          description: "Número de dias necessários"
        }
      },
      required: ["provider_id", "start_date"]
    }
  },
  {
    name: "get_provider_details",
    description: "Obtém detalhes completos de um fornecedor incluindo avaliações, fotos e descrição do equipamento",
    parameters: {
      type: "object",
      properties: {
        provider_id: {
          type: "string",
          description: "ID do fornecedor/listing"
        }
      },
      required: ["provider_id"]
    }
  },
  {
    name: "create_booking_proposal",
    description: "Cria uma proposta de reserva pré-preenchida para o agricultor confirmar",
    parameters: {
      type: "object",
      properties: {
        provider_id: {
          type: "string",
          description: "ID do fornecedor/listing"
        },
        start_date: {
          type: "string",
          description: "Data de início (YYYY-MM-DD)"
        },
        duration_days: {
          type: "number",
          description: "Número de dias"
        },
        special_requirements: {
          type: "string",
          description: "Requisitos especiais ou notas adicionais"
        }
      },
      required: ["provider_id", "start_date", "duration_days"]
    }
  },
  {
    name: "navigate_to_results",
    description: "Gera os parâmetros de navegação para levar o utilizador à página de resultados filtrados",
    parameters: {
      type: "object",
      properties: {
        filters: {
          type: "object",
          description: "Filtros a aplicar na página de listagens",
          properties: {
            category: { type: "string" },
            location: { type: "string" },
            date: { type: "string" },
            min_rating: { type: "number" }
          }
        },
        page: {
          type: "string",
          enum: ["listings", "search", "booking"],
          description: "Página de destino"
        }
      },
      required: ["page"]
    }
  }
];

// Helper to implement the database logic for each tool
async function executeToolCall(toolCall) {
  const { name, args } = toolCall;
  console.log(`Executing tool: ${name}`, args);

  try {
    switch (name) {
      case "search_equipment": {
        let query = supabase.from('listings').select('*, profiles(nome, avaliacao)');

        if (args.location) query = query.ilike('localizacao', `%${args.location}%`);
        if (args.category) query = query.eq('categoria', args.category);
        if (args.equipment_type) query = query.ilike('titulo', `%${args.equipment_type}%`);
        if (args.max_price_per_day) query = query.lte('preco_dia', args.max_price_per_day);

        const { data, error } = await query;
        if (error) throw error;

        // Return max 5 items to keep context small
        return data ? data.slice(0, 5) : [];
      }

      case "check_availability": {
        // Query to check if there are overlaps in the reservas table
        const { data, error } = await supabase
          .from('reservas')
          .select('*')
          .eq('listing_id', args.provider_id)
          .gte('data_inicio', args.start_date)
          .in('status', ['pendente', 'confirmada']);

        if (error) throw error;

        return { available: data.length === 0, conflicting_bookings: data.length };
      }

      case "get_provider_details": {
        const { data, error } = await supabase
          .from('listings')
          .select('*, profiles(*)')
          .eq('id', args.provider_id)
          .single();

        if (error) throw error;
        return data;
      }

      case "create_booking_proposal": {
        // Not actually saving, just formatting for UI
        return {
          proposalReady: true,
          bookingData: args
        };
      }

      case "navigate_to_results": {
        return { navigationSetup: true, destination: args.page, parameters: args.filters };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return { error: error.message };
  }
}

export async function runAgent(userMessage, conversationHistory = []) {
  if (!aiClient) {
    return {
      message: "Erro: Chave de API Gemini não configurada (VITE_GEMINI_API_KEY).",
      actionType: "ERROR",
      actionData: {}
    };
  }

  try {
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // The user's new message
    formattedHistory.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const chatSession = aiClient.chats.create({
      model: MODEL,
      config: {
        systemInstruction: systemPrompt,
        tools: tools.map(tool => ({ functionDeclarations: [tool] })),
        temperature: 1.0,
      }
    });

    // Send the message
    let response = await chatSession.sendMessage({ message: userMessage });

    let actionType = "NONE";
    let actionData = null;

    // Process tool calls if any
    let hasToolCalls = response.functionCalls && response.functionCalls.length > 0;

    while (hasToolCalls) {
      const functionCall = response.functionCalls[0];

      // Execute tool local logic
      const toolResult = await executeToolCall({
        name: functionCall.name,
        args: functionCall.args
      });

      // Save action metadata if we want special UI handling for certain tools
      if (functionCall.name === "navigate_to_results") {
        actionType = "VIEW_RESULTS";
        actionData = toolResult;
      } else if (functionCall.name === "create_booking_proposal") {
        actionType = "BOOKING_PROPOSAL";
        actionData = toolResult;
      } else if (functionCall.name === "search_equipment" && toolResult.length === 0) {
        actionType = "NO_RESULTS";
      }

      // Return tool response to the model
      response = await chatSession.sendMessage({
        message: [{
          functionResponse: {
            name: functionCall.name,
            response: toolResult
          }
        }]
      });

      // Check if there are more tools to call
      hasToolCalls = response.functionCalls && response.functionCalls.length > 0;
    }

    return {
      message: response.text,
      actionType,
      actionData
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: "Estou com dificuldades de ligação. Pode tentar pesquisar diretamente na plataforma.",
      actionType: "ERROR",
      actionData: {}
    };
  }
}
