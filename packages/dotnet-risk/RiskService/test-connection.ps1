# Colores para la salida
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Yellow"

Write-Host "`n=== Iniciando pruebas de conexión ===`n" -ForegroundColor $infoColor

# 0. Probar conexión con el API Gateway
Write-Host "0. Probando conexión con API Gateway..." -ForegroundColor $infoColor
try {
    # Probar el endpoint de health check
    $response = Invoke-RestMethod -Uri "http://localhost:80/health" -Method Get
    Write-Host "✅ Health check exitoso:" -ForegroundColor $successColor
    Write-Host "   Estado: $($response.status)"

    # Probar el endpoint de monitoreo
    $response = Invoke-RestMethod -Uri "http://localhost:80/api/weather" -Method Get
    Write-Host "✅ Conexión con API de monitoreo exitosa:" -ForegroundColor $successColor
    Write-Host "   Datos del clima recibidos"

    # Probar el endpoint de calidad del aire
    $response = Invoke-RestMethod -Uri "http://localhost:80/api/air-quality" -Method Get
    Write-Host "✅ Conexión con API de calidad del aire exitosa:" -ForegroundColor $successColor
    Write-Host "   Datos de calidad del aire recibidos"
} catch {
    Write-Host "❌ Error en la conexión con API Gateway:" -ForegroundColor $errorColor
    Write-Host "   $($_.Exception.Message)"
}

# 1. Probar el endpoint de diagnóstico
Write-Host "`n1. Probando endpoint de diagnóstico..." -ForegroundColor $infoColor
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5128/api/risk/diagnostico-conexion" -Method Get
    Write-Host "✅ Diagnóstico exitoso:" -ForegroundColor $successColor
    Write-Host "   URL Base: $($response.apiBaseUrl)"
    Write-Host "   Estado: $($response.status)"
    if ($response.userData) {
        Write-Host "   Datos de usuario encontrados"
    }
} catch {
    Write-Host "❌ Error en el diagnóstico:" -ForegroundColor $errorColor
    Write-Host "   $($_.Exception.Message)"
}

# 2. Probar la evaluación de riesgo
Write-Host "`n2. Probando evaluación de riesgo..." -ForegroundColor $infoColor
$testData = @{
    userData = @{
        id = 1
        age = 30
        location = "Ciudad de México"
        healthStatus = "Bueno"
        medicalConditions = @("Ninguna")
    }
    environmentalData = @{
        location = "Ciudad de México"
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5128/api/risk/evaluacion-riesgo" -Method Post -Body $testData -ContentType "application/json"
    Write-Host "✅ Evaluación de riesgo exitosa:" -ForegroundColor $successColor
    Write-Host "   Nivel de riesgo: $($response.riskLevel)"
    Write-Host "   Fecha: $($response.evaluationDate)"
} catch {
    Write-Host "❌ Error en la evaluación de riesgo:" -ForegroundColor $errorColor
    Write-Host "   $($_.Exception.Message)"
}

# 3. Probar la obtención de niveles de riesgo
Write-Host "`n3. Probando obtención de niveles de riesgo..." -ForegroundColor $infoColor
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5128/api/risk/niveles-riesgo" -Method Get
    Write-Host "✅ Niveles de riesgo obtenidos:" -ForegroundColor $successColor
    foreach ($level in $response) {
        Write-Host "   - $($level.level): $($level.description)"
    }
} catch {
    Write-Host "❌ Error al obtener niveles de riesgo:" -ForegroundColor $errorColor
    Write-Host "   $($_.Exception.Message)"
}

Write-Host "`n=== Pruebas completadas ===`n" -ForegroundColor $infoColor 