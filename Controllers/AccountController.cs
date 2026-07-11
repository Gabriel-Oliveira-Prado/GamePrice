using GamePrice.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace GamePrice.Controllers
{
    public class AccountController : Controller
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AccountController> _logger;

        public AccountController(HttpClient http, IConfiguration configuration, ILogger<AccountController> logger)
        {
            _http = http;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Login([FromQuery] string? returnUrl = null)
        {
            if (User.Identity?.IsAuthenticated == true)
                return RedirectToAction("Index", "Home");

            ViewBag.ReturnUrl = returnUrl;
            return View(new LoginViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, [FromQuery] string? returnUrl = null)
        {
            if (!ModelState.IsValid)
                return View(model);

            try
            {
                var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var loginUrl = $"{baseApiUrl.TrimEnd('/')}/api/auth/login";

                var response = await _http.PostAsJsonAsync(loginUrl, new { email = model.Email, password = model.Password });

                if (!response.IsSuccessStatusCode)
                {
                    ModelState.AddModelError("", "Credenciais inválidas. Verifique seu email e senha.");
                    return View(model);
                }

                var tokenData = await response.Content.ReadFromJsonAsync<TokenResponse>();
                if (tokenData == null || string.IsNullOrEmpty(tokenData.Token))
                {
                    ModelState.AddModelError("", "Falha ao processar resposta de autenticação.");
                    return View(model);
                }

                // Extrair nome do token JWT
                string userName = model.Email;
                var parts = tokenData.Token.Split('.');
                if (parts.Length > 1)
                {
                    try
                    {
                        var jsonStr = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(PadBase64(parts[1])));
                        using var doc = JsonDocument.Parse(jsonStr);
                        var root = doc.RootElement;
                        if (root.TryGetProperty("unique_name", out var nameProp))
                        {
                            userName = nameProp.GetString() ?? userName;
                        }
                        else if (root.TryGetProperty("name", out var nameProp2))
                        {
                            userName = nameProp2.GetString() ?? userName;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Erro ao decodificar nome do JWT");
                    }
                }

                // Autenticar localmente no MVC via Cookie
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, userName),
                    new Claim(ClaimTypes.Email, model.Email)
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = model.RememberMe,
                    ExpiresUtc = tokenData.ExpiresAt
                };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

                // Definir cookie auth_token na resposta para chamadas Ajax da API
                Response.Cookies.Append("auth_token", tokenData.Token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = tokenData.ExpiresAt,
                    Path = "/"
                });

                _logger.LogInformation("Usuário {Email} logado com sucesso.", model.Email);

                if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    return Redirect(returnUrl);

                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao realizar login");
                ModelState.AddModelError("", "Ocorreu um erro ao conectar ao serviço de autenticação.");
                return View(model);
            }
        }

        [HttpGet]
        public IActionResult Register()
        {
            if (User.Identity?.IsAuthenticated == true)
                return RedirectToAction("Index", "Home");

            return View(new RegisterViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            try
            {
                var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var registerUrl = $"{baseApiUrl.TrimEnd('/')}/api/auth/register";

                var response = await _http.PostAsJsonAsync(registerUrl, new { name = model.Name, email = model.Email, password = model.Password });

                if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
                {
                    ModelState.AddModelError("Email", "Este email já está cadastrado.");
                    return View(model);
                }

                if (!response.IsSuccessStatusCode)
                {
                    ModelState.AddModelError("", "Erro ao cadastrar usuário. Tente novamente.");
                    return View(model);
                }

                TempData["SuccessMessage"] = "Conta criada com sucesso! Faça login abaixo.";
                return RedirectToAction("Login");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao registrar usuário");
                ModelState.AddModelError("", "Ocorreu um erro ao conectar ao serviço de autenticação.");
                return View(model);
            }
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var logoutUrl = $"{baseApiUrl.TrimEnd('/')}/api/auth/logout";

                // Executa chamada de logout na API
                await _http.PostAsync(logoutUrl, null);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao chamar logout da API");
            }

            // Desloga localmente
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            // Apaga cookie da API
            Response.Cookies.Delete("auth_token");

            return RedirectToAction("Index", "Home");
        }

        private static string PadBase64(string base64)
        {
            base64 = base64.Replace('-', '+').Replace('_', '/');
            switch (base64.Length % 4)
            {
                case 2: base64 += "=="; break;
                case 3: base64 += "="; break;
            }
            return base64;
        }

        private class TokenResponse
        {
            public string Token { get; set; } = string.Empty;
            public DateTime ExpiresAt { get; set; }
        }
    }
}
