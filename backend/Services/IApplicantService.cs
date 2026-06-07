using backend.DTOs.Requests;
using backend.DTOs.Responses;

namespace backend.Services;

public interface IApplicantService
{
    Task<PaginatedApplicantsResponse> GetApplicantsAsync(Guid userId, int page, int pageSize, string? search);
    Task<ApplicantResponse?> GetApplicantByIdAsync(Guid userId, Guid applicantId);
    Task<(ApplicantResponse? Applicant, string? Error, int StatusCode)> CreateApplicantAsync(Guid userId, CreateApplicantRequest request);
    Task<(bool Success, string? Error, int StatusCode)> UpdateApplicantAsync(Guid userId, Guid applicantId, UpdateApplicantRequest request);
    Task<(bool Success, string? Error, int StatusCode)> DeleteApplicantAsync(Guid userId, Guid applicantId);

    // Dashboard
    Task<MemberDashboardResponse> GetMemberDashboardAsync(Guid userId);
    Task<AdminDashboardResponse> GetAdminDashboardAsync();

    // Admin - users list
    Task<List<AdminUserResponse>> GetAllUsersAsync();

    // Admin - applicants for a specific user (read-only)
    Task<PaginatedApplicantsResponse> GetUserApplicantsAsync(Guid targetUserId, int page, int pageSize, string? search);
}
