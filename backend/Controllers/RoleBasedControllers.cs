using backend.DTOs.Requests;
using backend.DTOs.Responses;
using backend.Middleware;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

// ----------------------------------------------------------------
// Member routes — Admin + Member (Applicants + Member Dashboard)
// ----------------------------------------------------------------
[ApiController]
[RequireRole("Admin", "Member")]
public class ManagerController(IApplicantService applicantService) : ControllerBase
{
    private Guid CurrentUserId =>
        (Guid)HttpContext.Items["UserId"]!;

    [HttpGet("api/member/test")]
    public IActionResult Test() =>
        Ok(new { message = "You are authorized for members!" });

    // ----------------------------------------------------------------
    // GET /api/member/dashboard
    // ----------------------------------------------------------------
    [HttpGet("api/member/dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var data = await applicantService.GetMemberDashboardAsync(CurrentUserId);
        return Ok(data);
    }

    // ----------------------------------------------------------------
    // GET /api/member/applicants?page=1&pageSize=10&search=
    // ----------------------------------------------------------------
    [HttpGet("api/member/applicants")]
    public async Task<IActionResult> GetApplicants(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var result = await applicantService.GetApplicantsAsync(CurrentUserId, page, pageSize, search);
        return Ok(result);
    }

    // ----------------------------------------------------------------
    // GET /api/member/applicants/{id}
    // ----------------------------------------------------------------
    [HttpGet("api/member/applicants/{id:guid}")]
    public async Task<IActionResult> GetApplicant(Guid id)
    {
        var applicant = await applicantService.GetApplicantByIdAsync(CurrentUserId, id);
        if (applicant is null)
            return NotFound(new { message = "Applicant not found" });
        return Ok(new { applicant });
    }

    // ----------------------------------------------------------------
    // POST /api/member/applicants
    // ----------------------------------------------------------------
    [HttpPost("api/member/applicants")]
    public async Task<IActionResult> CreateApplicant([FromBody] CreateApplicantRequest request)
    {
        var (applicant, error, statusCode) = await applicantService.CreateApplicantAsync(CurrentUserId, request);
        if (applicant is null)
            return StatusCode(statusCode, new { message = error });
        return StatusCode(statusCode, new { applicant });
    }

    // ----------------------------------------------------------------
    // PATCH /api/member/applicants/{id}
    // ----------------------------------------------------------------
    [HttpPatch("api/member/applicants/{id:guid}")]
    public async Task<IActionResult> UpdateApplicant(Guid id, [FromBody] UpdateApplicantRequest request)
    {
        var (success, error, statusCode) = await applicantService.UpdateApplicantAsync(CurrentUserId, id, request);
        if (!success)
            return StatusCode(statusCode, new { message = error });
        return Ok(new { message = "Applicant updated" });
    }

    // ----------------------------------------------------------------
    // DELETE /api/member/applicants/{id}
    // ----------------------------------------------------------------
    [HttpDelete("api/member/applicants/{id:guid}")]
    public async Task<IActionResult> DeleteApplicant(Guid id)
    {
        var (success, error, statusCode) = await applicantService.DeleteApplicantAsync(CurrentUserId, id);
        if (!success)
            return StatusCode(statusCode, new { message = error });
        return Ok(new { message = "Applicant deleted" });
    }
}

// ----------------------------------------------------------------
// Admin routes — Admin only (Users + Admin Dashboard)
// ----------------------------------------------------------------
[ApiController]
[RequireRole("Admin")]
public class AdminController(IApplicantService applicantService) : ControllerBase
{
    [HttpGet("api/admin/test")]
    public IActionResult Test() =>
        Ok(new { message = "You are authorized for admin!" });

    // ----------------------------------------------------------------
    // GET /api/admin/dashboard
    // ----------------------------------------------------------------
    [HttpGet("api/admin/dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var data = await applicantService.GetAdminDashboardAsync();
        return Ok(data);
    }

    // ----------------------------------------------------------------
    // GET /api/admin/users
    // ----------------------------------------------------------------
    [HttpGet("api/admin/users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await applicantService.GetAllUsersAsync();
        return Ok(new { users });
    }

    // ----------------------------------------------------------------
    // GET /api/admin/users/{userId}/applicants?page=1&pageSize=10&search=
    // ----------------------------------------------------------------
    [HttpGet("api/admin/users/{userId:guid}/applicants")]
    public async Task<IActionResult> GetUserApplicants(
        Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var result = await applicantService.GetUserApplicantsAsync(userId, page, pageSize, search);
        return Ok(result);
    }
}
