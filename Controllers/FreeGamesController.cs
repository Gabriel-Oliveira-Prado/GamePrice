using System.Net.Http.Json;
using GamePrice.Api.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    public class FreeGamesController : Controller
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FreeGamesController> _logger;

        public FreeGamesController(
            HttpClient http,
            IConfiguration configuration,
            ILogger<FreeGamesController> logger)
        {
            _http = http;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("/Home/FreeGames")]
        public async Task<IActionResult> FreeGames()
        {
            var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
            var freeGames = new List<GameDealDto>();

            try
            {
                freeGames = await _http.GetFromJsonAsync<List<GameDealDto>>(
                    $"{baseApiUrl.TrimEnd('/')}/api/scraper/free-games") ?? new List<GameDealDto>();
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao carregar a página de Jogos Grátis");
            }

            return View("~/Views/Home/FreeGames.cshtml", freeGames);
        }
    }
}
