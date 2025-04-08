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
        public IActionResult EvaluateRisk([FromBody] RiskEvaluationDTO request)
        {
            // Convertir los DTOs a los modelos internos
            var userData = new UserData
            {
                Age = request.UserData.Age,
                MedicalConditions = request.UserData.MedicalConditions
            };

            var environmentalData = new EnvironmentalData
            {
                Temperature = request.EnvironmentalData.Temperature,
                Humidity = request.EnvironmentalData.Humidity,
                AirQualityIndex = request.EnvironmentalData.AirQualityIndex
            };

            // Evaluar el riesgo
            var result = _riskService.EvaluateRisk(userData, environmentalData);

            // Guardar el resultado en la base de datos
            var riskResult = new RiskResult
            {
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