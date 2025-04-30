# Detener y eliminar los contenedores existentes
Write-Host "Deteniendo contenedores existentes..." -ForegroundColor Cyan
docker stop ui-monitoring
docker rm ui-monitoring

# Eliminar imágenes existentes
Write-Host "Eliminando imágenes existentes..." -ForegroundColor Cyan
docker rmi microservicios-ui-monitoring

# Reconstruir el contenedor
Write-Host "Reconstruyendo ui-monitoring..." -ForegroundColor Green
docker-compose build ui-monitoring

# Iniciar el contenedor
Write-Host "Iniciando ui-monitoring..." -ForegroundColor Green
docker-compose up -d ui-monitoring

# Mostrar los logs
Write-Host "Mostrando logs de ui-monitoring..." -ForegroundColor Yellow
docker logs ui-monitoring -f 