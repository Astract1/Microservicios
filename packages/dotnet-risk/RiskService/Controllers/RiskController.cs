using Microsoft.AspNetCore.Mvc;
using RiskService.DTOs;
using RiskService.Models;
using RiskService.Services;
using RiskService.Data;

namespace RiskService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RiskController : ControllerBase
    {
        private readonly RiskEvaluationService _riskService;
        private readonly RiskDbContext _dbContext;

        public RiskController(RiskEvaluationService riskService, RiskDbContext dbContext)
        {
            _riskService = riskService;
            _dbContext = dbContext;
        }

        [HttpPost("evaluate")]
        public IActionResult EvaluateRisk([FromBody] RiskEvaluationDto request)
        {
            // Validar que los datos requeridos no sean nulos
            if (request.UserData == null ||
                request.EnvironmentalData == null ||
                !request.EnvironmentalData.Temperature.HasValue ||
                !request.EnvironmentalData.Humidity.HasValue ||
                !request.EnvironmentalData.AirQualityIndex.HasValue)
            {
                return BadRequest("Faltan datos necesarios para la evaluación del riesgo.");
            }

            // Convertir los DTOs a modelos internos
            var userData = new UserData
            {
                Age = request.UserData.Age,
                MedicalConditions = request.UserData.MedicalConditions
            };

            var environmentalData = new RiskService.Models.EnvironmentalData
            {
                Temperature = request.EnvironmentalData.Temperature.Value,
                Humidity = request.EnvironmentalData.Humidity.Value,
                AirQualityIndex = request.EnvironmentalData.AirQualityIndex.Value
            };

            // Evaluar el riesgo
            var result = _riskService.EvaluateRisk(userData, environmentalData);

            // Guardar el resultado en la base de datos
            var riskResult = new RiskResult
            {
                Name = "Evaluación de Riesgo " + DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Description = "Evaluación automática basada en condiciones ambientales y datos del usuario",
                RiskLevel = result.RiskLevel,
                Recommendations = string.Join(", ", result.Recommendations),
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.RiskResults.Add(riskResult);
            _dbContext.SaveChanges();

            // Devolver el resultado
            return Ok(result);
        }

        [HttpGet("results")]
        public IActionResult GetResults()
        {
            // Obtener todos los resultados almacenados
            var results = _dbContext.RiskResults.ToList();
            return Ok(results);
        }
    }
}
