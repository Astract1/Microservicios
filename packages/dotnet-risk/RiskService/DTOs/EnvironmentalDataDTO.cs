namespace RiskService.DTOs
{
    public class EnvironmentalDataDto
    {
        public double? Temperature { get; set; } // Temperatura en grados Celsius
        public double? Humidity { get; set; } // Humedad en porcentaje
        public int? AirQualityIndex { get; set; } // Índice de calidad del aire
    }
}
