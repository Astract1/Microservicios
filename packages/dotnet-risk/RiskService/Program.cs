using RiskService.Services;
using RiskService.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<RiskEvaluationService>();
builder.Services.AddScoped<WeatherDataProvider>();

var app = builder.Build();

app.UseRouting();
app.UseEndpoints(endpoints => endpoints.MapControllers());

app.Run();