#!/bin/bash

# Script para iniciar todos los servicios con Hot Reload

# Colores para los mensajes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}Iniciando servicios con Hot Reload activado${NC}"
echo -e "${BLUE}====================================================${NC}"

# Función para mostrar mensajes
show_message() {
  echo -e "${YELLOW}[$(date +%T)]${NC} ${CYAN}$1${NC}"
}

# Función para iniciar servicios Node.js
start_node_service() {
  local service_dir=$1
  local service_name=$2
  local port=$3
  
  show_message "Iniciando servicio: $service_name en el puerto $port..."
  
  cd "packages/$service_dir" || { 
    echo -e "${RED}Error: No se pudo acceder al directorio $service_dir${NC}"
    return 1
  }
  
  # Verificar si nodemon está instalado
  if ! npm list -g nodemon > /dev/null 2>&1; then
    show_message "Instalando nodemon globalmente..."
    npm install -g nodemon
  fi
  
  # Iniciar servicio con nodemon
  PORT=$port npm run hot &
  
  # Guardar PID del proceso
  echo $! > "./.$service_name.pid"
  
  show_message "Servicio $service_name iniciado con PID $(cat ./.$service_name.pid)"
  
  cd ../../ || { 
    echo -e "${RED}Error: No se pudo volver al directorio raíz${NC}"
    return 1
  }
}

# Iniciar servicios en paralelo
start_node_service "node-monitoring" "monitoring" "3001"
start_node_service "node-education" "education" "3002"
start_node_service "node-service" "node-service" "3003"

# Iniciar el frontend con Hot Reload
show_message "Iniciando servicio frontend en el puerto 3000..."
cd "packages/frontend" || { 
  echo -e "${RED}Error: No se pudo acceder al directorio frontend${NC}"
  exit 1
}

# Verificar y configurar entorno para React
if [ ! -f ".env.development" ]; then
  show_message "Creando archivo .env.development para el frontend..."
  cat > .env.development << EOL
# Configuración para React Fast Refresh
FAST_REFRESH=true
CHOKIDAR_USEPOLLING=true
BROWSER=none
REACT_APP_HOT_RELOAD=true
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WEATHER_API_URL=http://localhost:3001/api/weather
REACT_APP_EDUCATION_API_URL=http://localhost:3002/api
REACT_APP_RISK_API_URL=http://localhost:3003/api
EOL
fi

# Iniciar frontend
PORT=3000 npm run start:hot &
echo $! > "./.frontend.pid"
show_message "Frontend iniciado con PID $(cat ./.frontend.pid)"

# Volver al directorio raíz
cd ../../

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}Todos los servicios iniciados con Hot Reload${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "${CYAN}Frontend:${NC} http://localhost:3000"
echo -e "${CYAN}Monitoring API:${NC} http://localhost:3001/api"
echo -e "${CYAN}Education API:${NC} http://localhost:3002/api"
echo -e "${CYAN}Node Service:${NC} http://localhost:3003"
echo -e "${BLUE}====================================================${NC}"
echo -e "${YELLOW}Presiona Ctrl+C para detener todos los servicios${NC}"

# Función para manejar la interrupción (Ctrl+C)
cleanup() {
  echo -e "\n${YELLOW}Deteniendo todos los servicios...${NC}"
  
  # Matar procesos por PID
  if [ -f "packages/frontend/.frontend.pid" ]; then
    kill -15 "$(cat packages/frontend/.frontend.pid)" 2>/dev/null
    rm "packages/frontend/.frontend.pid"
  fi
  
  if [ -f "packages/node-monitoring/.monitoring.pid" ]; then
    kill -15 "$(cat packages/node-monitoring/.monitoring.pid)" 2>/dev/null
    rm "packages/node-monitoring/.monitoring.pid"
  fi
  
  if [ -f "packages/node-education/.education.pid" ]; then
    kill -15 "$(cat packages/node-education/.education.pid)" 2>/dev/null
    rm "packages/node-education/.education.pid"
  fi
  
  if [ -f "packages/node-service/.node-service.pid" ]; then
    kill -15 "$(cat packages/node-service/.node-service.pid)" 2>/dev/null
    rm "packages/node-service/.node-service.pid"
  fi
  
  echo -e "${GREEN}Todos los servicios detenidos.${NC}"
  exit 0
}

# Registrar la función cleanup para cuando se presione Ctrl+C
trap cleanup SIGINT SIGTERM

# Mantener el script en ejecución
while true; do
  sleep 1
done 