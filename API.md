# 🔌 Documentação da API — CopyGenerator.ai

Esta é a documentação técnica da API REST do **CopyGenerator.ai**. A API gerencia a integração com o modelo Gemini da Google para geração de textos de marketing (copywriting) e gerencia o histórico de copies persistidas em um banco SQLite.

O servidor roda por padrão em: `http://localhost:3001`

---

## 🛡️ Políticas de Segurança & Rate Limiting

A API implementa limites de requisições por IP para proteção do servidor e evitar abuso nos custos de tokens da API do Gemini:
- **Geração de Copy (`POST /api/copies/generate`)**: Máximo de **15 requisições por hora** por IP.
- **Outras Rotas (`GET`, `PUT`, `PATCH`, `DELETE`)**: Máximo de **200 requisições a cada 15 minutos** por IP.

Todas as entradas do formulário são sanitizadas contra **HTML Injection / Script Injection (Stored XSS)** no backend antes de serem enviadas para o Gemini ou salvas no banco de dados.

---

## 📑 Endpoints da API

### 1. Health Check do Servidor
Verifica se o backend está online.

- **URL:** `/`
- **Método:** `GET`
- **Resposta de Sucesso (200 OK):**
```json
{
  "status": "online",
  "message": "API do Gerador de Copy com IA está ativa e funcionando!",
  "endpoints": {
    "stats": "GET /api/copies/stats",
    "list": "GET /api/copies",
    "generate": "POST /api/copies/generate",
    "favorite": "PATCH /api/copies/:id/favorite",
    "update": "PUT /api/copies/:id",
    "delete": "DELETE /api/copies/:id"
  }
}
```

---

### 2. Gerar Nova Copy (via Gemini IA)
Recebe as informações do produto, aciona o Gemini e salva o resultado no banco.

- **URL:** `/api/copies/generate`
- **Método:** `POST`
- **Headers:** `Content-Type: application/json`
- **Parâmetros do Body:**
  - `productName` (string, máx. 100 caracteres) — *Obrigatório*
  - `productDescription` (string, máx. 2000 caracteres) — *Obrigatório*
  - `targetAudience` (string, máx. 300 caracteres) — *Obrigatório*
  - `tone` (string) — *Obrigatório*. Ex: `"Persuasivo e Vendedor"`, `"Profissional e Técnico"`
  - `framework` (string) — *Obrigatório*. Opções: `"AIDA"`, `"PAS"`, `"BAB"`, `"FAB"`, `"VSL"`
  - `copyType` (string) — *Obrigatório*. Ex: `"Anúncio de Rede Social"`, `"E-mail de Vendas"`

- **Exemplo de Payload (Request Body):**
```json
{
  "productName": "Sabores da América Latina",
  "productDescription": "Livro digital com 50 receitas tradicionais da culinária latina explicadas passo a passo.",
  "targetAudience": "Entusiastas de culinária que gostam de cozinhar em casa",
  "tone": "Persuasivo e Vendedor",
  "framework": "AIDA",
  "copyType": "E-mail de Vendas de Alta Conversão"
}
```

- **Resposta de Sucesso (201 Created):**
```json
{
  "id": "e63d596b-4e12-4217-bc45-e630cc6741b2",
  "product_name": "Sabores da América Latina",
  "product_description": "Livro digital com 50 receitas tradicionais da culinária latina explicadas passo a passo.",
  "target_audience": "Entusiastas de culinária que gostam de cozinhar em casa",
  "tone": "Persuasivo e Vendedor",
  "framework": "AIDA",
  "copy_type": "E-mail de Vendas de Alta Conversão",
  "generated_text": "**[ATENÇÃO]**\nVocê está pronto para viajar pelos sabores mais marcantes sem sair da sua cozinha?...",
  "prompt_used": "Você é um Copywriter profissional sênior...",
  "is_favorite": 0,
  "created_at": "2026-06-11 12:48:30"
}
```

