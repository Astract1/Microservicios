@echo off
setlocal EnableDelayedExpansion

echo ====================================================
echo Iniciando Microservicios con Hot Reload en Docker
echo ====================================================

:: Verificar si Docker está instalado y en ejecución
docker --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker no está instalado o no está en ejecución.
    echo Instala Docker Desktop y asegúrate de que esté funcionando.
    exit /b 1
)

:: Crear .env para Docker si no existe
if not exist ".env" (
    echo Creando archivo .env con valores por defecto...
    (
        echo # Variables de entorno para Docker
        echo DB_ROOT_PASSWORD=admin
        echo DB_PASSWORD=db_password
        echo WEATHER_API_KEY=sample_key
        echo IQAIR_API_KEY=sample_key
    ) > ".env"
    echo Archivo .env creado.
)

:: Instalar dependencias del proyecto si es necesario
echo Verificando dependencias del proyecto...

:: Verificar node_modules en frontend
if not exist "packages\frontend\node_modules" (
    echo Instalando dependencias del frontend...
    cd packages\frontend
    call npm install
    cd ..\..
)

:: Verificar node_modules en node-monitoring
if not exist "packages\node-monitoring\node_modules" (
    echo Instalando dependencias de node-monitoring...
    cd packages\node-monitoring
    call npm install
    cd ..\..
)

:: Verificar node_modules en node-education
if not exist "packages\node-education\node_modules" (
    echo Instalando dependencias de node-education...
    cd packages\node-education
    call npm install
    cd ..\..
)

:: Detener todos los contenedores previamente
echo Deteniendo contenedores existentes...
docker-compose -f docker-compose.dev.yml down

:: Eliminar volúmenes huérfanos si es necesario
echo Limpiando volúmenes huérfanos...
docker volume prune -f

:: Preparando imágenes
echo Iniciando servicios con docker-compose.dev.yml...
echo Este proceso puede tardar unos minutos en la primera ejecución...

:: Ejecutar docker-compose para desarrollo
docker-compose -f docker-compose.dev.yml up -d

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudieron iniciar los servicios.
    exit /b 1
)

:: Mostrar estado de los contenedores
echo.
echo Estado de los contenedores:
docker-compose -f docker-compose.dev.yml ps
echo.

:: Mostrar información de los servicios
echo ====================================================
echo SERVICIOS INICIADOS CON HOT RELOAD
echo ====================================================
echo Frontend: http://localhost:3000
echo API Gateway: http://localhost
echo Monitoring API: http://localhost:3001/api
echo Education API: http://localhost:3002/api
echo Risk API: http://localhost:5002/api
echo Prevention API: http://localhost:5001/api
echo PHPMyAdmin: http://localhost:8080
echo ====================================================

:menu
echo.
echo OPCIONES:
echo 1 - Ver logs en tiempo real
echo 2 - Ver estado de los contenedores
echo 3 - Reiniciar servicios
echo 4 - Detener servicios y salir
echo.
set /p opcion="Selecciona una opción (1-4): "

if "%opcion%"=="1" (
    echo Mostrando logs en tiempo real (presiona Ctrl+C para volver al menú)...
    docker-compose -f docker-compose.dev.yml logs -f
    goto menu
)

if "%opcion%"=="2" (
    echo.
    echo Estado actual de los contenedores:
    docker-compose -f docker-compose.dev.yml ps
    goto menu
)

if "%opcion%"=="3" (
    echo Reiniciando todos los servicios...
    docker-compose -f docker-compose.dev.yml restart
    echo Servicios reiniciados.
    goto menu
)

if "%opcion%"=="4" (
    echo Deteniendo servicios...
    docker-compose -f docker-compose.dev.yml down
    echo ====================================================
    echo Servicios detenidos.
    echo ====================================================
    exit /b 0
)

echo Opción no válida.
goto menu 