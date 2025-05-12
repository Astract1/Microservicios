using System.Text.Json;
using Microsoft.Extensions.Configuration;
using RiskService.Models;
using Microsoft.Extensions.Logging;

namespace RiskService.Services
{
    public interface IApiIntegrationService
    {
        Task<UserData> GetUserDataAsync(int userId);
        Task<EnvironmentalConditions> GetEnvironmentalDataAsync(string location);
        Task<bool> SendRiskEvaluationAsync(RiskEvaluation evaluation);
        string GetBaseUrl();
    }

    public class ApiIntegrationService : IApiIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _baseApiUrl;
        private readonly ILogger<ApiIntegrationService> _logger;

        public ApiIntegrationService(
            HttpClient httpClient, 
            IConfiguration configuration,
            ILogger<ApiIntegrationService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            // Usar el API Gateway en lugar del servicio directo
            _baseApiUrl = _configuration["ApiSettings:BaseUrl"] ?? "http://localhost:80";
            
            // Configurar el cliente HTTP
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
        }

        public string GetBaseUrl()
        {
            return _baseApiUrl;
        }

        public async Task<UserData> GetUserDataAsync(int userId)
        {
            try
            {
                _logger.LogInformation($"Obteniendo datos del clima desde {_baseApiUrl}/api/monitoring/weather");
                
                var response = await _httpClient.GetAsync($"{_baseApiUrl}/api/monitoring/weather");
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"No se pudieron obtener datos del clima. Status: {response.StatusCode}. Usando valores por defecto.");
                    // Retornar datos por defecto si el servicio no está disponible
                    return new UserData
                    {
                        Id = userId,
                        Location = "Ciudad de México",
                        HealthStatus = "Bueno",
                        MedicalConditions = new[] { "Ninguna" }
                    };
                }
                
                var content = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Respuesta del clima: {content}");
                
                var weatherData = JsonSerializer.Deserialize<WeatherData>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? throw new Exception("No se pudo deserializar los datos del clima");

                return new UserData
                {
                    Id = userId,
                    Location = weatherData.Location ?? "Ciudad de México",
                    HealthStatus = "Bueno",
                    MedicalConditions = new[] { "Ninguna" }
                };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning(ex, $"Error al conectar con la API de monitoreo. Usando valores por defecto.");
                return new UserData
                {
                    Id = userId,
                    Location = "Ciudad de México",
                    HealthStatus = "Bueno",
                    MedicalConditions = new[] { "Ninguna" }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener datos del usuario");
                throw new Exception($"Error al obtener datos del usuario: {ex.Message}", ex);
            }
        }

        public async Task<EnvironmentalConditions> GetEnvironmentalDataAsync(string location)
        {
            try
            {
                _logger.LogInformation($"Obteniendo datos ambientales para {location}");
                
                // Obtener datos del clima
                var weatherResponse = await _httpClient.GetAsync($"{_baseApiUrl}/api/monitoring/weather");
                WeatherData? weatherData = null;
                if (weatherResponse.IsSuccessStatusCode)
                {
                    var weatherContent = await weatherResponse.Content.ReadAsStringAsync();
                    weatherData = JsonSerializer.Deserialize<WeatherData>(weatherContent, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                else
                {
                    _logger.LogWarning($"No se pudieron obtener datos del clima. Status: {weatherResponse.StatusCode}. Usando valores por defecto.");
                }

                // Obtener datos de calidad del aire
                var airQualityResponse = await _httpClient.GetAsync($"{_baseApiUrl}/api/monitoring/air-quality");
                AirQualityData? airQualityData = null;
                if (airQualityResponse.IsSuccessStatusCode)
                {
                    var airQualityContent = await airQualityResponse.Content.ReadAsStringAsync();
                    airQualityData = JsonSerializer.Deserialize<AirQualityData>(airQualityContent, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                else
                {
                    _logger.LogWarning($"No se pudieron obtener datos de calidad del aire. Status: {airQualityResponse.StatusCode}. Usando valores por defecto.");
                }

                // Convertir los datos a EnvironmentalConditions con valores por defecto si es necesario
                return new EnvironmentalConditions
                {
                    Location = location,
                    Timestamp = DateTime.UtcNow,
                    Temperature = weatherData?.Temperature ?? 25,
                    Humidity = weatherData?.Humidity ?? 60,
                    AirQualityIndex = airQualityData?.Index ?? 50,
                    UVIndex = weatherData?.UVIndex ?? 5,
                    Precipitation = weatherData?.Precipitation ?? 0,
                    WeatherCondition = weatherData?.Condition ?? "Soleado"
                };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning(ex, $"Error al conectar con la API de monitoreo. Usando valores por defecto.");
                return new EnvironmentalConditions
                {
                    Location = location,
                    Timestamp = DateTime.UtcNow,
                    Temperature = 25,
                    Humidity = 60,
                    AirQualityIndex = 50,
                    UVIndex = 5,
                    Precipitation = 0,
                    WeatherCondition = "Soleado"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener datos ambientales");
                throw new Exception($"Error al obtener datos ambientales: {ex.Message}", ex);
            }
        }

        public async Task<bool> SendRiskEvaluationAsync(RiskEvaluation evaluation)
        {
            try
            {
                _logger.LogInformation($"Enviando evaluación de riesgo: {JsonSerializer.Serialize(evaluation)}");
                
                var alertData = new AlertData
                {
                    Type = "RiskEvaluation",
                    Message = $"Nivel de riesgo: {evaluation.RiskLevel} - {evaluation.FactorsConsidered ?? string.Empty}",
                    Level = evaluation.RiskLevel,
                    Timestamp = DateTime.UtcNow,
                    Location = evaluation.User?.Location ?? "Ubicación no especificada",
                    Details = new Dictionary<string, object>
                    {
                        { "userId", evaluation.User?.Id ?? 0 },
                        { "riskLevel", evaluation.RiskLevel ?? "No especificado" },
                        { "factorsConsidered", evaluation.FactorsConsidered ?? string.Empty },
                        { "recommendations", evaluation.Recommendations ?? string.Empty }
                    }
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(alertData),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync($"{_baseApiUrl}/api/monitoring/alerts", content);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"No se pudo enviar la alerta. Status: {response.StatusCode}. Continuando sin enviar alerta.");
                    return true; // Retornamos true para no bloquear el flujo principal
                }
                
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Respuesta del servidor: {responseContent}");
                
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning(ex, "Error al conectar con la API de monitoreo. Continuando sin enviar alerta.");
                return true; // Retornamos true para no bloquear el flujo principal
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar evaluación de riesgo");
                throw new Exception($"Error al enviar evaluación de riesgo: {ex.Message}", ex);
            }
        }
    }

    // Clases auxiliares para deserialización
    public class DashboardData
    {
        public AirQualityData? AirQuality { get; set; }
        public WeatherData? Weather { get; set; }
        public List<AlertData>? Alerts { get; set; }
    }

    public class AirQualityData
    {
        public int Index { get; set; }
        public string? Category { get; set; }
    }

    public class WeatherData
    {
        public string? Location { get; set; }
        public double Temperature { get; set; }
        public int Humidity { get; set; }
        public int UVIndex { get; set; }
        public double Precipitation { get; set; }
        public string? Condition { get; set; }
    }

    public class AlertData
    {
        public string? Type { get; set; }
        public string? Message { get; set; }
        public string? Level { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Location { get; set; }
        public Dictionary<string, object>? Details { get; set; }
    }
} 