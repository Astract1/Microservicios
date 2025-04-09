using Microsoft.AspNetCore.Mvc;
using PreventionService.Services;

namespace PreventionService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PreventionController : ControllerBase
    {
        private readonly RiskServiceClient _riskServiceClient;
        private readonly RecommendationService _recommendationService;

        public PreventionController(RiskServiceClient riskServiceClient, RecommendationService recommendationService)
        {
            _riskServiceClient = riskServiceClient;
            _recommendationService = recommendationService;
        }

        [HttpGet("recommendations/{userId}")]
        public async Task<IActionResult> GetRecommendations(int userId)
        {
            var riskResult = await _riskServiceClient.GetRiskEvaluationAsync(userId);
            var recommendation = _recommendationService.GenerateRecommendation(riskResult);

            return Ok(recommendation);
        }
    }
}