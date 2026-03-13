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

# Copiar la configuración de Caddy
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
