namespace RiskService.DTOs
{
    public class RiskEvaluationDto
    {
        public required UserDataDto UserData { get; set; } // Datos del usuario
        public required EnvironmentalDataDto EnvironmentalData { get; set; } // Datos ambientales
    }
}
