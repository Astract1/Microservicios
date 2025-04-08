using RiskService.Services;
using RiskService.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Agregar controladores
builder.Services.AddControllers();

// Registrar servicios
builder.Services.AddScoped<RiskEvaluationService>();
builder.Services.AddScoped<WeatherDataProvider>();

// Configurar DbContext con MariaDB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                       Environment.GetEnvironmentVariable("DATABASE_CONNECTION");

builder.Services.AddDbContext<RiskDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)) // Reintentos en caso de fallo
    .EnableSensitiveDataLogging() // Mostrar datos sensibles en los logs (solo para desarrollo)
    .LogTo(Console.WriteLine, LogLevel.Information)); // Registrar consultas SQL en la consola

var app = builder.Build();

// Ejecutar migraciones automáticamente al iniciar la aplicación
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RiskDbContext>();
    try
    {
        dbContext.Database.Migrate(); // Aplicar migraciones
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
app.Run();