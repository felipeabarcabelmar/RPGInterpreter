# Stage 1: Build
FROM node:20-slim as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

# Copiar el build de Vite
COPY --from=build /app/dist /usr/share/caddy

# Configuración básica de Caddy para SPA (Single Page Application)
RUN echo ':80 { \n\
    root * /usr/share/caddy \n\
    file_server \n\
    handle_errors { \n\
        rewrite * /index.html \n\
    } \n\
    try_files {path} /index.html \n\
}' > /etc/caddy/Caddyfile

EXPOSE 80
