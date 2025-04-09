using Microsoft.EntityFrameworkCore;

namespace PreventionService.Data
{
    public class PreventionDbContext : DbContext
    {
        public PreventionDbContext(DbContextOptions<PreventionDbContext> options) : base(options) { }

        // Define tus entidades aquí
        public DbSet<Prevention> Preventions { get; set; }
    }

    public class Prevention
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}