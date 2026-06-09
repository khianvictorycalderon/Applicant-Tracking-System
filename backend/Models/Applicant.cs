using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("applicants")]
public class Applicant
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(30)]
    [Column("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(30)]
    [Column("middle_name")]
    public string? MiddleName { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("last_name")]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("contact_number")]
    public string ContactNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    // JSON-serialized list of education entries
    [Column("education")]
    public string Education { get; set; } = "[]";

    // JSON-serialized list of work experience entries (optional)
    [Column("work_experience")]
    public string WorkExperience { get; set; } = "[]";

    // JSON-serialized list of skill strings
    [Column("skills")]
    public string Skills { get; set; } = "[]";

    [Column("notes")]
    public string? Notes { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "Applied";

    // FK to the member who owns this applicant
    [Required]
    [Column("created_by")]
    public Guid CreatedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? Creator { get; set; }
}
