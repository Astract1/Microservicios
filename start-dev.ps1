# Script PowerShell para iniciar todos los servicios con Hot Reload
# Ejecutar en PowerShell como administrador

# Colores para la consola
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

# Funciones de utilidad
function Write-ColorOutput($ForegroundColor) {
    # Guardar el color actual
    $previousForegroundColor = $host.UI.RawUI.ForegroundColor
    
    # Establecer el nuevo color
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    
    # Escribir el texto
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    
    # Restaurar el color anterior
    $host.UI.RawUI.ForegroundColor = $previousForegroundColor
}

function Show-Header {
    Write-ColorOutput Blue "===================================================="
    Write-ColorOutput Green "   Sistema de Monitoreo Ambiental - Hot Reload"
    Write-ColorOutput Blue "===================================================="
}

function Show-Message {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$Type = "Info"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    switch ($Type) {
        "Info" { Write-ColorOutput Cyan "[$timestamp] $Message" }
        "Success" { Write-ColorOutput Green "[$timestamp] $Message" }
        "Warning" { Write-ColorOutput Yellow "[$timestamp] $Message" }
        "Error" { Write-ColorOutput Red "[$timestamp] $Message" }
        default { Write-Output "[$timestamp] $Message" }
    }
}

function Test-DockerInstalled {
    try {
        $dockerVersion = docker --version
        return $true
    } catch {
        return $false
    }
}

function Test-NodemonInstalled {
    try {
        $nodemonVersion = npx nodemon --version
        return $true
    } catch {
        return $false
    }
}

function Test-DotnetInstalled {
    try {
        $dotnetVersion = dotnet --version
        return $true
    } catch {
        return $false
    }
}

function Start-DockerContainers {
    Show-Message "Verificando contenedores Docker..." "Info"
    
    # Verificar si Docker está instalado
    if (-not (Test-DockerInstalled)) {
        Show-Message "Docker no está instalado o no está en ejecución. Saltando el inicio de contenedores." "Warning"
        return
    }
    
    # Verificar si hay un docker-compose.yml
    if (Test-Path "./docker-compose.yml") {
        Show-Message "Iniciando contenedores Docker..." "Info"
        
        # Verificar si los contenedores ya están en ejecución
        $runningContainers = docker-compose ps --services --filter "status=running"
        
        if ($runningContainers) {
            Show-Message "Algunos contenedores ya están en ejecución. Reiniciándolos..." "Warning"
            docker-compose restart
        } else {
            Show-Message "Iniciando todos los contenedores..." "Info"
            docker-compose up -d
        }
        
        # Verificar el estado después de iniciar
        $containersStatus = docker-compose ps
        Show-Message "Estado de los contenedores:" "Info"
        Write-Output $containersStatus
    } else {
        Show-Message "No se encontró un archivo docker-compose.yml en el directorio actual." "Warning"
    }
}

function Stop-DockerContainers {
    Show-Message "Deteniendo contenedores Docker..." "Info"
    
    # Verificar si Docker está instalado
    if (-not (Test-DockerInstalled)) {
        return
    }
    
    # Verificar si hay un docker-compose.yml
    if (Test-Path "./docker-compose.yml") {
        docker-compose stop
        Show-Message "Contenedores Docker detenidos." "Success"
    }
}

# Crear o actualizar el archivo .env.development para React
function Set-ReactEnvironment {
    $envFile = "./packages/frontend/.env.development"
    
    if (-not (Test-Path $envFile)) {
        Show-Message "Creando archivo .env.development para React..." "Info"
        
        $envContent = @"
# Configuración para React Hot Reload
FAST_REFRESH=true
CHOKIDAR_USEPOLLING=true
BROWSER=none
REACT_APP_HOT_RELOAD=true
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WEATHER_API_URL=http://localhost:3001/api/weather
REACT_APP_EDUCATION_API_URL=http://localhost:3002/api
REACT_APP_RISK_API_URL=http://localhost:5002/api
REACT_APP_PREVENTION_API_URL=http://localhost:5001/api
"@
        
        Set-Content -Path $envFile -Value $envContent
        Show-Message "Archivo .env.development creado." "Success"
    }
}

