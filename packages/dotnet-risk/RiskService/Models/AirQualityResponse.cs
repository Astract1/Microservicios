namespace RiskService.Models
{
    public class AirQualityResponse
    {
        public List<AirQualityData> List { get; set; }
    }

    public class AirQualityData
    {
        public AirQualityMain Main { get; set; }
    }

    public class AirQualityMain
    {
        public int Aqi { get; set; }
    }
}