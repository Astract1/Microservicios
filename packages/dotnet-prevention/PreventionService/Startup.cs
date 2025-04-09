using Microsoft.EntityFrameworkCore;
using PreventionService.Data;
using PreventionService.Services;

namespace PreventionService
{
    public class Startup
    {
        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            // Obtener y validar la URL de la API externa
            var riskApiUrl = _configuration["DOTNET_RISK_API_URL"];
            if (string.IsNullOrWhiteSpace(riskApiUrl))
            {
                throw new InvalidOperationException("La URL para DOTNET_RISK_API_URL no está configurada en appsettings.");
            }

            // Configurar cliente HTTP con la URL verificada
            services.AddHttpClient<RiskServiceClient>(client =>
            {
                client.BaseAddress = new Uri(riskApiUrl);
            });

            services.AddScoped<RecommendationService>();

            // Obtener y validar la cadena de conexión
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("La cadena de conexión 'DefaultConnection' no está configurada.");
            }

            services.AddDbContext<PreventionDbContext>(options =>
                options.UseSqlite(connectionString));
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
