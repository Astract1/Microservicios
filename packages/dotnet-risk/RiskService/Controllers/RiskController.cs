using Microsoft.AspNetCore.Mvc;
using RiskService.DTOs;
using RiskService.Models;
using RiskService.Services;
using RiskService.Services.Weather;
using RiskService.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace RiskService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RiskController : ControllerBase
    {
        private readonly IRiskEvaluationService _riskService;
        private readonly RiskDbContext _dbContext;
        private readonly RiskService.Services.Weather.WeatherDataProvider _weatherService;
        private readonly IApiIntegrationService _apiService;

        public RiskController(
            IRiskEvaluationService riskService, 
            RiskDbContext dbContext,
            RiskService.Services.Weather.WeatherDataProvider weatherService,
            IApiIntegrationService apiService)
        {
            _riskService = riskService;
            _dbContext = dbContext;
            _weatherService = weatherService;
            _apiService = apiService;
        }

        [HttpGet("diagnostico-conexion")]
        public async Task<IActionResult> VerificarConexion()
        {
            try
            {
                string status = "Verificando conexión...";
                object? userDataObj = null;
                string? error = null;

                try
                {
                    // Intentar obtener un usuario de prueba (ID 1)
                    var userData = await _apiService.GetUserDataAsync(1);
                    status = "Conexión exitosa";
                    userDataObj = new { UserId = userData.Id, Location = userData.Location };
                }
                catch (Exception ex)
                {
                    status = "Error en la conexión";
                    error = ex.Message;
                }

                var diagnosticInfo = new
                {
                    ApiBaseUrl = _apiService.GetBaseUrl(),
                    Timestamp = DateTime.UtcNow,
                    Status = status,
                    UserData = userDataObj,
                    Error = error
                };

                return Ok(diagnosticInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Status = "Error en el diagnóstico",
                    Error = ex.Message,
                    UserData = (object?)null
                });
            }
        }

        [HttpPost("evaluacion-riesgo")]
        public async Task<IActionResult> EvaluateRisk([FromBody] RiskEvaluationDto request)
        {
            if (request.UserData == null || request.EnvironmentalData == null)
            {
                return BadRequest("Faltan datos necesarios para la evaluación del riesgo.");
            }

            try
            {
                // Obtener datos del usuario desde la API principal
                var userData = await _apiService.GetUserDataAsync(request.UserData.Id);
                
                // Obtener datos ambientales actualizados
                var environmentalData = await _apiService.GetEnvironmentalDataAsync(userData.Location);

                // Crear evaluación de riesgo
                var evaluation = new RiskEvaluation
                {
                    UserId = userData.Id,
                    RiskLevel = _riskService.CalculateRiskLevel(userData, environmentalData),
                    FactorsConsidered = JsonSerializer.Serialize(new
                    {
                        Environmental = environmentalData,
                        UserHealth = userData.HealthStatus,
                        MedicalConditions = userData.MedicalConditions
                    }),
                    EnvironmentalConditions = JsonSerializer.Serialize(environmentalData),
                    Recommendations = _riskService.GenerateRecommendations(userData, environmentalData)
                };

                // Guardar en base de datos local
                _dbContext.RiskEvaluations.Add(evaluation);
                await _dbContext.SaveChangesAsync();

                // Enviar evaluación a la API principal
                await _apiService.SendRiskEvaluationAsync(evaluation);

                return Ok(evaluation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al procesar la evaluación: {ex.Message}");
            }
        }

        [HttpGet("niveles-riesgo")]
        public IActionResult GetRiskLevels()
        {
            var riskLevels = new[]
            {
                new { Level = "Bajo", Description = "Riesgo mínimo para la salud" },
                new { Level = "Medio", Description = "Riesgo moderado, se recomienda precaución" },
                new { Level = "Alto", Description = "Riesgo significativo, se recomienda evitar exposición" }
            };

            return Ok(riskLevels);
        }

        [HttpPost("test-interactivo")]
        public async Task<IActionResult> ProcessInteractiveTest([FromBody] TestResponseDto testResponse)
        {
            if (testResponse == null || testResponse.Responses == null)
            {
                return BadRequest("Se requieren las respuestas del test.");
            }

            try
            {
                // Obtener datos del usuario desde la API principal
                var userData = await _apiService.GetUserDataAsync(testResponse.UserId);

                var evaluation = new RiskEvaluation
                {
                    UserId = userData.Id,
                    TestResponses = JsonSerializer.Serialize(testResponse.Responses),
                    RiskLevel = _riskService.EvaluateTestResponses(testResponse.Responses),
                    EvaluationDate = DateTime.UtcNow,
                    FactorsConsidered = "Evaluación basada en test interactivo",
                    Recommendations = _riskService.GenerateTestBasedRecommendations(testResponse.Responses)
                };

                // Guardar en base de datos local
                _dbContext.RiskEvaluations.Add(evaluation);
                await _dbContext.SaveChangesAsync();

                // Enviar evaluación a la API principal
                await _apiService.SendRiskEvaluationAsync(evaluation);

                return Ok(evaluation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al procesar el test: {ex.Message}");
            }
        }

        [HttpGet("historial-evaluaciones/{userId}")]
        public async Task<IActionResult> GetEvaluationHistory(int userId)
        {
            try
            {
                // Verificar que el usuario existe en la API principal
                var userData = await _apiService.GetUserDataAsync(userId);

                var evaluations = await _dbContext.RiskEvaluations
                    .Where(e => e.UserId == userId)
                    .OrderByDescending(e => e.EvaluationDate)
                    .ToListAsync();

                return Ok(evaluations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener el historial: {ex.Message}");
            }
        }
    }
}
