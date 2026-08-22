using System.Net.Http.Json;
using GamePrice.Api.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    public class OfertasController : Controller
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OfertasController> _logger;

        public OfertasController(
            HttpClient http,
            IConfiguration configuration,
            ILogger<OfertasController> logger)
        {
            _http = http;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("/Home/Ofertas")]
        public async Task<IActionResult> Ofertas()
        {
            var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
            var deals = new List<GameDealDto>();

            try
            {
                deals = await _http.GetFromJsonAsync<List<GameDealDto>>(
                    $"{baseApiUrl.TrimEnd('/')}/api/scraper/deals") ?? new List<GameDealDto>();
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao carregar a página de Ofertas");
            }

            return View("~/Views/Home/Ofertas.cshtml", deals);
        }
    }
}
