FROM node:22-alpine

WORKDIR /app

# Instala dependências primeiro para aproveitar cache de camadas do Docker
COPY package.json package-lock.json* ./
RUN npm install

# Copia código-fonte, servidor e scripts/dados de banco
COPY . .

# Compila o frontend React + Vite para a pasta dist/
RUN npm run build

# Porta padrão da aplicação no Coolify / Node
ENV NODE_ENV=production
ENV PORT=3031
EXPOSE 3031

CMD ["node", "server.js"]
