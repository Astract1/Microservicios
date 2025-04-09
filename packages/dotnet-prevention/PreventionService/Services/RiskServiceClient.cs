// filepath: c:\Users\kjsvb\OneDrive\Escritorio\Microservicios\packages\dotnet-prevention\PreventionService\Services\RiskServiceClient.cs
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using PreventionService.Models;

namespace PreventionService.Services
{
    public class RiskServiceClient
    {
        private readonly HttpClient _httpClient;

        public RiskServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<RiskEvaluationResult> GetRiskEvaluationAsync(int userId)
        {
           
            var userData = new { userId = userId };

            var response = await _httpClient.PostAsJsonAsync("/api/risk/evaluate", userData);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<RiskEvaluationResult>(content);
        }
    }
}