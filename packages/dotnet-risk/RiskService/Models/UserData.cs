namespace RiskService.Models
{
    public class UserData
    {
        public int Age { get; set; } // Edad del usuario
        public required string[] MedicalConditions { get; set; } // Condiciones médicas del usuario
    }
}