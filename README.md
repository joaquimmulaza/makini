# Makini — Plataforma Integrada de Serviços e Equipamentos Agrícolas

**Makini** é uma plataforma web que conecta agricultores angolanos a fornecedores de equipamentos, transportes e serviços agrícolas. Através de um catálogo digital simples e acessível, qualquer agricultor pode descobrir, filtrar e solicitar a reserva de um tractor, camião ou serviço de rega em poucos cliques — sem paragens na produção por falta de recursos.

---

## O Problema que a Makini Resolve

O sector agrícola em Angola enfrenta um desafio estrutural: agricultores que precisam de equipamentos e serviços específicos para a sua campanha não conseguem facilmente localizá-los, contactar fornecedores ou coordenar a logística — especialmente em regiões rurais. O resultado são paragens na produção, perda de colheita e ineficiência operacional.

A Makini resolve isto ao criar uma **plataforma de dois lados**:

- **Agricultores** encontram e reservam equipamentos, transportes e serviços por categoria, localização e disponibilidade.
- **Fornecedores** publicam os seus recursos (máquinas, camiões, mão de obra especializada) e gerem os pedidos de reserva recebidos — rentabilizando activos que de outra forma ficariam parados.

---

## Funcionalidades Principais

### Para Agricultores
- **Catálogo filtrável** por categoria (Preparação do Solo, Plantio e Sementeira, Aplicação de Insumos, Colheita) e por localização.
- **Reserva de recursos** com selecção de datas de início e fim, e campo de contexto/finalidade do uso.
- **Painel pessoal** (`/minhas-reservas`) para acompanhar o estado de todos os pedidos (Pendente, Aprovada, Rejeitada).

### Para Fornecedores
- **Publicação de anúncios** com tipo de recurso (Equipamento, Transporte ou Serviço), categoria, especificação técnica, preço em Kwanzas, localização e imagem.
- **Gestão de reservas** recebidas com aprovação ou rejeição directa no painel (`/dashboard`).
- **Edição e remoção** de anúncios publicados.

### Makini Agent (IA)
- **Assistente conversacional** embebido na plataforma, alimentado pelo modelo **Gemini 2.5 Flash** (Google AI).
- O agricultor descreve a sua necessidade em linguagem natural (ex: *"Preciso de um tractor no Huambo para amanhã"*) e o agente pesquisa a base de dados, interpreta intenções e redireciona para os resultados filtrados.
- Suporta normalização de ortografia variante e mapeamento de intenção para categoria (ex: "lavrar" → Preparação do Solo).

---

## Arquitectura e Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite |
| Roteamento | React Router DOM v7 |
| Estilização | Tailwind CSS, Framer Motion |
| Componentes UI | Radix UI (Dialog, Slot), Lucide React, Heroicons |
| Carousel / Slider | Swiper |
| Notificações | React Hot Toast |
| Backend / BaaS | Supabase (PostgreSQL, Auth, Storage) |
| IA / Agente | Google Gemini 2.5 Flash (`@google/genai`) |
| Testes | Vitest, React Testing Library |
| Deploy | Vercel |

### Modelo de Dados (Supabase)

```
profiles        — Utilizadores (agricultores e fornecedores), ligado ao auth.users
listings        — Anúncios de equipamentos, transportes e serviços (tipo, categoria, preço, localização)
reservas        — Pedidos de reserva entre agricultores e fornecedores (com status: pendente/aprovada/rejeitada)
```

Os tipos de enumeração usados no esquema são:
- `user_role`: `agricultor` | `fornecedor`
- `listing_type`: `equipamento` | `transporte` | `servico`
- `listing_status`: `imediata` | `amanha` | `indisponivel`
- `reserva_status`: `pendente` | `aprovada` | `rejeitada` | `cancelada`

### Categorias de Recursos

| Categoria | Descrição |
|---|---|
| Preparação do Solo | Tractores, charruas, grades e equipamentos de lavra |
| Plantio e Sementeira | Semeadoras, plantadoras e equipamentos de plantio |
| Aplicação de Insumos | Pulverizadores, distribuidores de fertilizante e rega |
| Colheita | Colheitadeiras, debulhadoras e transporte de produção |

