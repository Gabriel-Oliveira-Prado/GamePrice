using System.Net.Http.Json;
using GamePrice.Models;
using GamePrice.Services;
using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    [Route("Account")]
    public class RegisterController : Controller
    {
        private readonly HttpClient _http;
        private readonly AccountSessionService _session;
        private readonly ILogger<RegisterController> _logger;

        public RegisterController(
            HttpClient http,
            AccountSessionService session,
            ILogger<RegisterController> logger)
        {
            _http = http;
            _session = session;
            _logger = logger;
        }

        [HttpGet("Register")]
        public IActionResult Register()
        {
            if (User.Identity?.IsAuthenticated == true)
                return RedirectToAction("Index", "Home");

            return View("~/Views/Account/Register.cshtml", new RegisterViewModel());
        }

        [HttpPost("Register")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                ViewData["ErrorMessage"] = "Revise os campos destacados para criar sua conta.";
                return View("~/Views/Account/Register.cshtml", model);
            }

            try
            {
                var response = await _http.PostAsJsonAsync(_session.ApiUrl("api/auth/register"), new
                {
                    name = model.Name,
                    email = model.Email,
                    password = model.Password,
                    confirmPassword = model.ConfirmPassword
                });

                if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
                {
                    ViewData["ErrorMessage"] = "Este email já está cadastrado.";
                    ModelState.AddModelError("Email", "Este email já está cadastrado.");
                    return View("~/Views/Account/Register.cshtml", model);
                }

                if (!response.IsSuccessStatusCode)
                {
                    ViewData["ErrorMessage"] = "Não foi possível criar sua conta agora.";
                    ModelState.AddModelError(string.Empty, "Não foi possível criar sua conta agora. Tente novamente em instantes.");
                    return View("~/Views/Account/Register.cshtml", model);
                }

                TempData["SuccessMessage"] = "Conta criada com sucesso! Faça login abaixo.";
                return RedirectToAction("Login", "Login");
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao registrar usuário");
                ViewData["ErrorMessage"] = "Não foi possível criar sua conta agora.";
                ModelState.AddModelError(string.Empty, "Não foi possível criar sua conta agora. Tente novamente em instantes.");
                return View("~/Views/Account/Register.cshtml", model);
            }
        }
    }
}
