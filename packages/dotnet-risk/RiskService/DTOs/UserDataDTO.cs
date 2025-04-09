namespace RiskService.DTOs
{
    public class UserDataDto
    {
        public required int Age { get; set; } // Edad del usuario
        public required string[] MedicalConditions { get; set; } // Condiciones médicas del usuario
    }
}
