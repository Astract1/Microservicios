namespace PreventionService.Models
{
    public class RiskEvaluationResult
    {
        public string RiskLevel { get; set; } // Nivel de riesgo (por ejemplo, "Alto", "Medio", "Bajo")
        public string[] Recommendations { get; set; } // Lista de recomendaciones específicas
    }
}