# Etapa de construcción
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar resto del código
COPY . .

# Puerto de exposición
EXPOSE 3000

# Comando para iniciar el servicio
CMD ["node", "src/index.js"]