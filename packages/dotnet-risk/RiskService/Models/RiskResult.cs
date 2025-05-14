namespace RiskService.Models
{
    public class RiskResult
    {
        public int Id { get; set; } // Clave primaria
        public string Name { get; set; } = string.Empty; // Nombre del resultado
        public string Description { get; set; } = string.Empty; // Descripción del resultado
        public DateTime CreatedAt { get; set; } // Fecha de creación
        public string RiskLevel { get; set; } = string.Empty; // Nivel de riesgo
        public string Recommendations { get; set; } = string.Empty; // Recomendaciones
    }
}
