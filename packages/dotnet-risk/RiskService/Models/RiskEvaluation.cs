using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace RiskService.Models
{
    public class RiskEvaluation
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("UserData")]
        public int UserId { get; set; }
        public UserData User { get; set; }
        
        [Required]
        public string RiskLevel { get; set; } = string.Empty; // Bajo, Medio, Alto
        
        [Required]
        public DateTime EvaluationDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public string FactorsConsidered { get; set; } = string.Empty;
        
        [Required]
        public string EnvironmentalConditions { get; set; } = string.Empty;
        
        public string Recommendations { get; set; } = string.Empty;
        
        public EnvironmentalConditions CurrentConditions { get; set; }
        
        public string? TestResponses { get; set; }
    }
} 