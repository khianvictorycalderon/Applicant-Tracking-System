using System.Text.Json;
using backend.Data;
using backend.DTOs.Requests;
using backend.DTOs.Responses;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ApplicantService(AppDbContext db) : IApplicantService
{
    private static readonly JsonSerializerOptions _jsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    // ----------------------------------------------------------------
    // GET paginated applicants (member sees only their own)
    // ----------------------------------------------------------------
    public async Task<PaginatedApplicantsResponse> GetApplicantsAsync(
        Guid userId, int page, int pageSize, string? search)
    {
        var query = db.Applicants
            .AsNoTracking()
            .Where(a => a.CreatedBy == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(a =>
                a.FirstName.ToLower().Contains(s) ||
                a.LastName.ToLower().Contains(s) ||
                a.Email.ToLower().Contains(s) ||
                a.ContactNumber.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedApplicantsResponse
        {
            Items      = items.Select(ApplicantResponse.FromModel).ToList(),
            TotalCount = total,
            Page       = page,
            PageSize   = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize),
        };
    }

    // ----------------------------------------------------------------
    // GET single applicant
    // ----------------------------------------------------------------
    public async Task<ApplicantResponse?> GetApplicantByIdAsync(Guid userId, Guid applicantId)
    {
        var applicant = await db.Applicants
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == applicantId && a.CreatedBy == userId);

        return applicant is null ? null : ApplicantResponse.FromModel(applicant);
    }

    // ----------------------------------------------------------------
    // CREATE applicant
    // ----------------------------------------------------------------
    public async Task<(ApplicantResponse? Applicant, string? Error, int StatusCode)>
        CreateApplicantAsync(Guid userId, CreateApplicantRequest request)
    {
        if (!IsValidStatus(request.Status))
            return (null, "Invalid status value", StatusCodes.Status400BadRequest);

        var applicant = new Applicant
        {
            FirstName     = request.FirstName,
            MiddleName    = string.IsNullOrWhiteSpace(request.MiddleName) ? null : request.MiddleName,
            LastName      = request.LastName,
            ContactNumber = request.ContactNumber,
            Email         = request.Email,
            Education     = JsonSerializer.Serialize(request.Education, _jsonOpts),
            WorkExperience = JsonSerializer.Serialize(request.WorkExperience, _jsonOpts),
            Skills        = JsonSerializer.Serialize(request.Skills, _jsonOpts),
            Notes         = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes,
            Status        = request.Status,
            CreatedBy     = userId,
        };

        db.Applicants.Add(applicant);
        await db.SaveChangesAsync();

        return (ApplicantResponse.FromModel(applicant), null, StatusCodes.Status201Created);
    }

    // ----------------------------------------------------------------
    // UPDATE applicant
    // ----------------------------------------------------------------
    public async Task<(bool Success, string? Error, int StatusCode)>
        UpdateApplicantAsync(Guid userId, Guid applicantId, UpdateApplicantRequest request)
    {
        if (!IsValidStatus(request.Status))
            return (false, "Invalid status value", StatusCodes.Status400BadRequest);

        var applicant = await db.Applicants
            .FirstOrDefaultAsync(a => a.Id == applicantId && a.CreatedBy == userId);

        if (applicant is null)
            return (false, "Applicant not found", StatusCodes.Status404NotFound);

        applicant.FirstName     = request.FirstName;
        applicant.MiddleName    = string.IsNullOrWhiteSpace(request.MiddleName) ? null : request.MiddleName;
        applicant.LastName      = request.LastName;
        applicant.ContactNumber = request.ContactNumber;
        applicant.Email         = request.Email;
        applicant.Education     = JsonSerializer.Serialize(request.Education, _jsonOpts);
        applicant.WorkExperience = JsonSerializer.Serialize(request.WorkExperience, _jsonOpts);
        applicant.Skills        = JsonSerializer.Serialize(request.Skills, _jsonOpts);
        applicant.Notes         = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes;
        applicant.Status        = request.Status;
        applicant.UpdatedAt     = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return (true, null, StatusCodes.Status200OK);
    }

    // ----------------------------------------------------------------
    // DELETE applicant
    // ----------------------------------------------------------------
    public async Task<(bool Success, string? Error, int StatusCode)>
        DeleteApplicantAsync(Guid userId, Guid applicantId)
    {
        var applicant = await db.Applicants
            .FirstOrDefaultAsync(a => a.Id == applicantId && a.CreatedBy == userId);

        if (applicant is null)
            return (false, "Applicant not found", StatusCodes.Status404NotFound);

        db.Applicants.Remove(applicant);
        await db.SaveChangesAsync();
        return (true, null, StatusCodes.Status200OK);
    }

    // ----------------------------------------------------------------
    // MEMBER DASHBOARD
    // ----------------------------------------------------------------
    public async Task<MemberDashboardResponse> GetMemberDashboardAsync(Guid userId)
    {
        var applicants = await db.Applicants
            .AsNoTracking()
            .Where(a => a.CreatedBy == userId)
            .ToListAsync();

        var byStatus = applicants
            .GroupBy(a => a.Status)
            .ToDictionary(g => g.Key, g => g.Count());

        var thisMonth = DateTime.UtcNow;
        var recentThisMonth = applicants
            .Count(a => a.CreatedAt.Year == thisMonth.Year && a.CreatedAt.Month == thisMonth.Month);

        // Aggregate skills across all applicants
        var allSkills = applicants
            .SelectMany(a =>
            {
                try { return JsonSerializer.Deserialize<List<string>>(a.Skills, _jsonOpts) ?? []; }
                catch { return []; }
            })
            .GroupBy(s => s)
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => g.Key)
            .ToList();

        return new MemberDashboardResponse
        {
            TotalApplicants  = applicants.Count,
            ByStatus         = byStatus,
            RecentThisMonth  = recentThisMonth,
            TopSkills        = allSkills,
        };
    }

    // ----------------------------------------------------------------
    // ADMIN DASHBOARD
    // ----------------------------------------------------------------
    public async Task<AdminDashboardResponse> GetAdminDashboardAsync()
    {
        var users = await db.Users.AsNoTracking().ToListAsync();
        var applicants = await db.Applicants.AsNoTracking().ToListAsync();

        var byStatus = applicants
            .GroupBy(a => a.Status)
            .ToDictionary(g => g.Key, g => g.Count());

        // Users registered per month (last 6 months)
        var usersByMonth = Enumerable.Range(0, 6)
            .Select(i => DateTime.UtcNow.AddMonths(-i))
            .OrderBy(d => d)
            .ToDictionary(
                d => d.ToString("MMM yyyy"),
                d => users.Count(u => u.CreatedAt.Year == d.Year && u.CreatedAt.Month == d.Month)
            );

        // Applicants created per month (last 6 months)
        var applicantsByMonth = Enumerable.Range(0, 6)
            .Select(i => DateTime.UtcNow.AddMonths(-i))
            .OrderBy(d => d)
            .ToDictionary(
                d => d.ToString("MMM yyyy"),
                d => applicants.Count(a => a.CreatedAt.Year == d.Year && a.CreatedAt.Month == d.Month)
            );

        return new AdminDashboardResponse
        {
            TotalUsers          = users.Count,
            TotalAdmins         = users.Count(u => u.UserRole == "Admin"),
            TotalMembers        = users.Count(u => u.UserRole == "Member"),
            TotalApplicants     = applicants.Count,
            ApplicantsByStatus  = byStatus,
            UsersByMonth        = usersByMonth,
            ApplicantsByMonth   = applicantsByMonth,
        };
    }

    // ----------------------------------------------------------------
    // ADMIN - All users list
    // ----------------------------------------------------------------
    public async Task<List<AdminUserResponse>> GetAllUsersAsync()
    {
        return await db.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserResponse
            {
                Id        = u.Id,
                FirstName = u.FirstName,
                MiddleName = u.MiddleName,
                LastName  = u.LastName,
                BirthDate = u.BirthDate,
                Email     = u.Email,
                UserRole  = u.UserRole,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt,
            })
            .ToListAsync();
    }

    // ----------------------------------------------------------------
    // ADMIN - Applicants for a specific user (read-only)
    // ----------------------------------------------------------------
    public async Task<PaginatedApplicantsResponse> GetUserApplicantsAsync(
        Guid targetUserId, int page, int pageSize, string? search)
    {
        var query = db.Applicants
            .AsNoTracking()
            .Where(a => a.CreatedBy == targetUserId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(a =>
                a.FirstName.ToLower().Contains(s) ||
                a.LastName.ToLower().Contains(s) ||
                a.Email.ToLower().Contains(s) ||
                a.ContactNumber.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedApplicantsResponse
        {
            Items      = items.Select(ApplicantResponse.FromModel).ToList(),
            TotalCount = total,
            Page       = page,
            PageSize   = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize),
        };
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------
    private static readonly HashSet<string> ValidStatuses =
    [
        "Applied", "Under Review", "Shortlisted", "Interview Scheduled",
        "Interviewed", "Offered", "Hired", "Rejected", "Withdrawn"
    ];

    private static bool IsValidStatus(string status) => ValidStatuses.Contains(status);
}
