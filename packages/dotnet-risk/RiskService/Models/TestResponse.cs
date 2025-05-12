namespace RiskService.Models
{
    public class TestResponse
    {
        public int UserId { get; set; }
        public List<TestAnswer> Answers { get; set; } = new List<TestAnswer>();
    }

    public class TestAnswer
    {
        public string Question { get; set; }
        public string Response { get; set; }
        public int Score { get; set; }
    }
} 