@echo off
REM Script para iniciar los servicios de monitoreo ambiental
REM Este script construirá y ejecutará los contenedores de Docker para el sistema de monitoreo

title Sistema de Monitoreo Ambiental - Iniciador

REM Colores para los mensajes
set COLOR_GREEN=[92m
set COLOR_YELLOW=[93m
set COLOR_RED=[91m
set COLOR_BLUE=[94m
set COLOR_RESET=[0m

REM Función para mostrar mensajes con fecha y hora
:print_message
echo %COLOR_BLUE%[%date% %time%]%COLOR_RESET% %~1
exit /b

:print_success
echo %COLOR_GREEN%[%date% %time%]%COLOR_RESET% %~1
exit /b

:print_warning
echo %COLOR_YELLOW%[%date% %time%]%COLOR_RESET% %~1
exit /b

:print_error
echo %COLOR_RED%[%date% %time%]%COLOR_RESET% %~1
exit /b

REM Función para verificar si Docker está instalado y en ejecución
:check_docker
call :print_message "Verificando instalación de Docker..."

where docker >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker no está instalado. Por favor instale Docker y vuelva a intentarlo."
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "El servicio Docker no está en ejecución. Por favor inicie Docker y vuelva a intentarlo."
    pause
    exit /b 1
)

call :print_success "Docker está instalado y en ejecución."
exit /b 0

REM Función para verificar si docker-compose está instalado
:check_docker_compose
call :print_message "Verificando instalación de Docker Compose..."

where docker-compose >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker Compose no está instalado. Por favor instale Docker Compose y vuelva a intentarlo."
    pause
    exit /b 1
)

call :print_success "Docker Compose está instalado."
exit /b 0

REM Función para construir contenedores
:build_containers
call :print_message "Construyendo contenedores del sistema de monitoreo ambiental..."

docker-compose build
if %errorlevel% neq 0 (
    call :print_error "Error al construir los contenedores."
    pause
    exit /b 1
)

call :print_success "Construcción de contenedores completada exitosamente."
exit /b 0

REM Función para iniciar contenedores
:start_containers
call :print_message "Iniciando contenedores del sistema de monitoreo ambiental..."

docker-compose up -d
if %errorlevel% neq 0 (
    call :print_error "Error al iniciar los contenedores."
    pause
    exit /b 1
)

call :print_success "Contenedores iniciados exitosamente."
exit /b 0

REM Función para mostrar los logs de los contenedores
:show_logs
call :print_message "Mostrando logs de los contenedores... Presione Ctrl+C para detener."
docker-compose logs -f
exit /b 0

REM Función para verificar el estado de los contenedores
:check_container_status
call :print_message "Verificando estado de los contenedores..."
docker-compose ps
exit /b 0

REM Menú principal
:menu
cls
echo ==================================================
echo    Sistema de Monitoreo Ambiental - Iniciador    
echo ==================================================
echo.

REM Verificar requisitos
call :check_docker
if %errorlevel% neq 0 goto :eof
call :check_docker_compose
if %errorlevel% neq 0 goto :eof

echo.
echo Seleccione una opción:
echo 1) Construir e iniciar contenedores
echo 2) Solo iniciar contenedores (sin reconstruir)
echo 3) Reconstruir contenedor ui-monitoring
echo 4) Detener contenedores
echo 5) Ver logs
echo 6) Verificar estado de contenedores
echo 7) Salir
echo.

set /p option=Opción (1-7): 

if "%option%"=="1" (
    call :build_containers
    if %errorlevel% neq 0 goto :menu
    call :start_containers
    if %errorlevel% neq 0 goto :menu
    call :check_container_status
    call :print_success "Sistema de monitoreo ambiental iniciado. Acceda a http://localhost para ver la interfaz."
    pause
    goto :menu
)

if "%option%"=="2" (
    call :start_containers
    if %errorlevel% neq 0 goto :menu
    call :check_container_status
    call :print_success "Sistema de monitoreo ambiental iniciado. Acceda a http://localhost para ver la interfaz."
    pause
    goto :menu
)

if "%option%"=="3" (
    call :print_message "Reconstruyendo contenedor ui-monitoring..."
    docker-compose build ui-monitoring
    if %errorlevel% neq 0 (
        call :print_error "Error al reconstruir el contenedor ui-monitoring."
        pause
        goto :menu
    )
    
    call :print_success "Reconstrucción completada."
    call :print_message "Reiniciando contenedor ui-monitoring..."
    
    docker-compose up -d --no-deps ui-monitoring
    if %errorlevel% neq 0 (
        call :print_error "Error al reiniciar el contenedor ui-monitoring."
    ) else (
        call :print_success "Contenedor ui-monitoring reiniciado exitosamente."
    )
    
    pause
    goto :menu
)

if "%option%"=="4" (
    call :print_message "Deteniendo contenedores..."
    docker-compose down
    if %errorlevel% neq 0 (
        call :print_error "Error al detener los contenedores."
    ) else (
        call :print_success "Contenedores detenidos exitosamente."
    )
    
    pause
    goto :menu
)

if "%option%"=="5" (
    call :show_logs
    goto :menu
)

if "%option%"=="6" (
    call :check_container_status
    pause
    goto :menu
)

if "%option%"=="7" (
    call :print_message "Saliendo..."
    goto :eof
)

call :print_error "Opción inválida."
pause
goto :menu

:eof
echo.
call :print_success "¡Operación completada!"
pause 