# Función para corregir dependencias de React si es necesario
function Fix-ReactDependencies {
    $packageJsonPath = "./packages/frontend/package.json"
    
    if (Test-Path $packageJsonPath) {
        Show-Message "Verificando dependencias de React..." "Info"
        
        $packageJson = Get-Content -Raw $packageJsonPath | ConvertFrom-Json
        $modified = $false
        
        # Verificar y corregir versiones de React
        if ($packageJson.dependencies.react -and $packageJson.dependencies.react -ne "^18.2.0") {
            $packageJson.dependencies.react = "^18.2.0"
            $modified = $true
            Show-Message "Corrigiendo versión de React a 18.2.0" "Warning"
        }
        
        if ($packageJson.dependencies."react-dom" -and $packageJson.dependencies."react-dom" -ne "^18.2.0") {
            $packageJson.dependencies."react-dom" = "^18.2.0"
            $modified = $true
            Show-Message "Corrigiendo versión de ReactDOM a 18.2.0" "Warning"
        }
        
        # Guardar cambios si se modificó
        if ($modified) {
            $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
            Show-Message "Package.json actualizado con las versiones correctas de React" "Success"
            
            # Preguntar si se debe reinstalar
            Write-ColorOutput Yellow "¿Deseas reinstalar las dependencias de frontend? (S/N): "
            $reinstall = Read-Host
            
            if ($reinstall -eq "S" -or $reinstall -eq "s") {
                Show-Message "Reinstalando dependencias del frontend..." "Info"
                Push-Location "./packages/frontend"
                
                # Intentar eliminar los archivos de lock y node_modules
                if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }
                if (Test-Path "yarn.lock") { Remove-Item "yarn.lock" -Force }
                if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
                
                # Instalar dependencias con --legacy-peer-deps
                npm install --legacy-peer-deps
                
                Pop-Location
                Show-Message "Dependencias reinstaladas correctamente" "Success"
            }
        } else {
            Show-Message "Las versiones de React ya son correctas" "Success"
        }
    }
}

# Función para iniciar un servicio de backend en un job de PowerShell
function Start-BackendService {
    param (
        [string]$ServiceDir,
        [string]$ServiceName,
        [string]$Port
    )
    
    Show-Message "Iniciando servicio: $ServiceName en puerto $Port..." "Info"
    
    # Cambiar al directorio del servicio
    Push-Location ".\packages\$ServiceDir"
    
    # Instalar dependencias si node_modules no existe
    if (-not (Test-Path ".\node_modules")) {
        Show-Message "Instalando dependencias para $ServiceName..." "Info"
        npm install --legacy-peer-deps
    }
    
    # Iniciar el servicio como un job de PowerShell
    $job = Start-Job -Name $ServiceName -ScriptBlock {
        param($dir, $port, $name)
        Set-Location $dir
        $env:PORT = $port
        $env:DEBUG = "express:*"
        
        # Ejecutar el servicio con npm
        npm run hot
    } -ArgumentList $PWD.Path, $Port, $ServiceName
    
    # Regresar al directorio original
    Pop-Location
    
    # Registrar el trabajo en una variable global para poder acceder después
    $global:serviceJobs += @{
        Name = $ServiceName
        Job = $job
        Directory = $ServiceDir
        Port = $Port
    }
    
    Show-Message "Servicio $ServiceName iniciado como Job $($job.Id)" "Success"
}

