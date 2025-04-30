# Etapa de construcción
FROM node:18-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de paquetes
COPY package*.json ./

# Instalar dependencias con flag para ignorar los errores de peerDependencies
RUN npm install --legacy-peer-deps

# Copiar todo el código de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine

# Copiar el build de la aplicación
COPY --from=builder /app/build /usr/share/nginx/html

# Crear directorio para la configuración de nginx
RUN mkdir -p /etc/nginx/conf.d

# Copiar la configuración de nginx
COPY nginx.conf.template /etc/nginx/conf.d/default.conf

# Copiar la página de health check por si acaso
RUN echo '{"status":"UP"}' > /usr/share/nginx/html/health

# Exponer puerto 80
EXPOSE 80

# Ejecutar nginx
CMD ["nginx", "-g", "daemon off;"] 