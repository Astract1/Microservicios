namespace RiskService.Models
{
    public class RiskEvaluationResult
    {
        public string RiskLevel { get; set; } // Nivel de riesgo (e.g., "Low", "Medium", "High")
        public string[] Recommendations { get; set; } // Recomendaciones preventivas
    }
}