# Función para iniciar servicios .NET con Hot Reload
function Start-DotNetService {
    param (
        [string]$ServiceDir,
        [string]$ServiceName,
        [string]$Port
    )
    
    Show-Message "Iniciando servicio .NET: $ServiceName en puerto $Port..." "Info"
    
    # Verificar si dotnet SDK está instalado
    if (-not (Test-DotnetInstalled)) {
        Show-Message ".NET SDK no está instalado. No se puede iniciar el servicio $ServiceName." "Error"
        return
    }
    
    # Cambiar al directorio del servicio
    Push-Location ".\packages\$ServiceDir"
    
    # Iniciar el servicio como un job de PowerShell con dotnet watch
    $job = Start-Job -Name $ServiceName -ScriptBlock {
        param($dir, $port, $name)
        Set-Location $dir
        $env:ASPNETCORE_ENVIRONMENT = "Development"
        $env:ASPNETCORE_URLS = "http://localhost:$port"
        
        # Ejecutar dotnet watch para habilitar hot reload
        dotnet watch run --no-hot-reload-warning
    } -ArgumentList $PWD.Path, $Port, $ServiceName
    
    # Regresar al directorio original
    Pop-Location
    
    # Registrar el trabajo en una variable global para poder acceder después
    $global:serviceJobs += @{
        Name = $ServiceName
        Job = $job
        Directory = $ServiceDir
        Port = $Port
        IsDotNet = $true
    }
    
    Show-Message "Servicio .NET $ServiceName iniciado como Job $($job.Id)" "Success"
}

# Función para iniciar el frontend
function Start-Frontend {
    Show-Message "Iniciando servicio frontend en puerto 3000..." "Info"
    
    # Cambiar al directorio del frontend
    Push-Location ".\packages\frontend"
    
    # Instalar dependencias si node_modules no existe
    if (-not (Test-Path ".\node_modules")) {
        Show-Message "Instalando dependencias para frontend..." "Info"
        npm install --legacy-peer-deps
    }
    
    # Iniciar el frontend como un job de PowerShell
    $job = Start-Job -Name "Frontend" -ScriptBlock {
        param($dir)
        Set-Location $dir
        $env:PORT = 3000
        $env:FAST_REFRESH = "true"
        $env:CHOKIDAR_USEPOLLING = "true"
        $env:BROWSER = "none"
        
        # Ejecutar el frontend
        npm run start:hot
    } -ArgumentList $PWD.Path
    
    # Regresar al directorio original
    Pop-Location
    
    # Registrar el trabajo
    $global:serviceJobs += @{
        Name = "Frontend"
        Job = $job
        Directory = "frontend"
        Port = 3000
    }
    
    Show-Message "Frontend iniciado como Job $($job.Id)" "Success"
}

# Función para mostrar el output de los jobs en tiempo real
function Show-ServiceOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$JobName
    )
    
    $job = Get-Job -Name $JobName -ErrorAction SilentlyContinue
    
    if ($job) {
        $previousOutput = ""
        
        while ($job.State -eq "Running") {
            $currentOutput = Receive-Job -Job $job
            
            if ($currentOutput -and $currentOutput -ne $previousOutput) {
                # Mostrar solo el nuevo output
                $newLines = Compare-Object $previousOutput $currentOutput | 
                            Where-Object { $_.SideIndicator -eq "=>" } | 
                            Select-Object -ExpandProperty InputObject
                
                if ($newLines) {
                    Write-ColorOutput Yellow "[$JobName]" 
                    $newLines | ForEach-Object { Write-Output $_ }
                }
                
                $previousOutput = $currentOutput
            }
            
            Start-Sleep -Milliseconds 500
            
            # Permitir salir con Ctrl+C
            if ([console]::KeyAvailable) {
                $key = [console]::ReadKey($true)
                if ($key.Key -eq "C" -and $key.Modifiers -eq "Control") {
                    break
                }
            }
        }
    } else {
        Show-Message "El trabajo $JobName no existe" "Error"
    }
}

