# Etapa de construcción
FROM node:20-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Crear un usuario no privilegiado
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Establecer directorio de trabajo
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install
# Instalar específicamente las dependencias de Swagger
RUN npm install swagger-jsdoc swagger-ui-express

# Copiar resto del código
COPY . .

# Cambiar la propiedad de los archivos al usuario no privilegiado
RUN chown -R appuser:appgroup /app

# Cambiar al usuario no privilegiado
USER appuser

# Puerto de exposición
EXPOSE 3001

# Comando para iniciar el servicio
CMD ["node", "src/index.js"]