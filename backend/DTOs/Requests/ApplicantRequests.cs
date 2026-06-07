using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.DTOs.Requests;

public class CreateApplicantRequest
{
    [Required]
    [MaxLength(30)]
    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(30)]
    [JsonPropertyName("middle_name")]
    public string? MiddleName { get; set; }

    [Required]
    [MaxLength(30)]
    [JsonPropertyName("last_name")]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [JsonPropertyName("contact_number")]
    public string ContactNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("education")]
    public List<EducationEntry> Education { get; set; } = [];

    [JsonPropertyName("work_experience")]
    public List<WorkExperienceEntry> WorkExperience { get; set; } = [];

    [JsonPropertyName("skills")]
    public List<string> Skills { get; set; } = [];

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [Required]
    [JsonPropertyName("status")]
    public string Status { get; set; } = "Applied";
}

public class UpdateApplicantRequest : CreateApplicantRequest { }

public class EducationEntry
{
    [JsonPropertyName("school")]
    public string School { get; set; } = string.Empty;

    [JsonPropertyName("degree")]
    public string Degree { get; set; } = string.Empty;

    [JsonPropertyName("year_started")]
    public int YearStarted { get; set; }

    [JsonPropertyName("year_ended")]
    public int? YearEnded { get; set; }
}

public class WorkExperienceEntry
{
    [JsonPropertyName("company_name")]
    public string CompanyName { get; set; } = string.Empty;

    [JsonPropertyName("position")]
    public string Position { get; set; } = string.Empty;

    [JsonPropertyName("year_started")]
    public int YearStarted { get; set; }

    [JsonPropertyName("year_ended")]
    public int? YearEnded { get; set; }
}
