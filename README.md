# Makini App

Makini é uma aplicação web moderna focada em anúncios, serviços e reservas. Construída com as tecnologias mais recentes do ecossistema React, ela oferece uma interface de usuário rápida, responsiva e dinâmica, integrada a um backend robusto no Supabase.

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 19, Vite
- **Estilização:** Tailwind CSS, Framer Motion (para animações fluidas), Lucide React & Heroicons (ícones)
- **Roteamento:** React Router DOM
- **Componentes de UI:** Radix UI, Swiper (carrosséis de imagens)
- **Backend & BaaS:** Supabase (PostgreSQL para Banco de Dados, Autenticação, Storage)
- **Testes:** Vitest, React Testing Library

## 📦 Estrutura do Projeto

O projeto possui uma estrutura bem definida de arquivos. Destacam-se na raiz do projeto os scripts voltados para a infraestrutura de dados:
- `src/`: Contém todo o código da aplicação React (componentes, páginas, lógica).
- `dist/`: Arquivos compilados gerados após o build para produção.
- `*.sql` e `*.js` (na raiz): Scripts para aplicar esquemas de banco, triggers de autenticação e preencher dados iniciais (seed).

## 🛠️ Como Executar Localmente

Siga as instruções abaixo para rodar a aplicação em sua máquina local.

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** (versão recomendada: 18+ ou 20+) e o gerenciador de pacotes **npm** instalados na sua máquina.

### 2. Baixando o repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd makini-app
```

### 3. Instalando dependências
```bash
npm install
```

### 4. Configurando Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto para fazer a conexão com seu banco Supabase. Preencha com suas próprias credenciais:

```env
VITE_SUPABASE_URL="https://seu-id-do-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua_chave_anonima_publica"
VITE_GEMINI_API_KEY="sua_chave_api_gemini"
```

### 5. Configurando o Banco de Dados (Supabase)
Antes da aplicação rodar com todo o seu potencial, você precisará replicar o esquema de dados no seu projeto do Supabase. Para isso, os arquivos da raiz ajudam muito:
- `supabase-schema.sql` / `reservas-schema.sql`: Use no painel SQL Editor do Supabase para criar as tabelas.
- `auth-trigger.sql`: Cria o gatilho para os usuários autenticados.
- Scripts JS (`seed-db.js`, `seed-listings.js`, `create-categories.js`, etc.): Podem ser rodados via Node para inserir categorias e anúncios iniciais no banco.

### 6. Iniciando o servidor de desenvolvimento
```bash
npm run dev
```
O Vite iniciará o servidor e fornecerá um link (normalmente `http://localhost:5173`) para acessar a aplicação pelo navegador.

## 🧪 Rodando Testes
Para garantir a integridade da aplicação, rode a suíte de testes da seguinte forma:
```bash
npm run test
```

## 🚀 Build para Produção
Ao finalizar, para gerar a versão otimizada da aplicação (pronta para deploy em serviços como Vercel ou Netlify):
```bash
npm run build
```
Você pode testar esse build localmente com:
```bash
npm run preview
```

---
*Desenvolvido com carinho para o projeto Makini.*
