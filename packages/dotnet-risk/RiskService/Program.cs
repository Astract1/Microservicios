using RiskService.Services;
using RiskService.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Agregar controladores
builder.Services.AddControllers();

// Registrar servicios
builder.Services.AddScoped<RiskEvaluationService>();
builder.Services.AddScoped<WeatherDataProvider>();

// Configurar DbContext con SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                       Environment.GetEnvironmentVariable("DATABASE_CONNECTION");

builder.Services.AddDbContext<RiskDbContext>(options =>
    options.UseSqlite(connectionString)); // Cambiar a SQLite

var app = builder.Build();

// Ejecutar migraciones automáticamente al iniciar la aplicación
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RiskDbContext>();
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
app.MapControllers();

// Ejecutar la app de forma asincrónica
await app.RunAsync(); 
