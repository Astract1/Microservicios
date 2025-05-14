using Microsoft.EntityFrameworkCore;
using RiskService.Data;
using RiskService.Services;
using RiskService.Services.Weather;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Verificar y mostrar las variables de entorno
Console.WriteLine($"ASPNETCORE_ENVIRONMENT: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}");
Console.WriteLine($"ASPNETCORE_URLS: {Environment.GetEnvironmentVariable("ASPNETCORE_URLS")}");
Console.WriteLine($"DATABASE_CONNECTION: {Environment.GetEnvironmentVariable("DATABASE_CONNECTION")}");

// Configurar la conexión a la base de datos usando variable de entorno si está disponible
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Using Connection String: {connectionString}");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Risk API", Version = "v1" });
});

// Configure DbContexts
builder.Services.AddDbContext<RiskDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

// Register services
builder.Services.AddScoped<IRiskEvaluationService, RiskEvaluationService>();
builder.Services.AddScoped<IApiIntegrationService, ApiIntegrationService>();
builder.Services.AddScoped<WeatherDataProvider>();

// Configure HttpClient
builder.Services.AddHttpClient();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Agregar health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS
app.UseCors();

// app.UseHttpsRedirection(); // Comentado para permitir HTTP
app.UseAuthorization();

// Agregar endpoint de health check
app.MapHealthChecks("/health");

// Log all registered endpoints
var endpoints = app.Services.GetRequiredService<IEnumerable<EndpointDataSource>>()
    .SelectMany(es => es.Endpoints);
Console.WriteLine("Registered endpoints:");
foreach (var endpoint in endpoints)
{
    Console.WriteLine(endpoint.DisplayName);
}

app.MapControllers();

// Log the application URLs
Console.WriteLine($"Application URLs: {string.Join(", ", app.Urls)}");

app.Run();
