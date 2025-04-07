using Microsoft.AspNetCore.Mvc;
using RiskService.DTOs;
using RiskService.Models;
using RiskService.Services;

namespace RiskService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RiskController : ControllerBase
    {
        private readonly RiskEvaluationService _riskService;

        public RiskController(RiskEvaluationService riskService)
        {
            _riskService = riskService;
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

            // Devolver el resultado
            return Ok(result);
        }
    }
}