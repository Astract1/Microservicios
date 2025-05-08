# Etapa de construcción
FROM node:18 as build

WORKDIR /app

# Copiar archivos de configuración del proyecto
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Variables de entorno en tiempo de construcción
ARG REACT_APP_API_URL=/api
ARG REACT_APP_WEATHER_API_URL=/api/weather
ARG REACT_APP_EDUCATION_API_URL=/education-api
ARG REACT_APP_RISK_API_URL=/risk-api
ARG REACT_APP_PREVENTION_API_URL=/prevention-api
ARG REACT_APP_MAP_PROVIDER=openstreetmap
ARG REACT_APP_NODE_MONITORING_URL=http://localhost:3001

# Compilar la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:1.21-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copiar archivos de configuración de nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde la etapa de construcción
COPY --from=build /app/build /usr/share/nginx/html

# Archivo de verificación de salud para el healthcheck
RUN echo "OK" > /usr/share/nginx/html/health

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"] 