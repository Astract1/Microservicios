namespace RiskService.DTOs
{
    public class RiskEvaluationDto
    {
        public UserDataDto UserData { get; set; }
        public EnvironmentalDataDto EnvironmentalData { get; set; }
    }

    public class UserDataDto
    {
        public int Id { get; set; }
        public int Age { get; set; }
        public string Location { get; set; }
        public string HealthStatus { get; set; }
        public string[] MedicalConditions { get; set; }
    }

    public class EnvironmentalDataDto
    {
        public string Location { get; set; }
    }
}
