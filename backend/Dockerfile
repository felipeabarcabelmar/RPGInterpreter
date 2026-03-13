FROM node:20-slim

WORKDIR /app

# Instalar dependencias necesarias para Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]
