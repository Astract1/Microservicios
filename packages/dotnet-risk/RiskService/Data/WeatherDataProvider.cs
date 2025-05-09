using System.Text.Json;
using RiskService.Models;
using RiskService.Exceptions;
using Microsoft.Extensions.Configuration;

namespace RiskService.Data
{
    public class WeatherDataProvider
    {
        private readonly string _baseUrl;
        private readonly string _apiKey;
        private readonly IHttpClientFactory _httpClientFactory;

        public WeatherDataProvider(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _baseUrl = configuration["WeatherApi:BaseUrl"] ?? "http://api.openweathermap.org/data/2.5";
            _apiKey = configuration["WeatherApi:ApiKey"] ?? 
                Environment.GetEnvironmentVariable("WEATHER_API_KEY") ?? 
                throw new InvalidOperationException("Weather API key no configurada");
            _httpClientFactory = httpClientFactory;
        }

        public async Task<EnvironmentalData> GetWeatherDataAsync(string location)
        {
            try
            {
                using var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync(
                    $"{_baseUrl}/weather?q={location}&appid={_apiKey}&units=metric");
                response.EnsureSuccessStatusCode();
                
                var data = await JsonSerializer.DeserializeAsync<WeatherApiResponse>(
                    await response.Content.ReadAsStreamAsync());
                
                if (data == null)
                    throw new WeatherServiceException("No se pudieron obtener datos meteorológicos");

                return new EnvironmentalData
                {
                    Temperature = data.Main.Temp,
                    Humidity = data.Main.Humidity,
                    AirQualityIndex = await GetAirQualityIndexAsync(data.Coord.Lat, data.Coord.Lon),
                    WindSpeed = data.Wind.Speed,
                    Description = data.Weather[0].Description
                };
            }
            catch (Exception ex)
            {
                throw new WeatherServiceException("Error obteniendo datos meteorológicos", ex);
            }
        }

        private async Task<int> GetAirQualityIndexAsync(double lat, double lon)
        {
            try
            {
                using var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync(
                    $"{_baseUrl}/air_pollution?lat={lat}&lon={lon}&appid={_apiKey}");
                response.EnsureSuccessStatusCode();
                
                var data = await JsonSerializer.DeserializeAsync<AirQualityResponse>(
                    await response.Content.ReadAsStreamAsync());
                
                return data?.List[0].Main.Aqi * 20 ?? 50; // Convertir escala 1-5 a 0-100
            }
            catch
            {
                return 50; // Valor por defecto si no se puede obtener el AQI
            }
        }
    }
}
