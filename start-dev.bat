@echo off
setlocal EnableDelayedExpansion

:: Script para iniciar todos los servicios con Hot Reload en Windows

echo ====================================================
echo Iniciando servicios con Hot Reload activado
echo ====================================================

:: Función para mostrar mensajes con timestamp
call :show_message "Verificando dependencias..."

:: Verificar si nodemon está instalado globalmente
call npm list -g nodemon >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :show_message "Instalando nodemon globalmente..."
    call npm install -g nodemon
)

:: Iniciar servicios en nuevas ventanas de comandos
call :show_message "Iniciando servicio monitoring en puerto 3001..."
start "Monitoring Service" cmd /c "cd packages\node-monitoring && set PORT=3001 && npm run hot"

call :show_message "Iniciando servicio education en puerto 3002..."
start "Education Service" cmd /c "cd packages\node-education && set PORT=3002 && npm run hot"

call :show_message "Iniciando servicio node-service en puerto 3003..."
start "Node Service" cmd /c "cd packages\node-service && set PORT=3003 && npm run hot"

:: Crear .env.development para el frontend si no existe
if not exist "packages\frontend\.env.development" (
    call :show_message "Creando archivo .env.development para el frontend..."
    (
        echo # Configuración para React Fast Refresh
        echo FAST_REFRESH=true
        echo CHOKIDAR_USEPOLLING=true
        echo BROWSER=none
        echo REACT_APP_HOT_RELOAD=true
        echo REACT_APP_API_URL=http://localhost:3001/api
        echo REACT_APP_WEATHER_API_URL=http://localhost:3001/api/weather
        echo REACT_APP_EDUCATION_API_URL=http://localhost:3002/api
        echo REACT_APP_RISK_API_URL=http://localhost:3003/api
    ) > "packages\frontend\.env.development"
)

:: Iniciar frontend
call :show_message "Iniciando servicio frontend en puerto 3000..."
start "Frontend" cmd /c "cd packages\frontend && set PORT=3000 && npm run start:hot"

echo ====================================================
echo Todos los servicios iniciados con Hot Reload
echo ====================================================
echo Frontend: http://localhost:3000
echo Monitoring API: http://localhost:3001/api
echo Education API: http://localhost:3002/api
echo Node Service: http://localhost:3003
echo ====================================================
echo Cierra las ventanas de comando para detener los servicios
echo o presiona cualquier tecla para detener todos los servicios...
echo ====================================================

pause > nul

:: Detener todos los servicios
call :show_message "Deteniendo todos los servicios..."

:: Matar todos los procesos por su título de ventana
taskkill /FI "WINDOWTITLE eq Monitoring Service*" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Education Service*" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Node Service*" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend*" /T /F > nul 2>&1

call :show_message "Todos los servicios detenidos."
goto :eof

:: Función para mostrar mensajes con timestamp
:show_message
echo [%time%] %~1
goto :eof 