#!/bin/bash

# Script para iniciar los servicios de monitoreo ambiental
# Este script construirá y ejecutará los contenedores de Docker para el sistema de monitoreo

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_message() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Función para verificar si Docker está instalado y en ejecución
check_docker() {
  print_message "Verificando instalación de Docker..."
  
  if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instale Docker y vuelva a intentarlo."
    exit 1
  fi
  
  if ! docker info &> /dev/null; then
    print_error "El servicio Docker no está en ejecución. Por favor inicie Docker y vuelva a intentarlo."
    exit 1
  fi
  
  print_success "Docker está instalado y en ejecución."
}

# Función para verificar si docker-compose está instalado
check_docker_compose() {
  print_message "Verificando instalación de Docker Compose..."
  
  if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instale Docker Compose y vuelva a intentarlo."
    exit 1
  fi
  
  print_success "Docker Compose está instalado."
}

# Función para construir contenedores
build_containers() {
  print_message "Construyendo contenedores del sistema de monitoreo ambiental..."
  
  if docker-compose build; then
    print_success "Construcción de contenedores completada exitosamente."
  else
    print_error "Error al construir los contenedores."
    exit 1
  fi
}

# Función para iniciar contenedores
start_containers() {
  print_message "Iniciando contenedores del sistema de monitoreo ambiental..."
  
  if docker-compose up -d; then
    print_success "Contenedores iniciados exitosamente."
  else
    print_error "Error al iniciar los contenedores."
    exit 1
  fi
}

# Función para mostrar los logs de los contenedores
show_logs() {
  print_message "Mostrando logs de los contenedores... Presione Ctrl+C para detener."
  docker-compose logs -f
}

# Función para verificar el estado de los contenedores
check_container_status() {
  print_message "Verificando estado de los contenedores..."
  docker-compose ps
}

# Menú principal
clear
echo "=================================================="
echo "   Sistema de Monitoreo Ambiental - Iniciador    "
echo "=================================================="
echo ""

# Verificar requisitos
check_docker
check_docker_compose

# Preguntar qué acción realizar
echo ""
echo "Seleccione una opción:"
echo "1) Construir e iniciar contenedores"
echo "2) Solo iniciar contenedores (sin reconstruir)"
echo "3) Reconstruir contenedor ui-monitoring"
echo "4) Detener contenedores"
echo "5) Ver logs"
echo "6) Verificar estado de contenedores"
echo "7) Salir"
echo ""

read -p "Opción (1-7): " option

case $option in
  1)
    build_containers
    start_containers
    check_container_status
    print_success "Sistema de monitoreo ambiental iniciado. Acceda a http://localhost para ver la interfaz."
    ;;
  2)
    start_containers
    check_container_status
    print_success "Sistema de monitoreo ambiental iniciado. Acceda a http://localhost para ver la interfaz."
    ;;
  3)
    print_message "Reconstruyendo contenedor ui-monitoring..."
    if docker-compose build ui-monitoring; then
      print_success "Reconstrucción completada."
      
      print_message "Reiniciando contenedor ui-monitoring..."
      if docker-compose up -d --no-deps ui-monitoring; then
        print_success "Contenedor ui-monitoring reiniciado exitosamente."
      else
        print_error "Error al reiniciar el contenedor ui-monitoring."
      fi
    else
      print_error "Error al reconstruir el contenedor ui-monitoring."
    fi
    ;;
  4)
    print_message "Deteniendo contenedores..."
    if docker-compose down; then
      print_success "Contenedores detenidos exitosamente."
    else
      print_error "Error al detener los contenedores."
    fi
    ;;
  5)
    show_logs
    ;;
  6)
    check_container_status
    ;;
  7)
    print_message "Saliendo..."
    exit 0
    ;;
  *)
    print_error "Opción inválida."
    exit 1
    ;;
esac

echo ""
print_success "¡Operación completada!" 