### Fluxo da Aplicação

```
/              → Página de entrada com Hero, Categorias e "Como Funciona"
/buscar        → Feed de anúncios com filtros por categoria e localização
/register      → Registo com escolha de perfil (Agricultor / Fornecedor)
/login         → Autenticação via Supabase Auth
/dashboard     → Painel do Fornecedor (reservas recebidas + gestão de anúncios)
/minhas-reservas → Painel do Agricultor (pedidos submetidos e estados)
```

---

## Executar Localmente

### Pré-requisitos
- **Node.js** 18 ou superior
- **npm**
- Uma conta e projecto no [Supabase](https://supabase.com)
- Uma chave de API do [Google AI Studio](https://aistudio.google.com) (Gemini)

### 1. Clonar o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd makini-app
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um ficheiro `.env` na raiz do projecto:
```env
VITE_SUPABASE_URL="https://seu-id-do-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua_chave_anonima_publica"
VITE_GEMINI_API_KEY="sua_chave_api_gemini"
```

### 4. Configurar a base de dados (Supabase)
Execute os seguintes ficheiros SQL no **SQL Editor** do painel do Supabase, pela ordem indicada:

1. `supabase-schema.sql` — Cria as tabelas `profiles` e `listings`, enums, políticas RLS e o trigger de verificação automática de fornecedores.
2. `reservas-schema.sql` — Cria a tabela `reservas` e as respectivas políticas RLS.
3. `auth-trigger.sql` — Cria o trigger que preenche o perfil do utilizador automaticamente após o registo.

Para popular a base de dados com dados de exemplo (opcional):
```bash
node seed-db.js
node seed-listings.js
node create-categories.js
```

> **Armazenamento de imagens:** Crie um bucket público chamado `listings` no Supabase Storage para activar o upload de imagens nos anúncios.

### 5. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
A aplicação ficará disponível em `http://localhost:5173`.

---

## Testes

```bash
npm run test
```

Os testes cobrem os fluxos de autenticação (Login e Registo) utilizando Vitest e React Testing Library.

---

## Build para Produção

```bash
npm run build
```

Para pré-visualizar o build localmente:
```bash
npm run preview
```

O projecto inclui um `vercel.json` com configuração de rewrite para suportar o roteamento client-side no Vercel.

---

## Estrutura do Projecto

```
makini-app/
├── src/
│   ├── components/
│   │   ├── agent/          # Makini Agent (chatbot UI: botão, modal, chat, input)
│   │   ├── ui/             # Componentes base (Button, Card, Badge, Dialog)
│   │   └── layout.jsx      # Header e Footer globais
│   ├── contexts/
│   │   └── AuthContext.jsx # Contexto de autenticação global (Supabase Auth)
│   ├── hooks/
│   │   └── useMakiniAgent.js # Lógica de estado e comunicação do agente IA
│   ├── lib/
│   │   ├── geminiAgent.js  # Integração com Gemini API (function calling + tools)
│   │   ├── supabase.js     # Cliente Supabase
│   │   ├── categorias.js   # Definição central das categorias da plataforma
│   │   └── utils.js        # Utilitários gerais
│   ├── pages/
│   │   ├── Home.jsx        # Landing page
│   │   ├── auth/           # Login e Registo
│   │   ├── feed/           # SearchListings (catálogo + reserva)
│   │   └── dashboard/      # Painéis do Agricultor e do Fornecedor
│   └── main.jsx            # Ponto de entrada e definição de rotas
├── supabase-schema.sql     # Schema principal (profiles + listings)
├── reservas-schema.sql     # Schema de reservas
├── auth-trigger.sql        # Trigger de criação de perfil pós-registo
└── vercel.json             # Configuração de deploy (SPA rewrite)
```

---

*Makini — Conectar quem produz com quem tem os recursos para produzir mais.*
