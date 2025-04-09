namespace RiskService.Models
{
    public class RiskEvaluationResult
    {
        public required string RiskLevel { get; set; } // Nivel de riesgo (e.g., "Low", "Medium", "High")
        public required string[] Recommendations { get; set; } // Recomendaciones preventivas
    }
}
