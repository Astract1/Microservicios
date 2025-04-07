namespace RiskService.DTOs
{
    public class RiskEvaluationDTO
    {
        public UserDataDTO UserData { get; set; } // Datos del usuario
        public EnvironmentalDataDTO EnvironmentalData { get; set; } // Datos ambientales
    }
}