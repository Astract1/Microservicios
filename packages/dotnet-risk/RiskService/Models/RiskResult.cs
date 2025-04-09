namespace RiskService.Models
{
    public class RiskResult
    {
        public int Id { get; set; } // Clave primaria
        public required string Name { get; set; } // Nombre del resultado
        public required string Description { get; set; } // Descripción del resultado
        public DateTime CreatedAt { get; set; } // Fecha de creación
        public required string RiskLevel { get; set; } // Nivel de riesgo
        public required string Recommendations { get; set; } // Recomendaciones
    }
}
