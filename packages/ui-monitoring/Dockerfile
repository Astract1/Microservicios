# Etapa de construcción
FROM node:18-alpine as build

WORKDIR /app

# Configurar la variable de entorno para solucionar el problema de OpenSSL
ENV NODE_OPTIONS=--openssl-legacy-provider

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos del proyecto
COPY . .

# Construir la aplicación
RUN npm run build


# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de construcción desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]