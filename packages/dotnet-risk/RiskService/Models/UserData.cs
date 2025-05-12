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
        public string Location { get; set; }
        
        [Required]
        public string HealthStatus { get; set; }
        
        public required string[] MedicalConditions { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}