namespace RiskService.Models
{
    public class WeatherApiResponse
    {
        public MainData Main { get; set; }
        public Wind Wind { get; set; }
        public Weather[] Weather { get; set; }
        public Coord Coord { get; set; }
    }

    public class MainData
    {
        public double Temp { get; set; }
        public double Humidity { get; set; }
    }

    public class Wind
    {
        public double Speed { get; set; }
    }

    public class Weather
    {
        public string Description { get; set; }
    }

    public class Coord
    {
        public double Lat { get; set; }
        public double Lon { get; set; }
    }
}