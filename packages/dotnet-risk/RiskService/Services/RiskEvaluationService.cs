using RiskService.Models;

namespace RiskService.Services
{
    public class RiskEvaluationService
    {
        public RiskEvaluationResult EvaluateRisk(UserData userData, EnvironmentalData environmentalData)
        {
            // Lógica para calcular el nivel de riesgo
            string riskLevel = "Low";
            var recommendations = new List<string>();

            if (environmentalData.Temperature > 35 || environmentalData.AirQualityIndex > 100)
            {
                riskLevel = "High";
                recommendations.Add("Evitar actividades al aire libre.");
                recommendations.Add("Mantenerse hidratado.");
            }

            return new RiskEvaluationResult
            {
                RiskLevel = riskLevel,
                Recommendations = recommendations.ToArray()
            };
        }
    }
}