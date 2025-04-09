using PreventionService.Models;

namespace PreventionService.Services
{
    public class RecommendationService
    {
        public Recommendation GenerateRecommendation(RiskEvaluationResult riskResult)
        {
            return new Recommendation
            {
                RiskLevel = riskResult.RiskLevel,
                Tips = riskResult.Recommendations,
                Title = "Recomendaciones Personalizadas",
                Description = "Consejos basados en tu nivel de riesgo."
            };
        }
    }
}