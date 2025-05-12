using RiskService.Models;

namespace RiskService.Services
{
    public interface IRiskEvaluationService
    {
        Task<RiskEvaluation> EvaluateRisk(UserData userData, EnvironmentalData environmentalData);
        Task<RiskEvaluation> ProcessTestResponse(TestResponse testResponse);
        string CalculateRiskLevel(UserData userData, EnvironmentalConditions environmentalData);
        string GenerateRecommendations(UserData userData, EnvironmentalConditions environmentalData);
        string EvaluateTestResponses(Dictionary<string, string> responses);
        string GenerateTestBasedRecommendations(Dictionary<string, string> responses);
    }
} 