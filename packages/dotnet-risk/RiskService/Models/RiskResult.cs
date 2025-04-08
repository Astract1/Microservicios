// filepath: c:\Users\kjsvb\OneDrive\Escritorio\Microservicios\packages\dotnet-risk\RiskService\Models\RiskResult.cs
namespace RiskService.Models
{
    public class RiskResult
    {
        public int Id { get; set; } // Clave primaria
        public string Name { get; set; } // Nombre del resultado
        public string Description { get; set; } // Descripción del resultado
        public DateTime CreatedAt { get; set; } // Fecha de creación

        // Propiedades faltantes
        public string RiskLevel { get; set; } // Nivel de riesgo
        public string Recommendations { get; set; } // Recomendaciones
    }
}