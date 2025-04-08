using Microsoft.EntityFrameworkCore;
using RiskService.Models;

namespace RiskService.Data
{
    public class RiskDbContext : DbContext
    {
        public RiskDbContext(DbContextOptions<RiskDbContext> options) : base(options) { }

        // DbSet para la tabla RiskResults
        public DbSet<RiskResult> RiskResults { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de la tabla RiskResults
            modelBuilder.Entity<RiskResult>(entity =>
            {
                entity.ToTable("RiskResults"); // Nombre de la tabla
                entity.HasKey(e => e.Id); // Clave primaria
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100); // Campo requerido con longitud máxima
                entity.Property(e => e.Description).HasMaxLength(500); // Longitud máxima opcional
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP"); // Valor predeterminado
            });
        }
    }
}