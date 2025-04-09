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
        public required string Name { get; set; }
        public required string Description { get; set; }
    }
}
