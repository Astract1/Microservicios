namespace PreventionService.Models
{
    public class Recommendation
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string RiskLevel { get; set; }
        public string[] Tips { get; set; }
    }
}