# Etapa de producción - usando directamente Nginx
FROM nginx:alpine

# Crear un archivo index.html básico
RUN echo '<!DOCTYPE html><html><head><title>Monitoreo Ambiental</title></head><body><h1>Sistema de Monitoreo Ambiental</h1><p>Versión 1.0</p></body></html>' > /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
