using RestSharp;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RiskService.Models;
using Microsoft.Extensions.Configuration;

namespace RiskService.Data
{
    public class WeatherDataProvider
    {
        private readonly string _baseUrl;
        private readonly string _apiKey;

        public WeatherDataProvider(IConfiguration configuration)
        {
            _baseUrl = configuration["WeatherApi:BaseUrl"]
                ?? throw new InvalidOperationException("BaseUrl no configurada.");

            _apiKey = Environment.GetEnvironmentVariable("WEATHER_API_KEY")
                ?? throw new InvalidOperationException("Weather API key no configurada. Establece la variable de entorno WEATHER_API_KEY.");
        }

        public async Task<EnvironmentalData> GetWeatherDataAsync(string location)
        {
            var client = new RestClient(_baseUrl);
            var request = new RestRequest()
                .AddQueryParameter("q", location)
                .AddQueryParameter("appid", _apiKey);

            var response = await client.GetAsync(request);

            if (!response.IsSuccessful || string.IsNullOrEmpty(response.Content))
            {
                throw new InvalidOperationException("No se pudo obtener los datos del clima desde la API.");
            }

            JObject? data;
            try
            {
                data = JObject.Parse(response.Content);
            }
            catch (JsonReaderException)
            {
                throw new InvalidOperationException("Respuesta inválida del servicio de clima.");
            }

            if (data["main"] == null)
            {
                throw new InvalidOperationException("La respuesta de la API no contiene datos válidos.");
            }

            return new EnvironmentalData
            {
                Temperature = (double)data["main"]!["temp"]!,
                Humidity = (double)data["main"]!["humidity"]!,
                AirQualityIndex = data["main"]!["aqi"] != null ? (int)data["main"]!["aqi"]! : 50
            };
        }
    }
}
