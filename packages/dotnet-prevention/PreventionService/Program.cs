using Microsoft.EntityFrameworkCore;
using PreventionService.Data;

var builder = WebApplication.CreateBuilder(args);

// Configurar servicios
builder.Services.AddControllers();

// Configurar DbContext con SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<PreventionDbContext>(options =>
    options.UseSqlite(connectionString));

var app = builder.Build();

// Aplicar migraciones automáticamente
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PreventionDbContext>();
    dbContext.Database.Migrate();
}

// Configurar middleware
app.UseRouting();
app.MapControllers();
app.Run();