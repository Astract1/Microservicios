using RestSharp;
using Newtonsoft.Json;
using RiskService.Models;

namespace RiskService.Data
{
    public class WeatherDataProvider
    {
        private readonly string _apiKey = "TU_API_KEY";
        private readonly string _baseUrl = "https://api.openweathermap.org/data/2.5/weather";

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
                AirQualityIndex = data.main.aqi // Ejemplo, depende de la API
            };
        }
    }
}