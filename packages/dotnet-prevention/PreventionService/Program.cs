using Microsoft.EntityFrameworkCore;
using PreventionService.Data;

var builder = WebApplication.CreateBuilder(args);

// Configurar servicios
builder.Services.AddControllers();

// Agregar health checks
builder.Services.AddHealthChecks();

// Configurar DbContext con SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                      Environment.GetEnvironmentVariable("DATABASE_CONNECTION");
builder.Services.AddDbContext<PreventionDbContext>(options =>
    options.UseSqlite(connectionString));

var app = builder.Build();

// Aplicar migraciones automáticamente de forma asincrónica
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PreventionDbContext>();
    try 
    {
        await dbContext.Database.MigrateAsync();
        Console.WriteLine("Migraciones aplicadas correctamente.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error al aplicar migraciones: {ex.Message}");
    }
}

// Configurar middleware
app.UseRouting();

// Map health checks endpoint
app.MapHealthChecks("/health");

app.MapControllers();
await app.RunAsync();
