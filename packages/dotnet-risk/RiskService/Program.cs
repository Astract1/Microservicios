using RiskService.Services;
using RiskService.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Agregar servicios HTTP
builder.Services.AddHttpClient();

// Agregar controladores
builder.Services.AddControllers();

// Agregar health checks
builder.Services.AddHealthChecks();

// Registrar servicios
builder.Services.AddScoped<RiskEvaluationService>();
builder.Services.AddScoped<WeatherDataProvider>();

// Configurar DbContext con SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                       Environment.GetEnvironmentVariable("DATABASE_CONNECTION");

builder.Services.AddDbContext<RiskDbContext>(options =>
    options.UseSqlite(connectionString));

var app = builder.Build();

// Ejecutar migraciones automáticamente
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RiskDbContext>();
    try
    {
        dbContext.Database.Migrate();
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

app.Run();
