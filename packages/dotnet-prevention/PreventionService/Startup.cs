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
            // Configurar controladores
            services.AddControllers();

            // Configurar cliente HTTP para comunicarse con dotnet-risk
            services.AddHttpClient<RiskServiceClient>(client =>
            {
                client.BaseAddress = new Uri(_configuration["DOTNET_RISK_API_URL"]);
            });

            // Configurar servicios
            services.AddScoped<RecommendationService>();

            // Configurar base de datos
            services.AddDbContext<PreventionDbContext>(options =>
                options.UseSqlServer(_configuration.GetConnectionString("DefaultConnection")));
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