# ============================================================
# Dockerfile — Backend CopyGenerator.ai
# Multi-stage build: builder (instala deps) → runner (execução)
# Imagem base: Node 20 Alpine (mínima e segura)
# ============================================================

# -------------------------------------------------------
# Stage 1: builder
# Instala apenas as dependências de produção
# -------------------------------------------------------
FROM node:20-alpine AS builder

# Metadados da imagem
LABEL maintainer="Antigravity Dev" \
      description="Backend do CopyGenerator.ai — Node.js + Express + SQLite"

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de manifesto primeiro para aproveitar
# o cache de camadas do Docker (evita reinstalar deps sem mudança)
COPY package*.json ./

# Instala apenas dependências de produção (sem devDependencies)
RUN npm ci --only=production && npm cache clean --force

# -------------------------------------------------------
# Stage 2: runner
# Imagem final enxuta — apenas o necessário para executar
# -------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Cria o diretório persistente para o banco SQLite antes de
# definir o usuário não-root (garante permissões corretas)
RUN mkdir -p /app/data

# Cria um usuário e grupo sem privilégios para execução segura
# (princípio do menor privilégio — nunca rodar como root em produção)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copia as dependências instaladas no stage builder
COPY --from=builder /app/node_modules ./node_modules

# Copia o código-fonte da aplicação
COPY src ./src
COPY package.json ./

# Ajusta a propriedade dos arquivos para o usuário não-root
RUN chown -R appuser:appgroup /app

# Troca para o usuário sem privilégios
USER appuser

# Porta que o Express escuta (deve coincidir com PORT no .env)
EXPOSE 3001

# Variáveis de ambiente padrão (sobrescritas pelo docker-compose)
ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/app/data/copy_generator.db

# Comando de inicialização — usa o script de produção (sem nodemon)
CMD ["node", "src/index.js"]