# Función para detener todos los servicios
function Stop-AllServices {
    Show-Message "Deteniendo todos los servicios..." "Warning"
    
    # Detener todos los jobs
    foreach ($serviceJob in $global:serviceJobs) {
        try {
            $job = Get-Job -Id $serviceJob.Job.Id -ErrorAction SilentlyContinue
            
            if ($job -and $job.State -eq "Running") {
                Show-Message "Deteniendo $($serviceJob.Name)..." "Info"
                Stop-Job -Job $job -ErrorAction SilentlyContinue
                Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # Ignorar errores al detener los jobs
        }
    }
    
    # Detener los contenedores Docker
    Stop-DockerContainers
    
    Show-Message "Todos los servicios fueron detenidos." "Success"
    
    # Limpiar la variable global
    $global:serviceJobs = @()
}

# Función para reiniciar un servicio específico
function Restart-Service {
    param (
        [Parameter(Mandatory=$true)]
        [string]$ServiceName
    )
    
    $serviceToRestart = $global:serviceJobs | Where-Object { $_.Name -eq $ServiceName }
    
    if ($serviceToRestart) {
        try {
            # Detener el servicio
            $job = Get-Job -Id $serviceToRestart.Job.Id -ErrorAction SilentlyContinue
            
            if ($job -and $job.State -eq "Running") {
                Show-Message "Reiniciando $ServiceName..." "Info"
                Stop-Job -Job $job -ErrorAction SilentlyContinue
                Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
            }
            
            # Eliminar de la lista de servicios
            $global:serviceJobs = $global:serviceJobs | Where-Object { $_.Name -ne $ServiceName }
            
            # Reiniciar el servicio basado en su tipo
            if ($serviceToRestart.IsDotNet) {
                Start-DotNetService $serviceToRestart.Directory $serviceToRestart.Name $serviceToRestart.Port
            } elseif ($serviceToRestart.Name -eq "Frontend") {
                Start-Frontend
            } else {
                Start-BackendService $serviceToRestart.Directory $serviceToRestart.Name $serviceToRestart.Port
            }
            
            Show-Message "Servicio $ServiceName reiniciado con éxito" "Success"
            
        } catch {
            Show-Message "Error al reiniciar el servicio $ServiceName" "Error"
        }
    } else {
        Show-Message "El servicio $ServiceName no está en ejecución" "Error"
    }
}

# Función principal para iniciar todo
function Start-DevEnvironment {
    Show-Header
    
    # Array global para trackear todos los trabajos
    $global:serviceJobs = @()
    
    # Verificar dependencias
    if (-not (Test-NodemonInstalled)) {
        Show-Message "Instalando nodemon globalmente..." "Info"
        npm install -g nodemon
    }
    
    # Verificar dependencias .NET
    if (-not (Test-DotnetInstalled)) {
        Show-Message ".NET SDK no está instalado. Los servicios .NET no funcionarán." "Warning"
    }
    
    # Configurar entorno React
    Set-ReactEnvironment
    
    # Verificar y corregir dependencias de React
    Fix-ReactDependencies
    
    # Iniciar contenedores Docker si están configurados
    Start-DockerContainers
    
    # Iniciar servicios de backend Node.js
    Start-BackendService "node-monitoring" "Monitoring" 3001
    Start-BackendService "node-education" "Education" 3002
    Start-BackendService "node-service" "NodeService" 3003
    
    # Iniciar servicios .NET con Hot Reload
    if (Test-DotnetInstalled) {
        Start-DotNetService "dotnet-risk" "RiskService" 5002
        Start-DotNetService "dotnet-prevention" "PreventionService" 5001
    }
    
    # Iniciar frontend
    Start-Frontend
    
    # Mostrar información
    Write-ColorOutput Blue "===================================================="
    Write-ColorOutput Green "   Todos los servicios iniciados con Hot Reload"
    Write-ColorOutput Blue "===================================================="
    Write-ColorOutput White "Frontend:            http://localhost:3000"
    Write-ColorOutput White "Monitoring API:      http://localhost:3001/api"
    Write-ColorOutput White "Education API:       http://localhost:3002/api"
    Write-ColorOutput White "Node Service:        http://localhost:3003"
    
    # Mostrar servicios .NET solo si están disponibles
    if (Test-DotnetInstalled) {
        Write-ColorOutput White "Risk Service (NET):   http://localhost:5002/api"
        Write-ColorOutput White "Prevention (NET):     http://localhost:5001/api"
    }
    
    Write-ColorOutput Blue "===================================================="
    Write-ColorOutput Yellow "Presiona Ctrl+C o escribe 'exit' para detener todos los servicios"
    Write-ColorOutput Blue "===================================================="
    
    # Mostrar menú de opciones
    Write-ColorOutput Green "Opciones:"
    Write-ColorOutput White "1. Ver logs de Frontend"
    Write-ColorOutput White "2. Ver logs de Monitoring"
    Write-ColorOutput White "3. Ver logs de Education"
    Write-ColorOutput White "4. Ver logs de NodeService"
    
    # Mostrar opciones de .NET solo si están disponibles
    if (Test-DotnetInstalled) {
        Write-ColorOutput White "5. Ver logs de RiskService (.NET)"
        Write-ColorOutput White "6. Ver logs de PreventionService (.NET)"
    }
    
    Write-ColorOutput White "7. Reiniciar un servicio específico"
    Write-ColorOutput White "8. Reiniciar todos los servicios"
    Write-ColorOutput White "9. Ver estado de los contenedores Docker"
    Write-ColorOutput White "0. Salir"
    
    try {
        # Bucle principal para manejar input del usuario
        $running = $true
        while ($running) {
            Write-Host "> " -NoNewline -ForegroundColor Yellow
            $userInput = Read-Host
            
            switch ($userInput) {
                "1" { 
                    Clear-Host
                    Show-Message "Mostrando logs de Frontend. Presiona Ctrl+C para volver al menú." "Info"
                    Show-ServiceOutput "Frontend" 
                }
                "2" { 
                    Clear-Host
                    Show-Message "Mostrando logs de Monitoring. Presiona Ctrl+C para volver al menú." "Info"
                    Show-ServiceOutput "Monitoring" 
                }
                "3" { 
                    Clear-Host 
                    Show-Message "Mostrando logs de Education. Presiona Ctrl+C para volver al menú." "Info"
                    Show-ServiceOutput "Education" 
                }
                "4" { 
                    Clear-Host 
                    Show-Message "Mostrando logs de NodeService. Presiona Ctrl+C para volver al menú." "Info"
                    Show-ServiceOutput "NodeService" 
                }
                "5" {
                    if (Test-DotnetInstalled) {
                        Clear-Host 
                        Show-Message "Mostrando logs de RiskService. Presiona Ctrl+C para volver al menú." "Info"
                        Show-ServiceOutput "RiskService"
                    } else {
                        Show-Message ".NET SDK no está instalado" "Error"
                    }
                }
                "6" {
                    if (Test-DotnetInstalled) {
                        Clear-Host 
                        Show-Message "Mostrando logs de PreventionService. Presiona Ctrl+C para volver al menú." "Info"
                        Show-ServiceOutput "PreventionService"
                    } else {
                        Show-Message ".NET SDK no está instalado" "Error"
                    }
                }
                "7" {
                    Clear-Host
                    Write-ColorOutput Cyan "Servicios disponibles:"
                    $i = 1
                    foreach ($service in $global:serviceJobs) {
                        Write-ColorOutput White "$i. $($service.Name)"
                        $i++
                    }
                    Write-ColorOutput Yellow "Introduce el número del servicio a reiniciar (0 para cancelar): "
                    $serviceNum = Read-Host
                    
                    if ($serviceNum -ne "0" -and $serviceNum -match "^\d+$" -and [int]$serviceNum -le $global:serviceJobs.Count) {
                        $serviceToRestart = $global:serviceJobs[[int]$serviceNum - 1]
                        Restart-Service $serviceToRestart.Name
                    } elseif ($serviceNum -ne "0") {
                        Show-Message "Número de servicio inválido" "Error"
                    }
                }
                "8" { 
                    Show-Message "Reiniciando todos los servicios..." "Warning"
                    Stop-AllServices
                    Start-DevEnvironment
                }
                "9" { 
                    if (Test-DockerInstalled) {
                        docker-compose ps
                    } else {
                        Show-Message "Docker no está instalado o no está en ejecución" "Error"
                    }
                }
                "0" { $running = $false }
                "exit" { $running = $false }
                default { 
                    if ($userInput) {
                        Show-Message "Opción no válida. Introduce un número válido." "Warning"
                    }
                }
            }
        }
    } finally {
        # Asegurarse de que todos los servicios estén detenidos al salir
        Stop-AllServices
    }
}

# Registrar un handler para Ctrl+C
[console]::TreatControlCAsInput = $true

# Iniciar el entorno de desarrollo
Start-DevEnvironment 