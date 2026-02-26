import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabase";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let aiClient = null;

if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

const MODEL = "gemini-2.5-flash";

const systemPrompt = `Você é o Makini Agent, um assistente de gestão logística agrícola especializado em Angola.
Seu papel é ajudar agricultores angolanos a encontrar e reservar equipamentos e serviços agrícolas.

Quando o utilizador fizer um pedido, NÃO faça perguntas de imediato. Siga esta ordem, rigorosamente:
1. Extraia os parâmetros disponíveis na mensagem original (ex: localização, tipo de equipamento, data).
2. Se houver o mínimo de informação (ex: apenas tipo de equipamento e localização, ou apenas tipo), use IMEDIATAMENTE a ferramenta \`search_equipment\` para procurar opções.
3. SEMPRE que encontrar resultados (count > 0 no retorno de search_equipment), chame também a ferramenta \`navigate_to_results\` com os filtros usados.
4. Responda ao utilizador informando o que foi encontrado de imediato.
5. SÓ DEPOIS de dar uma resposta útil, pergunte por 1 ou 2 dados que faltam para refinar a pesquisa (ex: data ou quantidade), caso seja necessário.
6. Sempre responda em Português de Angola, com linguagem simples, amigável e acionável.
7. Mantenha o contexto de toda a conversa.

Regra de Ouro: Nunca responda apenas com uma pergunta. Primeiro dê uma resposta/informação útil baseada no que o utilizador disse, e faça a pesquisa com o que tem.

Categorias de equipamentos disponíveis:
- Preparação do Solo
- Plantio e Sementeira
- Aplicação de Insumos
- Colheita`;

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
          enum: ["Preparação do Solo", "Plantio e Sementeira", "Aplicação de Insumos", "Colheita"],
          description: "Categoria exacta como aparece na base de dados"
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
        let query = supabase.from('listings').select('*, profiles(nome_completo)');

        if (args.location) query = query.ilike('localizacao', `%${args.location}%`);
        if (args.category) query = query.eq('categoria', args.category);
        if (args.equipment_type) {
          query = query.or(`titulo.ilike.%${args.equipment_type}%,capacidade_especificacao.ilike.%${args.equipment_type}%`);
        }
        if (args.max_price_per_day) query = query.lte('preco', args.max_price_per_day);

        const { data, error } = await query.limit(5);
        if (error) throw error;

        const items = data || [];
        // Return object instead of array to satisfy Gemini API protobuf requirements
        return {
          items: items,
          count: items.length,
          found: items.length > 0
        };
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
        tools: [{ functionDeclarations: tools }],
        temperature: 1.0,
      },
      history: formattedHistory.slice(0, -1),
    });

    // Send the message with a 30 second timeout to prevent infinite loading
    const sendWithTimeout = (fn) => Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000))
    ]);

    let response = await sendWithTimeout(() => chatSession.sendMessage({ message: userMessage }));

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
      } else if (functionCall.name === "search_equipment" && toolResult.count === 0) {
        actionType = "NO_RESULTS";
      }

      // Return tool response to the model
      response = await sendWithTimeout(() => chatSession.sendMessage({
        message: [{
          functionResponse: {
            name: functionCall.name,
            response: {
              result: Array.isArray(toolResult) ? { items: toolResult } : toolResult
            }
          }
        }]
      }));

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

    // Timeout error
    const errorMessage = error?.message || '';
    const errorCode = error?.status || '';

    if (errorMessage === 'timeout') {
      return {
        message: "⏳ O assistente demorou muito a responder. Por favor, tente novamente.",
        actionType: "ERROR",
        actionData: {}
      };
    }

    // 429 - Quota excedida
    if (errorMessage.includes('429') || errorCode === 'RESOURCE_EXHAUSTED') {
      // Tentar extrair o tempo de espera do erro
      const retryMatch = errorMessage.match(/retry in (\d+)/i);
      const waitSeconds = retryMatch ? parseInt(retryMatch[1]) : 60;
      const waitMinutes = Math.ceil(waitSeconds / 60);

      return {
        message: `⏳ O assistente está temporariamente ocupado (muitos pedidos). Por favor, aguarde ${waitMinutes} minuto${waitMinutes > 1 ? 's' : ''} e tente novamente.\n\nEnquanto isso, pode pesquisar directamente na plataforma.`,
        actionType: "RATE_LIMITED",
        actionData: { waitSeconds, waitMinutes }
      };
    }

    // 401 / 403 - Chave API inválida
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorCode === 'PERMISSION_DENIED') {
      return {
        message: "🔑 Erro de configuração do assistente. Por favor, contacte o suporte Makini.",
        actionType: "ERROR",
        actionData: {}
      };
    }

    // 500 / Erro de rede genérico
    return {
      message: "🌐 Estou com dificuldades de ligação. Pode tentar pesquisar directamente na plataforma enquanto resolvo o problema.",
      actionType: "ERROR",
      actionData: {}
    };
  }
}
