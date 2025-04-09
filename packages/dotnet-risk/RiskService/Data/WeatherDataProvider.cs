using RestSharp;
using Newtonsoft.Json;
using RiskService.Models;

namespace RiskService.Data
{
    public class WeatherDataProvider
    {
        // Declara e inicializa la URL base de la API
        private readonly string _baseUrl = "https://api.openweathermap.org/data/2.5/weather";
        
        private readonly string _apiKey = Environment.GetEnvironmentVariable("WEATHER_API_KEY") ??
            throw new InvalidOperationException("Weather API key no configurada. Establece la variable de entorno WEATHER_API_KEY.");

        public async Task<EnvironmentalData> GetWeatherDataAsync(string location)
        {
            var client = new RestClient(_baseUrl);
            var request = new RestRequest()
                .AddQueryParameter("q", location)
                .AddQueryParameter("appid", _apiKey);

            var response = await client.GetAsync(request);
            var data = JsonConvert.DeserializeObject<dynamic>(response.Content);

            return new EnvironmentalData
            {
                Temperature = data.main.temp,
                Humidity = data.main.humidity,
                AirQualityIndex = data.main.aqi 
            };
        }
    }
}
