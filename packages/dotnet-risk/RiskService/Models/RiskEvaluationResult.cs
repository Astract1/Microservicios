namespace RiskService.Models
{
    public class RiskEvaluationResult
    {
        public required string RiskLevel { get; set; }
        public int RiskScore { get; set; }
        public required string[] RiskFactors { get; set; }
        public required string[] Recommendations { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
