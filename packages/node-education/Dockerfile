# Etapa de construcción
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto de archivos del proyecto
COPY . .

# Puerto por defecto
EXPOSE 3002

# Comando para iniciar el servicio
CMD ["node", "src/index.js"]