using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Applicant> Applicants => Set<Applicant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();

            entity.Property(u => u.UserRole)
                  .HasDefaultValue("Member");

            entity.Property(u => u.CreatedAt)
                  .HasDefaultValueSql("NOW()");

            entity.Property(u => u.UpdatedAt)
                  .HasDefaultValueSql("NOW()");
        });

        // Session
        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasOne(s => s.User)
                  .WithMany(u => u.Sessions)
                  .HasForeignKey(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(s => s.CreatedAt)
                  .HasDefaultValueSql("NOW()");

            entity.Property(s => s.LastSeen)
                  .HasDefaultValueSql("NOW()");
        });

        // Applicant
        modelBuilder.Entity<Applicant>(entity =>
        {
            entity.HasOne(a => a.Creator)
                  .WithMany()
                  .HasForeignKey(a => a.CreatedBy)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(a => a.Status)
                  .HasDefaultValue("Applied");

            entity.Property(a => a.Education)
                  .HasDefaultValue("[]");

            entity.Property(a => a.WorkExperience)
                  .HasDefaultValue("[]");

            entity.Property(a => a.Skills)
                  .HasDefaultValue("[]");

            entity.Property(a => a.CreatedAt)
                  .HasDefaultValueSql("NOW()");

            entity.Property(a => a.UpdatedAt)
                  .HasDefaultValueSql("NOW()");
        });
    }
}
