using System.Net.Http.Json;
using System.Security.Claims;
using GamePrice.Api.Domain.DTOs;
using GamePrice.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    [Authorize]
    public class WishlistController : Controller
    {
        private const string ApiTokenClaim = "gameprice_api_token";
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;
        private readonly ILogger<WishlistController> _logger;

        public WishlistController(
            HttpClient http,
            IConfiguration configuration,
            ILogger<WishlistController> logger)
        {
            _http = http;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("/Wishlist")]
        public async Task<IActionResult> Wishlist()
        {
            var model = new WishlistPageViewModel();
            try
            {
                var request = CreateAuthorizedRequest(HttpMethod.Get, "api/wishlist");
                if (request is null)
                    return RedirectToAction("Login", "Login", new { returnUrl = Url.Action(nameof(Wishlist), "Wishlist") });

                var response = await _http.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    model.Items = await response.Content.ReadFromJsonAsync<List<WishlistItemDto>>()
                        ?? new List<WishlistItemDto>();
                }
                else
                {
                    ViewData["ErrorMessage"] = "Não foi possível carregar sua lista de desejos.";
                }
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao carregar lista de desejos");
                ViewData["ErrorMessage"] = "Não foi possível carregar sua lista de desejos.";
            }

            return View("Wishlist", model);
        }

        [HttpPost("/Wishlist/Add")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Add(string gameName, decimal? targetPrice, string? returnUrl)
        {
            if (string.IsNullOrWhiteSpace(gameName))
            {
                TempData["ErrorMessage"] = "Não foi possível identificar o jogo para salvar.";
                return !string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl)
                    ? Redirect(returnUrl)
                    : RedirectToAction("Index", "Home");
            }

            var request = CreateAuthorizedRequest(HttpMethod.Post, "api/wishlist", new WishlistRequestDto
            {
                GameName = gameName.Trim(),
                TargetPrice = targetPrice
            });
            if (request is null)
                return RedirectToAction("Login", "Login", new { returnUrl });

            await SendWithFeedbackAsync(
                request,
                $"{gameName} foi adicionado à sua lista.",
                "Não foi possível adicionar o jogo à lista.",
                "adicionar jogo à lista");

            return !string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl)
                ? Redirect(returnUrl)
                : RedirectToAction(nameof(Wishlist));
        }

        [HttpPost("/Wishlist/UpdateTarget")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateTarget(Guid id, decimal? targetPrice)
        {
            var request = CreateAuthorizedRequest(HttpMethod.Put, $"api/wishlist/{id}", new UpdateWishlistRequestDto
            {
                TargetPrice = targetPrice
            });
            if (request is null)
                return RedirectToAction("Login", "Login");

            await SendWithFeedbackAsync(
                request,
                "Preço desejado atualizado.",
                "Não foi possível atualizar o preço desejado.",
                "atualizar preço desejado");
            return RedirectToAction(nameof(Wishlist));
        }

        [HttpPost("/Wishlist/Remove")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Remove(Guid id)
        {
            var request = CreateAuthorizedRequest(HttpMethod.Delete, $"api/wishlist/{id}");
            if (request is null)
                return RedirectToAction("Login", "Login");

            await SendWithFeedbackAsync(
                request,
                "Jogo removido da sua lista.",
                "Não foi possível remover o jogo.",
                "remover jogo da lista");
            return RedirectToAction(nameof(Wishlist));
        }

        private async Task SendWithFeedbackAsync(
            HttpRequestMessage request,
            string successMessage,
            string errorMessage,
            string operation)
        {
            try
            {
                using (request)
                using (var response = await _http.SendAsync(request))
                {
                    TempData[response.IsSuccessStatusCode ? "SuccessMessage" : "ErrorMessage"] =
                        response.IsSuccessStatusCode ? successMessage : errorMessage;
                }
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao {Operation}", operation);
                TempData["ErrorMessage"] = errorMessage;
            }
        }

        private HttpRequestMessage? CreateAuthorizedRequest(HttpMethod method, string path, object? body = null)
        {
            var token = User.FindFirstValue(ApiTokenClaim) ?? Request.Cookies["auth_token"];
            if (string.IsNullOrWhiteSpace(token))
                return null;

            var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
            var request = new HttpRequestMessage(method, $"{baseApiUrl.TrimEnd('/')}/{path.TrimStart('/')}");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            if (body is not null)
                request.Content = JsonContent.Create(body);
            return request;
        }
    }
}
