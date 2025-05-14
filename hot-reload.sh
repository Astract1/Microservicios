#!/bin/bash

# Colores para los mensajes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}Iniciando Microservicios con Hot Reload en Docker${NC}"
echo -e "${BLUE}====================================================${NC}"

# Verificar si Docker está instalado y en ejecución
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker no está instalado o no está en el PATH.${NC}"
    echo "Instala Docker y asegúrate de que esté funcionando."
    exit 1
fi

# Crear .env para Docker si no existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creando archivo .env con valores por defecto...${NC}"
    cat > .env << EOL
# Variables de entorno para Docker
DB_ROOT_PASSWORD=admin
DB_PASSWORD=db_password
WEATHER_API_KEY=sample_key
IQAIR_API_KEY=sample_key
EOL
    echo -e "${GREEN}Archivo .env creado.${NC}"
fi

# Verificar dependencias del proyecto
echo -e "${YELLOW}Verificando dependencias del proyecto...${NC}"

# Verificar node_modules en frontend
if [ ! -d "packages/frontend/node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias del frontend...${NC}"
    (cd packages/frontend && npm install)
fi

# Verificar node_modules en node-monitoring
if [ ! -d "packages/node-monitoring/node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias de node-monitoring...${NC}"
    (cd packages/node-monitoring && npm install)
fi

# Verificar node_modules en node-education
if [ ! -d "packages/node-education/node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias de node-education...${NC}"
    (cd packages/node-education && npm install)
fi

# Detener todos los contenedores previamente
echo -e "${YELLOW}Deteniendo contenedores existentes...${NC}"
docker-compose -f docker-compose.dev.yml down

# Eliminar volúmenes huérfanos si es necesario
echo -e "${YELLOW}Limpiando volúmenes huérfanos...${NC}"
docker volume prune -f

# Preparando imágenes
echo -e "${CYAN}Iniciando servicios con docker-compose.dev.yml...${NC}"
echo "Este proceso puede tardar unos minutos en la primera ejecución..."

# Ejecutar docker-compose para desarrollo
docker-compose -f docker-compose.dev.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: No se pudieron iniciar los servicios.${NC}"
    exit 1
fi

# Mostrar estado de los contenedores
echo
echo -e "${YELLOW}Estado de los contenedores:${NC}"
docker-compose -f docker-compose.dev.yml ps
echo

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}SERVICIOS INICIADOS CON HOT RELOAD${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "${CYAN}Frontend:${NC} http://localhost:3000"
echo -e "${CYAN}API Gateway:${NC} http://localhost"
echo -e "${CYAN}Monitoring API:${NC} http://localhost:3001/api"
echo -e "${CYAN}Education API:${NC} http://localhost:3002/api"
echo -e "${CYAN}Risk API:${NC} http://localhost:5002/api"
echo -e "${CYAN}Prevention API:${NC} http://localhost:5001/api"
echo -e "${CYAN}PHPMyAdmin:${NC} http://localhost:8080"
echo -e "${BLUE}====================================================${NC}"

# Función para mostrar el menú
show_menu() {
    echo
    echo -e "${YELLOW}OPCIONES:${NC}"
    echo "1 - Ver logs en tiempo real"
    echo "2 - Ver estado de los contenedores"
    echo "3 - Reiniciar servicios"
    echo "4 - Detener servicios y salir"
    echo
    read -p "Selecciona una opción (1-4): " opcion
    
    case $opcion in
        1)
            echo -e "${YELLOW}Mostrando logs en tiempo real (presiona Ctrl+C para volver al menú)...${NC}"
            docker-compose -f docker-compose.dev.yml logs -f
            # Al salir con Ctrl+C, vuelve al menú
            trap - SIGINT
            show_menu
            ;;
        2)
            echo
            echo -e "${YELLOW}Estado actual de los contenedores:${NC}"
            docker-compose -f docker-compose.dev.yml ps
            show_menu
            ;;
        3)
            echo -e "${YELLOW}Reiniciando todos los servicios...${NC}"
            docker-compose -f docker-compose.dev.yml restart
            echo -e "${GREEN}Servicios reiniciados.${NC}"
            show_menu
            ;;
        4)
            echo -e "${YELLOW}Deteniendo servicios...${NC}"
            docker-compose -f docker-compose.dev.yml down
            echo -e "${BLUE}====================================================${NC}"
            echo -e "${GREEN}Servicios detenidos.${NC}"
            echo -e "${BLUE}====================================================${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Opción no válida.${NC}"
            show_menu
            ;;
    esac
}

# Capturar SIGINT (Ctrl+C) solo para el menú principal, no para los logs
trap "echo -e '${RED}Operación cancelada.${NC}'; exit 1" SIGINT

# Mostrar el menú
show_menu 