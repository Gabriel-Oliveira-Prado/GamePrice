using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace GamePrice.Services
{
    public sealed class AccountSessionService
    {
        private const string ApiTokenClaim = "gameprice_api_token";
        private readonly IConfiguration _configuration;

        public AccountSessionService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string ApiUrl(string path)
        {
            var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
            return $"{baseApiUrl.TrimEnd('/')}/{path.TrimStart('/')}";
        }

        public HttpRequestMessage? CreateAuthorizedRequest(
            HttpContext context,
            HttpMethod method,
            string path,
            object? body = null)
        {
            var token = context.User.FindFirstValue(ApiTokenClaim) ?? context.Request.Cookies["auth_token"];
            if (string.IsNullOrWhiteSpace(token))
                return null;

            var request = new HttpRequestMessage(method, ApiUrl(path));
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            if (body is not null)
                request.Content = JsonContent.Create(body);
            return request;
        }

        public async Task SignInAsync(
            HttpContext context,
            string name,
            string email,
            string token,
            DateTime expiresAt,
            bool isPersistent)
        {
            var displayName = string.IsNullOrWhiteSpace(name) ? "Minha conta" : name.Trim();
            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, displayName),
                new(ClaimTypes.GivenName, displayName),
                new(ClaimTypes.Email, email),
                new(ApiTokenClaim, token)
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var properties = new AuthenticationProperties
            {
                IsPersistent = isPersistent,
                ExpiresUtc = expiresAt
            };

            await context.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity),
                properties);

            context.Response.Cookies.Append("auth_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = context.Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Expires = expiresAt,
                Path = "/"
            });
        }
    }
}
