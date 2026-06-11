# ============================================================
# Dockerfile — Frontend CopyGenerator.ai
# Multi-stage build: builder (Vite) → runner (Nginx)
# Imagem base: Node 20 Alpine → Nginx Alpine
# ============================================================

# -------------------------------------------------------
# Stage 1: builder
# Compila o projeto React com o Vite e gera o /dist
# -------------------------------------------------------
FROM node:20-alpine AS builder

# Metadados da imagem
LABEL maintainer="Antigravity Dev" \
      description="Frontend do CopyGenerator.ai — React + Vite"

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os manifests primeiro para cache de camada Docker
# (reinstala deps somente quando package.json mudar)
COPY package*.json ./

# Instala todas as dependências (inclui devDependencies necessárias para o build)
RUN npm ci && npm cache clean --force

# Copia o restante do código-fonte
COPY . .

# Executa o build de produção do Vite
# O resultado é gerado em /app/dist
RUN npm run build

# -------------------------------------------------------
# Stage 2: runner
# Nginx Alpine serve os arquivos estáticos do /dist
# Imagem final extremamente leve (~25MB total)
# -------------------------------------------------------
FROM nginx:alpine AS runner

# Remove a configuração padrão do Nginx para substituir pela nossa
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração personalizada com SPA fallback e proxy da API
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copia os arquivos do build Vite para o diretório servido pelo Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx Alpine já roda como usuário 'nginx' por padrão (não-root)
# Ajusta permissões para garantir leitura dos arquivos estáticos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    # Garante que o Nginx pode escrever nos logs como usuário não-root
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Troca para o usuário sem privilégios
USER nginx

# Porta exposta pelo container Nginx (mapeada para 5173 no docker-compose)
EXPOSE 80

# Inicia o Nginx em modo foreground (necessário para Docker)
CMD ["nginx", "-g", "daemon off;"]
