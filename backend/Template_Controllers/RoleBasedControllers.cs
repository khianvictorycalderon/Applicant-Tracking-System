using backend.Middleware;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

// ----------------------------------------------------------------
// Manager routes  — Admin + User
// ----------------------------------------------------------------
[ApiController]
[RequireRole("Admin", "Member")]
public class ManagerController : ControllerBase
{
    [HttpGet("api/member/test")]
    public IActionResult Test() =>
        Ok(new { message = "You are authorized for members!" });
}

// ----------------------------------------------------------------
// Admin routes  — Admin only
// ----------------------------------------------------------------
[ApiController]
[RequireRole("Admin")]
public class AdminController : ControllerBase
{
    [HttpGet("api/admin/test")]
    public IActionResult Test() =>
        Ok(new { message = "You are authorized for admin!" });
}
