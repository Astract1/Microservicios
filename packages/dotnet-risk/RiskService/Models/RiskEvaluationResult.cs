namespace RiskService.Models
{
    public class RiskEvaluationResult
    {
        public string RiskLevel { get; set; } = string.Empty;
        public int RiskScore { get; set; }
        public string[] RiskFactors { get; set; } = Array.Empty<string>();
        public string[] Recommendations { get; set; } = Array.Empty<string>();
        public DateTime Timestamp { get; set; }
    }
}
