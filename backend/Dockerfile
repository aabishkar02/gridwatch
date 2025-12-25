FROM node:20

WORKDIR /app

# Install dependencies first (cache friendly)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
