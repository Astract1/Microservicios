using System;
using System.ComponentModel.DataAnnotations;

namespace RiskService.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        public int Age { get; set; }

        [Required]
        [StringLength(200)]
        public string Location { get; set; }

        [StringLength(50)]
        public string HealthStatus { get; set; }

        [StringLength(500)]
        public string MedicalConditions { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 