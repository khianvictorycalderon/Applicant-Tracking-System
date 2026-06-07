using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Extensions;

public static class DbSeeder
{
    public static async Task SeedAdminAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        string email = config["Admin:Email"] ?? "admin@asp.net";
        string password = config["Admin:Password"] ?? "@Admin123456";

        // Check if admin exists
        var exists = await db.Users.AnyAsync(u => u.Email == email);

        if (exists)
        {
            Console.WriteLine("Admin already exists");
            return;
        }

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "System",
            LastName = "Admin",
            BirthDate = new DateOnly(2000, 1, 1), // required field in your model
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            UserRole = "Admin",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();

        Console.WriteLine("Admin created successfully");
    }
}