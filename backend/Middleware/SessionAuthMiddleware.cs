using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Middleware;

/// <summary>
/// Validates the session_id cookie on every request and attaches
/// the resolved user claims to HttpContext.Items for downstream use.
/// </summary>
public class SessionAuthMiddleware(RequestDelegate next)
{
    private const string CookieName = "session_id";

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        if (context.Request.Cookies.TryGetValue(CookieName, out var rawId)
            && Guid.TryParse(rawId, out var sessionId))
        {
            var now = DateTime.UtcNow;

            var result = await db.Sessions
                .AsNoTracking()
                .Where(s => s.Id == sessionId && s.ExpiresAt > now)
                .Select(s => new
                {
                    s.UserId,
                    s.User.Email,
                    s.User.UserRole
                })
                .FirstOrDefaultAsync();

            if (result is not null)
            {
                context.Items["UserId"]   = result.UserId;
                context.Items["Email"]    = result.Email;
                context.Items["UserRole"] = result.UserRole;
                context.Items["SessionId"] = sessionId;
            }
        }

        await next(context);
    }
}

public static class SessionAuthMiddlewareExtensions
{
    public static IApplicationBuilder UseSessionAuth(this IApplicationBuilder app)
        => app.UseMiddleware<SessionAuthMiddleware>();
}
