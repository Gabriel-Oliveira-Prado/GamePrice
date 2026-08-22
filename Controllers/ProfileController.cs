using System.Net.Http.Json;
using GamePrice.Api.Domain.DTOs;
using GamePrice.Models;
using GamePrice.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    [Authorize]
    [Route("Account")]
    public class ProfileController : Controller
    {
        private readonly HttpClient _http;
        private readonly AccountSessionService _session;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(
            HttpClient http,
            AccountSessionService session,
            ILogger<ProfileController> logger)
        {
            _http = http;
            _session = session;
            _logger = logger;
        }

        [HttpGet("Settings")]
        public async Task<IActionResult> Settings()
        {
            var model = new ProfilePageViewModel();
            if (!await LoadProfileAsync(model, replaceProfileFields: true))
            {
                TempData["ErrorMessage"] = "Não foi possível carregar seu perfil.";
                return RedirectToAction("Index", "Home");
            }

            return View("~/Views/Account/Settings.cshtml", model);
        }

        [HttpPost("UpdateProfile")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProfile(ProfilePageViewModel model)
        {
            RemoveModelStatePrefix("Password");
            if (!ModelState.IsValid)
            {
                ViewData["ErrorMessage"] = "Revise os campos destacados antes de salvar.";
                await LoadProfileAsync(model, replaceProfileFields: false);
                return View("~/Views/Account/Settings.cshtml", model);
            }

            try
            {
                using var request = _session.CreateAuthorizedRequest(
                    HttpContext,
                    HttpMethod.Put,
                    "api/profile",
                    new UpdateProfileRequestDto
                    {
                        Name = model.Profile.Name,
                        Email = model.Profile.Email
                    });
                if (request is null)
                    return Challenge();

                using var response = await _http.SendAsync(request);
                if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
                {
                    ViewData["ErrorMessage"] = "Este email já está em uso.";
                    ModelState.AddModelError("Profile.Email", "Este email já está em uso.");
                    await LoadProfileAsync(model, replaceProfileFields: false);
                    return View("~/Views/Account/Settings.cshtml", model);
                }
                if (!response.IsSuccessStatusCode)
                {
                    ViewData["ErrorMessage"] = "Não foi possível atualizar o perfil.";
                    ModelState.AddModelError(string.Empty, "Não foi possível atualizar o perfil.");
                    await LoadProfileAsync(model, replaceProfileFields: false);
                    return View("~/Views/Account/Settings.cshtml", model);
                }

                var updated = await response.Content.ReadFromJsonAsync<ProfileUpdateResponseDto>();
                if (updated is null || string.IsNullOrWhiteSpace(updated.Token))
                {
                    ViewData["ErrorMessage"] = "Não foi possível concluir a atualização do perfil.";
                    await LoadProfileAsync(model, replaceProfileFields: false);
                    return View("~/Views/Account/Settings.cshtml", model);
                }

                var authentication = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                await _session.SignInAsync(
                    HttpContext,
                    updated.Profile.Name,
                    updated.Profile.Email,
                    updated.Token,
                    updated.ExpiresAt,
                    authentication.Properties?.IsPersistent == true);

                TempData["SuccessMessage"] = "Perfil atualizado com sucesso.";
                return RedirectToAction(nameof(Settings));
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao atualizar perfil");
                ViewData["ErrorMessage"] = "Não foi possível atualizar o perfil agora.";
                await LoadProfileAsync(model, replaceProfileFields: false);
                return View("~/Views/Account/Settings.cshtml", model);
            }
        }

        [HttpPost("ChangePassword")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(ProfilePageViewModel model)
        {
            RemoveModelStatePrefix("Profile");
            if (!ModelState.IsValid)
            {
                ViewData["ErrorMessage"] = "Revise os campos destacados antes de atualizar a senha.";
                await LoadProfileAsync(model, replaceProfileFields: true);
                return View("~/Views/Account/Settings.cshtml", model);
            }

            try
            {
                using var request = _session.CreateAuthorizedRequest(
                    HttpContext,
                    HttpMethod.Put,
                    "api/profile/password",
                    new ChangePasswordRequestDto
                    {
                        CurrentPassword = model.Password.CurrentPassword,
                        NewPassword = model.Password.NewPassword,
                        ConfirmNewPassword = model.Password.ConfirmNewPassword
                    });
                if (request is null)
                    return Challenge();

                using var response = await _http.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    ViewData["ErrorMessage"] = "Não foi possível atualizar a senha.";
                    ModelState.AddModelError("Password.CurrentPassword", "Confira sua senha atual e tente novamente.");
                    await LoadProfileAsync(model, replaceProfileFields: true);
                    return View("~/Views/Account/Settings.cshtml", model);
                }

                TempData["SuccessMessage"] = "Senha atualizada com sucesso.";
                return RedirectToAction(nameof(Settings));
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao atualizar senha");
                ViewData["ErrorMessage"] = "Não foi possível atualizar a senha agora.";
                await LoadProfileAsync(model, replaceProfileFields: true);
                return View("~/Views/Account/Settings.cshtml", model);
            }
        }

        private async Task<bool> LoadProfileAsync(ProfilePageViewModel model, bool replaceProfileFields)
        {
            try
            {
                using var request = _session.CreateAuthorizedRequest(HttpContext, HttpMethod.Get, "api/profile");
                if (request is null)
                    return false;

                using var response = await _http.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                    return false;

                var profile = await response.Content.ReadFromJsonAsync<UserProfileDto>();
                if (profile is null)
                    return false;

                if (replaceProfileFields)
                {
                    model.Profile.Name = profile.Name;
                    model.Profile.Email = profile.Email;
                }

                model.CreatedAt = profile.CreatedAt;
                model.LastLoginAt = profile.LastLoginAt;
                model.WishlistCount = profile.WishlistCount;
                return true;
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao carregar perfil");
                return false;
            }
        }

        private void RemoveModelStatePrefix(string prefix)
        {
            foreach (var key in ModelState.Keys
                .Where(key => key.StartsWith(prefix + ".", StringComparison.Ordinal))
                .ToList())
            {
                ModelState.Remove(key);
            }
        }
    }
}