---

### 3. Listar Histórico de Copies
Recupera o histórico de copies com suporte a filtros locais.

- **URL:** `/api/copies`
- **Método:** `GET`
- **Query Parameters (Opcionais):**
  - `search` (string) — Busca termo no nome do produto, texto gerado ou público-alvo.
  - `framework` (string) — Filtra por framework específico (AIDA, PAS, etc).
  - `tone` (string) — Filtra pelo tom de voz.
  - `isFavorite` (boolean `true`/`false`) — Retorna apenas favoritas se `true`.

- **Resposta de Sucesso (200 OK):**
```json
[
  {
    "id": "e63d596b-4e12-4217-bc45-e630cc6741b2",
    "product_name": "Sabores da América Latina",
    "product_description": "Livro digital...",
    "target_audience": "Entusiastas de culinária...",
    "tone": "Persuasivo e Vendedor",
    "framework": "AIDA",
    "copy_type": "E-mail de Vendas de Alta Conversão",
    "generated_text": "**[ATENÇÃO]**\n...",
    "prompt_used": "...",
    "is_favorite": 1,
    "created_at": "2026-06-11 12:48:30"
  }
]
```

---

### 4. Favoritar / Desfavoritar Copy
Alterna o status de favorita de uma copy específica.

- **URL:** `/api/copies/:id/favorite`
- **Método:** `PATCH`
- **Resposta de Sucesso (200 OK):**
```json
{
  "id": "e63d596b-4e12-4217-bc45-e630cc6741b2",
  "is_favorite": 1
}
```

---

### 5. Editar Texto da Copy
Permite atualizar manualmente o texto de uma copy gerada.

- **URL:** `/api/copies/:id`
- **Método:** `PUT`
- **Headers:** `Content-Type: application/json`
- **Parâmetros do Body:**
  - `generatedText` (string, máx 10.000 caracteres) — *Obrigatório*

- **Exemplo de Payload (Request Body):**
```json
{
  "generatedText": "Texto editado manualmente pelo usuário para fins de customização de palavras."
}
```

- **Resposta de Sucesso (200 OK):** Retorna o objeto da copy atualizado.

---

### 6. Deletar Copy
Remove uma copy permanentemente do histórico do banco de dados.

- **URL:** `/api/copies/:id`
- **Método:** `DELETE`
- **Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "id": "e63d596b-4e12-4217-bc45-e630cc6741b2"
}
```

---

### 7. Buscar Estatísticas do Painel
Retorna contagem agregada de dados para popular painéis gráficos no frontend.

- **URL:** `/api/copies/stats`
- **Método:** `GET`
- **Resposta de Sucesso (200 OK):**
```json
{
  "totalCopies": 24,
  "totalFavorites": 5,
  "frameworkDistribution": [
    { "framework": "AIDA", "count": 12 },
    { "framework": "PAS", "count": 8 },
    { "framework": "VSL", "count": 4 }
  ],
  "toneDistribution": [
    { "tone": "Persuasivo e Vendedor", "count": 15 },
    { "tone": "Emocional e Narrativo", "count": 6 },
    { "tone": "Profissional e Técnico", "count": 3 }
  ]
}
```

---

## ❌ Tratamento de Erros Standard

Caso ocorra um erro de validação ou de servidor, a API responde no seguinte padrão JSON:

```json
{
  "error": true,
  "message": "Campos obrigatórios ausentes ou inválidos: productName",
  "status": 400
}
```

### Principais Status HTTP Utilizados:
- `400 Bad Request`: Parâmetros ausentes, formato incorreto ou limite de caracteres excedido.
- `404 Not Found`: Registro de copy não encontrado no banco de dados.
- `429 Too Many Requests`: Limite de requisições do Rate Limiting excedido.
- `500 Internal Server Error`: Falha inesperada ou erro de comunicação com a API do Gemini.
