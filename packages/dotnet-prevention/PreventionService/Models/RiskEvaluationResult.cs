namespace PreventionService.Models
{
    public class RiskEvaluationResult
    {
        public required string RiskLevel { get; set; } // Nivel de riesgo
        public required string[] Recommendations { get; set; } // Lista de recomendaciones
    }
}
