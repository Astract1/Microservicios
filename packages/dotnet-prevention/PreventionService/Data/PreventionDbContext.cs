using Microsoft.EntityFrameworkCore;
using PreventionService.Models;

namespace PreventionService.Data
{
    public class PreventionDbContext : DbContext
    {
        public PreventionDbContext(DbContextOptions<PreventionDbContext> options) : base(options) { }

        public DbSet<Recommendation> Recommendations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Recommendation>().ToTable("Recommendations");
        }
    }
}