using System.Text.Json;
using Microsoft.Extensions.Configuration;
using RiskService.Models;

namespace RiskService.Services.Weather
{
    public class WeatherDataProvider
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _baseUrl;
        private readonly string _apiKey;

        public WeatherDataProvider(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _baseUrl = _configuration["WeatherApi:BaseUrl"] ?? throw new ArgumentNullException("WeatherApi:BaseUrl");
            _apiKey = _configuration["WeatherApi:ApiKey"] ?? throw new ArgumentNullException("WeatherApi:ApiKey");
        }

        public async Task<EnvironmentalConditions> GetCurrentWeatherData(string location)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/weather?q={location}&appid={_apiKey}&units=metric");
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var weatherData = JsonSerializer.Deserialize<WeatherApiResponse>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? throw new Exception("No se pudo deserializar los datos del clima");

                return new EnvironmentalConditions
                {
                    Location = location,
                    Timestamp = DateTime.UtcNow,
                    Temperature = weatherData.Main.Temp,
                    Humidity = weatherData.Main.Humidity,
                    WeatherCondition = weatherData.Weather[0].Description,
                    // Valores por defecto para índices que no proporciona la API gratuita
                    AirQualityIndex = 50, // Valor por defecto
                    UVIndex = 5, // Valor por defecto
                    Precipitation = weatherData.Rain?.OneHour ?? 0
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener datos del clima: {ex.Message}", ex);
            }
        }
    }

    // Clases para deserializar la respuesta de la API del clima
    public class WeatherApiResponse
    {
        public MainData Main { get; set; }
        public WeatherData[] Weather { get; set; }
        public RainData Rain { get; set; }
    }

    public class MainData
    {
        public double Temp { get; set; }
        public double Humidity { get; set; }
    }

    public class WeatherData
    {
        public string Description { get; set; }
    }

    public class RainData
    {
        public double? OneHour { get; set; }
    }
} 