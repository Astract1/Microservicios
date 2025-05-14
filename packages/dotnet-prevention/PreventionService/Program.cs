using Microsoft.EntityFrameworkCore;
using PreventionService.Data;
using PreventionService.Services;
using System;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Configurar servicios
builder.Services.AddControllers();

// Agregar health checks
builder.Services.AddHealthChecks();

// Configurar DbContext con SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                      Environment.GetEnvironmentVariable("DATABASE_CONNECTION");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("La cadena de conexión 'DefaultConnection' no está configurada.");
}
builder.Services.AddDbContext<PreventionDbContext>(options =>
    options.UseSqlite(connectionString));

// Obtener y validar la URL de la API externa
var riskApiUrl = builder.Configuration["DOTNET_RISK_API_URL"];
if (string.IsNullOrWhiteSpace(riskApiUrl))
{
    throw new InvalidOperationException("La URL para DOTNET_RISK_API_URL no está configurada en appsettings.");
}

// Configurar cliente HTTP con la URL verificada
builder.Services.AddHttpClient<RiskServiceClient>(client =>
{
    client.BaseAddress = new Uri(riskApiUrl);
});

builder.Services.AddScoped<RecommendationService>();

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
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();

// Map health checks endpoint
app.MapHealthChecks("/health");

app.MapControllers();
await app.RunAsync();
