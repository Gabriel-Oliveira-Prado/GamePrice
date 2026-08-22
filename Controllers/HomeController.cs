using GamePrice.Api.Domain.DTOs;
using GamePrice.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace GamePrice.Controllers
{
    public class HomeController : Controller
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;
        private readonly ILogger<HomeController> _logger;

        public HomeController(HttpClient http, IConfiguration configuration, ILogger<HomeController> logger)
        {
            _http = http;
            _http.Timeout = TimeSpan.FromSeconds(15); // Fast timeout for home page load
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            var model = new HomeViewModel();
            var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";

            // 1. Buscar Deals (ofertas em destaque)
            try
            {
                var dealsUrl = $"{baseApiUrl.TrimEnd('/')}/api/scraper/deals";
                var deals = await _http.GetFromJsonAsync<List<GameDealDto>>(dealsUrl);
                if (deals != null)
                {
                    model.Deals = deals;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao carregar ofertas em destaque para a Home.");
            }

            // 2. Buscar Jogos Gratuitos (pegar no máximo 4 para a Home)
            try
            {
                var freeUrl = $"{baseApiUrl.TrimEnd('/')}/api/scraper/free-games";
                var freeGames = await _http.GetFromJsonAsync<List<GameDealDto>>(freeUrl);
                if (freeGames != null)
                {
                    // Limita a 4 itens na home
                    model.FreeGames = freeGames.Count > 4 ? freeGames.GetRange(0, 4) : freeGames;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao carregar jogos gratuitos para a Home.");
            }

            return View(model);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
