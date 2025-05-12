using RiskService.Models;
using System.Text.Json;
using System.Threading.Tasks;

namespace RiskService.Services
{
    public class RiskEvaluationService : IRiskEvaluationService
    {
        public string CalculateRiskLevel(UserData userData, EnvironmentalConditions environmentalData)
        {
            // Lógica para calcular el nivel de riesgo
            var riskScore = 0;

            // Factores de edad
            if (userData.Age < 18 || userData.Age > 65) riskScore += 2;
            else if (userData.Age < 30) riskScore += 1;

            // Factores ambientales
            if (environmentalData.Temperature > 30) riskScore += 2;
            if (environmentalData.Humidity > 80) riskScore += 1;
            if (environmentalData.AirQualityIndex > 100) riskScore += 2;

            // Determinar nivel de riesgo
            return riskScore switch
            {
                <= 2 => "Bajo",
                <= 4 => "Medio",
                _ => "Alto"
            };
        }

        public string GenerateRecommendations(UserData userData, EnvironmentalConditions environmentalData)
        {
            var recommendations = new List<string>();

            if (environmentalData.Temperature > 30)
            {
                recommendations.Add("Evitar actividades al aire libre durante las horas más calurosas");
                recommendations.Add("Mantenerse hidratado");
            }

            if (environmentalData.AirQualityIndex > 100)
            {
                recommendations.Add("Usar mascarilla al salir");
                recommendations.Add("Limitar actividades al aire libre");
            }

            if (userData.Age > 65)
            {
                recommendations.Add("Consultar con un médico antes de realizar actividades intensas");
            }

            return string.Join(", ", recommendations);
        }

        public string EvaluateTestResponses(Dictionary<string, string> responses)
        {
            var riskScore = 0;

            foreach (var response in responses)
            {
                switch (response.Key.ToLower())
                {
                    case "edad":
                        if (int.TryParse(response.Value, out int age))
                        {
                            if (age < 18 || age > 65) riskScore += 2;
                            else if (age < 30) riskScore += 1;
                        }
                        break;
                    case "condiciones_medicas":
                        if (response.Value.ToLower().Contains("si")) riskScore += 2;
                        break;
                    case "actividad_fisica":
                        if (response.Value.ToLower().Contains("alta")) riskScore += 1;
                        break;
                }
            }

            return riskScore switch
            {
                <= 2 => "Bajo",
                <= 4 => "Medio",
                _ => "Alto"
            };
        }

        public string GenerateTestBasedRecommendations(Dictionary<string, string> responses)
        {
            var recommendations = new List<string>();

            foreach (var response in responses)
            {
                switch (response.Key.ToLower())
                {
                    case "edad":
                        if (int.TryParse(response.Value, out int age) && age > 65)
                        {
                            recommendations.Add("Consultar con un médico antes de realizar actividades intensas");
                        }
                        break;
                    case "condiciones_medicas":
                        if (response.Value.ToLower().Contains("si"))
                        {
                            recommendations.Add("Seguir las recomendaciones médicas específicas");
                            recommendations.Add("Mantener medicamentos a mano");
                        }
                        break;
                    case "actividad_fisica":
                        if (response.Value.ToLower().Contains("alta"))
                        {
                            recommendations.Add("Ajustar la intensidad según las condiciones ambientales");
                            recommendations.Add("Mantenerse hidratado durante la actividad");
                        }
                        break;
                }
            }

            return string.Join(", ", recommendations);
        }

        // Métodos requeridos por la interfaz
        public Task<RiskEvaluation> EvaluateRisk(UserData userData, EnvironmentalData environmentalData)
        {
            // Implementación de ejemplo
            var evaluation = new RiskEvaluation
            {
                UserId = userData.Id,
                RiskLevel = CalculateRiskLevel(userData, new EnvironmentalConditions()),
                FactorsConsidered = "Factores de ejemplo",
                EnvironmentalConditions = "Condiciones de ejemplo",
                Recommendations = "Recomendaciones de ejemplo"
            };
            return Task.FromResult(evaluation);
        }

        public Task<RiskEvaluation> ProcessTestResponse(TestResponse testResponse)
        {
            // Convertir las respuestas a un diccionario para reutilizar la lógica existente
            var responsesDict = testResponse.Answers.ToDictionary(a => a.Question, a => a.Response);
            var evaluation = new RiskEvaluation
            {
                UserId = testResponse.UserId,
                TestResponses = System.Text.Json.JsonSerializer.Serialize(responsesDict),
                RiskLevel = EvaluateTestResponses(responsesDict),
                EvaluationDate = DateTime.UtcNow,
                FactorsConsidered = "Evaluación basada en test interactivo",
                Recommendations = GenerateTestBasedRecommendations(responsesDict)
            };
            return Task.FromResult(evaluation);
        }
    }
}