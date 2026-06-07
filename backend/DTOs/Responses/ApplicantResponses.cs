using System.Text.Json;
using backend.DTOs.Requests;
using backend.Models;

namespace backend.DTOs.Responses;

public class ApplicantResponse
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<EducationEntry> Education { get; set; } = [];
    public List<WorkExperienceEntry> WorkExperience { get; set; } = [];
    public List<string> Skills { get; set; } = [];
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static ApplicantResponse FromModel(Applicant a)
    {
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        return new ApplicantResponse
        {
            Id            = a.Id,
            FirstName     = a.FirstName,
            MiddleName    = a.MiddleName,
            LastName      = a.LastName,
            ContactNumber = a.ContactNumber,
            Email         = a.Email,
            Education     = JsonSerializer.Deserialize<List<EducationEntry>>(a.Education, options) ?? [],
            WorkExperience = JsonSerializer.Deserialize<List<WorkExperienceEntry>>(a.WorkExperience, options) ?? [],
            Skills        = JsonSerializer.Deserialize<List<string>>(a.Skills, options) ?? [],
            Notes         = a.Notes,
            Status        = a.Status,
            CreatedBy     = a.CreatedBy,
            CreatedAt     = a.CreatedAt,
            UpdatedAt     = a.UpdatedAt,
        };
    }
}

public class PaginatedApplicantsResponse
{
    public List<ApplicantResponse> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

// For admin users list
public class AdminUserResponse
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }
    public string Email { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// Dashboard stats
public class MemberDashboardResponse
{
    public int TotalApplicants { get; set; }
    public Dictionary<string, int> ByStatus { get; set; } = [];
    public int RecentThisMonth { get; set; }
    public List<string> TopSkills { get; set; } = [];
}

public class AdminDashboardResponse
{
    public int TotalUsers { get; set; }
    public int TotalAdmins { get; set; }
    public int TotalMembers { get; set; }
    public int TotalApplicants { get; set; }
    public Dictionary<string, int> ApplicantsByStatus { get; set; } = [];
    public Dictionary<string, int> UsersByMonth { get; set; } = [];
    public Dictionary<string, int> ApplicantsByMonth { get; set; } = [];
}
