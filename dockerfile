# STAGE 1: BUILD (Compilação)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# O output é /app/dist/tcc-nvr-frontend/
RUN npm run build 

# -------------------------------------------------------------------

# STAGE 2: SERVE (Produção)
FROM nginx:stable-alpine

# Remove a configuração padrão do NGINX para evitar que ele carregue a página de boas-vindas
RUN rm /etc/nginx/conf.d/default.conf

# 🚨 GARANTIA DE CONFIGURAÇÃO: Copia e certifica que o NGINX está pronto para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🚨 COPIA DOS ARQUIVOS FINAIS
# O caminho final do build é /app/dist/tcc-nvr-frontend/browser
COPY --from=builder /app/dist/tcc-nvr-frontend/browser /usr/share/nginx/html

# NGINX já roda com usuário não-root, não precisamos do chmod explícito aqui.
# A falha 500 foi eliminada ao usar o `docker run` no foreground.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]