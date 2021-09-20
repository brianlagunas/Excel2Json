using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

namespace Excel2Json
{
    public class Startup
    {
        readonly string DebugCorsPolicy = "DebugCorsPolicy";
        readonly string ProductionCorsPolicy = "ProductionCorsPolicy";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSpaStaticFiles(options =>
            {
                options.RootPath = "wwwroot";
            });

            services.AddControllers();

            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedProto;
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Excel2Json", Version = "v1" });
            });

            services.AddCors(options =>
            {
                options.AddPolicy(DebugCorsPolicy, builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyHeader()
                           .AllowAnyMethod()
                           .WithExposedHeaders("location");
                });
                options.AddPolicy(ProductionCorsPolicy, builder =>
                {
                    builder.AllowAnyOrigin().WithMethods("Get");
                });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Excel2Json v1"));
            }
            else
            {
                app.UseForwardedHeaders();
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseDefaultFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            if (env.IsDevelopment())
                app.UseCors(DebugCorsPolicy);
            else
                app.UseCors(ProductionCorsPolicy);

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseSpa(spa =>
            {
                spa.Options.DefaultPage = "/index.html";
            });
        }
    }
}
