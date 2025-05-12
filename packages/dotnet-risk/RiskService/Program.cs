using Microsoft.EntityFrameworkCore;
using RiskService.Data;
using RiskService.Services;
using RiskService.Services.Weather;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Risk API", Version = "v1" });
});

// Configure DbContext
builder.Services.AddDbContext<RiskDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

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
