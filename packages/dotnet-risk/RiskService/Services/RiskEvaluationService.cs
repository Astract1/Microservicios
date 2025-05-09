using RiskService.Models;

namespace RiskService.Services
{
    public class RiskEvaluationService
    {
        public RiskEvaluationResult EvaluateRisk(UserData userData, EnvironmentalData environmentalData)
        {
            var riskFactors = new List<string>();
            var recommendations = new List<string>();
            int riskScore = 0;

            // Evaluar temperatura
            if (environmentalData.Temperature > 35)
            {
                riskScore += 30;
                riskFactors.Add("Temperatura extremadamente alta");
                recommendations.Add("Evitar exposición prolongada al sol");
                recommendations.Add("Mantenerse hidratado");
            }
            else if (environmentalData.Temperature < 5)
            {
                riskScore += 25;
                riskFactors.Add("Temperatura muy baja");
                recommendations.Add("Abrigarse adecuadamente");
                recommendations.Add("Evitar exposición prolongada al frío");
            }

            // Evaluar calidad del aire
            if (environmentalData.AirQualityIndex > 100)
            {
                riskScore += 35;
                riskFactors.Add("Mala calidad del aire");
                recommendations.Add("Usar mascarilla en exteriores");
                recommendations.Add("Limitar actividades al aire libre");
            }

            // Evaluar humedad
            if (environmentalData.Humidity > 80)
            {
                riskScore += 15;
                riskFactors.Add("Humedad alta");
                recommendations.Add("Mantener ambientes ventilados");
            }

            // Evaluar viento
            if (environmentalData.WindSpeed > 50)
            {
                riskScore += 20;
                riskFactors.Add("Vientos fuertes");
                recommendations.Add("Evitar áreas abiertas");
            }

            // Evaluar factores del usuario
            if (userData.Age > 65 || userData.Age < 12)
            {
                riskScore += 20;
                riskFactors.Add("Grupo de edad vulnerable");
                recommendations.Add("Mantener especial precaución por grupo de edad");
            }

            if (userData.MedicalConditions?.Any() ?? false)
            {
                riskScore += 25;
                riskFactors.Add("Condiciones médicas preexistentes");
                recommendations.Add("Consultar con su médico sobre precauciones específicas");
            }

            string riskLevel = riskScore switch
            {
                > 70 => "Alto",
                > 40 => "Medio",
                _ => "Bajo"
            };

            return new RiskEvaluationResult
            {
                RiskLevel = riskLevel,
                RiskScore = riskScore,
                RiskFactors = riskFactors.ToArray(),
                Recommendations = recommendations.ToArray(),
                Timestamp = DateTime.UtcNow
            };
        }
    }
}