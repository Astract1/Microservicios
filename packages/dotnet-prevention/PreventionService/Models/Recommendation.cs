namespace PreventionService.Models
{
    public class Recommendation
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string RiskLevel { get; set; }
        public required string[] Tips { get; set; }
    }
}
