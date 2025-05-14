using System.ComponentModel.DataAnnotations;

namespace RiskService.Models
{
    public class UserData
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int Age { get; set; }
        
        [Required]
        public string Location { get; set; } = string.Empty;
        
        [Required]
        public string HealthStatus { get; set; } = string.Empty;
        
        public string[] MedicalConditions { get; set; } = Array.Empty<string>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}