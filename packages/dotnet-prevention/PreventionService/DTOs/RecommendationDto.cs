namespace PreventionService.DTOs
{
    public class RecommendationDto
    {
        public required string RiskLevel { get; set; }
        public required string[] Tips { get; set; }
    }
}
