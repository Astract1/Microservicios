#!/bin/bash

# Detener y eliminar los contenedores existentes
echo "Deteniendo contenedores existentes..."
docker stop ui-monitoring || true
docker rm ui-monitoring || true

# Eliminar imágenes existentes
echo "Eliminando imágenes existentes..."
docker rmi microservicios-ui-monitoring || true

# Reconstruir el contenedor
echo "Reconstruyendo ui-monitoring..."
docker-compose build ui-monitoring

# Iniciar el contenedor
echo "Iniciando ui-monitoring..."
docker-compose up -d ui-monitoring

# Mostrar los logs
echo "Mostrando logs de ui-monitoring..."
docker logs ui-monitoring -f 