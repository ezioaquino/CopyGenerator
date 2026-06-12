# ✍️ CopyGenerator.ai — Gerador de Copy com Inteligência Artificial

> **Bilingual Documentation / Documentação Bilíngue**
> Scroll down for the English version. / Role para baixo para a versão em inglês.

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=nodedotjs)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20(better--sqlite3)-003B57?logo=sqlite)](https://www.sqlite.org)
[![Gemini](https://img.shields.io/badge/IA-Google%20Gemini%20API-4285F4?logo=google)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 🇧🇷 Português

**CopyGenerator.ai** é uma aplicação web full-stack premium desenvolvida para profissionais de marketing, copywriters e empreendedores gerarem textos publicitários de alto impacto utilizando os frameworks mais consagrados do mercado. Alimentada pela **API do Gemini da Google**, a aplicação cria headlines, e-mails de vendas, anúncios para redes sociais e roteiros completos de VSL (Video Sales Letter).

O projeto foi construído com foco em boas práticas de portfólio para o GitHub: código modular, documentação completa, variáveis de ambiente isoladas, tratamento global de erros e medidas robustas de segurança.

---

### ✨ Funcionalidades

| # | Funcionalidade | Descrição |
|---|----------------|-----------|
| 1 | **Geração de Copy com IA** | Inputs de nome do produto, descrição e público-alvo geram textos altamente persuasivos via Gemini |
| 2 | **5 Frameworks** | AIDA, PAS, BAB, FAB e Roteiro VSL completo |
| 3 | **5 Tons de Voz** | Persuasivo, Profissional, Urgente (escassez), Emocional e Amigável |
| 4 | **Histórico com Filtros** | Busca em tempo real + filtro por favoritos na lista lateral |
| 5 | **Editor Inline** | Edite o texto gerado pela IA diretamente na tela, com salvamento no banco |
| 6 | **Exportação Multi-Formato** | Download em `.txt` ou `.pdf` formatado com metadados do produto |
| 7 | **Dashboard de Estatísticas** | Gráficos de barras com distribuição por framework e tom de voz |
| 8 | **Sistema de Favoritos** | Marque e filtre suas melhores copies com um clique |

---

### 🛡️ Segurança Implementada

- **SQL Injection**: Uso estrito de prepared statements via `better-sqlite3`
- **Anti-XSS**: Sanitização de inputs no backend antes de enviar ao Gemini ou salvar no SQLite
- **Rate Limiting**: `express-rate-limit` — endpoint de geração limitado a **15 req/hora por IP**
- **HTTP Headers**: Cabeçalhos de segurança via `helmet`
- **CORS controlado**: Configurável por variável de ambiente para produção

---

### 🗂️ Estrutura do Projeto

```
copy-generator/
├── backend/
│   ├── src/
│   │   ├── db/               # Inicialização e schema do SQLite
│   │   ├── middleware/        # Validação de inputs e tratamento de erros
│   │   ├── routes/            # Rotas Express da API
│   │   └── index.js           # Entry point do servidor
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CopyForm.jsx      # Formulário de configuração da copy
│   │   │   ├── CopyOutput.jsx    # Exibição, edição e exportação do resultado
│   │   │   ├── HistoryList.jsx   # Lista do histórico com busca e filtros
│   │   │   └── StatsPanel.jsx    # Dashboard de estatísticas
│   │   ├── styles/
│   │   │   └── global.css        # Sistema de design CSS puro (dark mode premium)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── docker-compose.yml
├── .gitignore
├── API.md
└── README.md
```

---

### 🚀 Instalação e Execução Local

#### Pré-requisitos
- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **Chave de API Gemini** — gratuita em [aistudio.google.com](https://aistudio.google.com/app/apikey)

#### 1. Clone o repositório

```bash
git clone https://github.com/ezioaquino/copy-generator.git
cd copy-generator
```

#### 2. Configure e inicie o Backend

```bash
cd backend
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Abra o arquivo `.env` e preencha sua chave:

```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=sua_chave_do_gemini_aqui
DATABASE_PATH=src/db/copy_generator.db
```

Inicie o servidor:

```bash
npm run dev
# Servidor rodando em: http://localhost:3001
```

#### 3. Configure e inicie o Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
# Aplicação disponível em: http://localhost:5173
```

> O Vite faz o proxy automático de todas as chamadas `/api/*` para `http://localhost:3001` via configuração no `vite.config.js`.

---

### 🐳 Execução com Docker

> **Pré-requisito:** Docker Desktop instalado e rodando.

```bash
# Na raiz do projeto, garanta que backend/.env existe com GEMINI_API_KEY preenchida
# Depois execute:
docker compose up --build

# Backend:  http://localhost:3001
# Frontend: http://localhost:5173
```

Para parar os containers:

```bash
docker compose down
```

> O banco SQLite fica persistido no volume `./backend/data/` — os dados sobrevivem a restarts.

---

### 📡 Endpoints da API

Documentação completa dos endpoints, payloads e exemplos de resposta:
👉 **[API.md](./API.md)**

**Resumo rápido:**

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Health check do servidor |
| `GET` | `/api/copies` | Lista histórico de copies |
| `POST` | `/api/copies/generate` | Gera nova copy via Gemini IA |
| `PATCH` | `/api/copies/:id/favorite` | Favorita / desfavorita uma copy |
| `PUT` | `/api/copies/:id` | Atualiza o texto de uma copy |
| `DELETE` | `/api/copies/:id` | Remove uma copy permanentemente |
| `GET` | `/api/copies/stats` | Retorna dados agregados para o dashboard |

---

### 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 19, Vite 8, CSS Puro (Design System próprio), Lucide React, jsPDF |
| **Backend** | Node.js, Express 4, Better-SQLite3, Helmet, Morgan, Express Rate Limit, Dotenv |
| **IA** | Google Gemini API |
| **Banco de Dados** | SQLite (via better-sqlite3) |
| **DevOps** | Docker, Docker Compose |

---

### 📄 Licença

Este projeto está licenciado sob a **Licença MIT**.
Desenvolvido por **Ezio Aquino** · 2026

---
---

## 🇺🇸 English

**CopyGenerator.ai** is a premium full-stack web application designed for marketers, copywriters, and entrepreneurs to generate high-converting promotional and creative texts. Powered by **Google's Gemini API**, it leverages proven marketing frameworks to create headlines, sales emails, social media ads, and complete VSL (Video Sales Letter) scripts.

---

### ✨ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **AI Copy Generation** | Product inputs feed the Gemini model to produce persuasive marketing text |
| 2 | **5 Frameworks** | AIDA, PAS, BAB, FAB, and full VSL Script |
| 3 | **5 Tones of Voice** | Persuasive, Professional, Urgent (scarcity), Emotional, and Friendly |
| 4 | **History with Filters** | Real-time search + favorites filter in the sidebar panel |
| 5 | **Inline Editor** | Edit AI-generated copy directly on screen, persisting changes to the database |
| 6 | **Multi-Format Export** | Download as `.txt` or a formatted `.pdf` with product metadata |
| 7 | **Statistics Dashboard** | Bar charts showing framework and tone-of-voice distribution |
| 8 | **Favorites System** | Star and filter your best copies with one click |

---

### 🛡️ Security

- **SQL Injection**: Strictly using prepared statements via `better-sqlite3`
- **Anti-XSS**: Input sanitization on the backend before sending to Gemini or saving to SQLite
- **Rate Limiting**: `express-rate-limit` — generation endpoint limited to **15 req/hour per IP**
- **HTTP Headers**: Security headers via `helmet`
- **CORS**: Configurable via environment variable for production environments

---

### 🚀 Getting Started (Local Development)

#### Prerequisites
- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **Gemini API Key** — free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

#### 1. Clone the repository

```bash
git clone https://github.com/ezioaquino/copy-generator.git
cd copy-generator
```

#### 2. Set up and start the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your API key in `.env`:

```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_PATH=src/db/copy_generator.db
```

Start the server:

```bash
npm run dev
# Server running at: http://localhost:3001
```

#### 3. Set up and start the Frontend

In a new terminal tab:

```bash
cd frontend
npm install
npm run dev
# App available at: http://localhost:5173
```

---

### 🐳 Running with Docker

```bash
# Ensure backend/.env exists with GEMINI_API_KEY filled in, then:
docker compose up --build

# Backend:  http://localhost:3001
# Frontend: http://localhost:5173
```

---

### 📡 API Reference

Full endpoint documentation with request/response examples:
👉 **[API.md](./API.md)**

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Server health check |
| `GET` | `/api/copies` | List copy history |
| `POST` | `/api/copies/generate` | Generate new copy via Gemini |
| `PATCH` | `/api/copies/:id/favorite` | Toggle favorite status |
| `PUT` | `/api/copies/:id` | Update copy text |
| `DELETE` | `/api/copies/:id` | Permanently delete a copy |
| `GET` | `/api/copies/stats` | Aggregated stats for dashboard |

---

### 📄 License

This project is licensed under the **MIT License**.
Built by **Ezio Aquino** · 2026
