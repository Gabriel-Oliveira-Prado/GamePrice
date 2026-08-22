using System.Net.Http.Json;
using GamePrice.Models;
using GamePrice.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    [Route("Account")]
    public class LoginController : Controller
    {
        private readonly HttpClient _http;
        private readonly AccountSessionService _session;
        private readonly ILogger<LoginController> _logger;

        public LoginController(
            HttpClient http,
            AccountSessionService session,
            ILogger<LoginController> logger)
        {
            _http = http;
            _session = session;
            _logger = logger;
        }

        [HttpGet("Login")]
        public IActionResult Login([FromQuery] string? returnUrl = null)
        {
            if (User.Identity?.IsAuthenticated == true)
                return RedirectToAction("Index", "Home");

            ViewBag.ReturnUrl = returnUrl;
            return View("~/Views/Account/Login.cshtml", new LoginViewModel());
        }

        [HttpPost("Login")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
        {
            if (!ModelState.IsValid)
            {
                ViewData["ErrorMessage"] = "Revise os campos destacados para entrar.";
                ViewBag.ReturnUrl = returnUrl;
                return View("~/Views/Account/Login.cshtml", model);
            }

            try
            {
                var response = await _http.PostAsJsonAsync(
                    _session.ApiUrl("api/auth/login"),
                    new { email = model.Email, password = model.Password });

                if (!response.IsSuccessStatusCode)
                {
                    ViewData["ErrorMessage"] = "Não foi possível entrar com esses dados.";
                    ModelState.AddModelError(string.Empty, "Credenciais inválidas. Verifique seu email e senha.");
                    ViewBag.ReturnUrl = returnUrl;
                    return View("~/Views/Account/Login.cshtml", model);
                }

                var tokenData = await response.Content.ReadFromJsonAsync<TokenResponse>();
                if (tokenData is null || string.IsNullOrWhiteSpace(tokenData.Token))
                {
                    _logger.LogWarning("Resposta de login sem token para {Email}", model.Email);
                    ViewData["ErrorMessage"] = "Não foi possível entrar agora.";
                    ModelState.AddModelError(string.Empty, "Não foi possível entrar agora. Tente novamente em instantes.");
                    ViewBag.ReturnUrl = returnUrl;
                    return View("~/Views/Account/Login.cshtml", model);
                }

                await _session.SignInAsync(
                    HttpContext,
                    tokenData.Name,
                    tokenData.Email,
                    tokenData.Token,
                    tokenData.ExpiresAt,
                    model.RememberMe);

                _logger.LogInformation("Usuário {Email} logado com sucesso.", model.Email);
                TempData["SuccessMessage"] = "Login realizado com sucesso.";

                return !string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl)
                    ? Redirect(returnUrl)
                    : RedirectToAction("Index", "Home");
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao realizar login");
                ViewData["ErrorMessage"] = "Não foi possível entrar agora.";
                ModelState.AddModelError(string.Empty, "Não foi possível entrar agora. Tente novamente em instantes.");
                ViewBag.ReturnUrl = returnUrl;
                return View("~/Views/Account/Login.cshtml", model);
            }
        }

        [Authorize]
        [HttpPost("Logout")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var request = _session.CreateAuthorizedRequest(HttpContext, HttpMethod.Post, "api/auth/logout");
                if (request is not null)
                    await _http.SendAsync(request);
            }
            catch (Exception error)
            {
                _logger.LogWarning(error, "Erro ao chamar logout da API");
            }

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            Response.Cookies.Delete("auth_token");
            TempData["SuccessMessage"] = "Você saiu da sua conta.";
            return RedirectToAction("Index", "Home");
        }

        private sealed class TokenResponse
        {
            public string Token { get; set; } = string.Empty;
            public DateTime ExpiresAt { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }
    }
}
