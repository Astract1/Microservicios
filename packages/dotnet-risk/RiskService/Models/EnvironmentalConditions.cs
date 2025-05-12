using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RiskService.Models
{
    public class EnvironmentalConditions
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Location { get; set; }
        
        [Required]
        public DateTime Timestamp { get; set; }
        
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double AirQualityIndex { get; set; }
        public double UVIndex { get; set; }
        public double Precipitation { get; set; }
        public string WeatherCondition { get; set; }
        
        [ForeignKey("RiskEvaluation")]
        public int? RiskEvaluationId { get; set; }
        public RiskEvaluation? RiskEvaluation { get; set; }
    }
} 