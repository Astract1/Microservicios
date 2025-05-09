namespace RiskService.Models
{
    public class EnvironmentalData
    {
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public int AirQualityIndex { get; set; }
        public double WindSpeed { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}