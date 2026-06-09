using backend.Data;
using backend.Extensions;
using backend.Middleware;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// ----------------------------------------------------------------
// Services
// ----------------------------------------------------------------
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// ----------------------------------------------------------------
// App pipeline
// ----------------------------------------------------------------
var app = builder.Build();

await DbSeeder.SeedAdminAsync(app);

// Auto-migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseCorsPolicy();
app.UseSessionAuth();

app.MapControllers();

app.MapGet("/", () => Results.Json(new { message = "Hello World from ASP.NET 🚀" }));

app.Run();
