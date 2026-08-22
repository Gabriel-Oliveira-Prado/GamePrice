using System.Net.Http.Json;
using GamePrice.Api.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    public class DetailsController : Controller
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;
        private readonly ILogger<DetailsController> _logger;

        public DetailsController(
            HttpClient http,
            IConfiguration configuration,
            ILogger<DetailsController> logger)
        {
            _http = http;
            _http.Timeout = TimeSpan.FromSeconds(180);
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("/Search/Details")]
        public async Task<IActionResult> Details([FromQuery] string gameName)
        {
            if (string.IsNullOrWhiteSpace(gameName))
            {
                ViewBag.GameName = "Jogo Não Especificado";
                return View("~/Views/Search/Details.cshtml", new List<PythonStoreResultDto>());
            }

            ViewBag.GameName = gameName;

            try
            {
                var baseUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var apiUrl = $"{baseUrl.TrimEnd('/')}/api/scraper/prices?gameName={Uri.EscapeDataString(gameName)}";
                _logger.LogInformation("Carregando página de detalhes para: '{GameName}' via {Url}", gameName, apiUrl);

                var response = await _http.GetAsync(apiUrl);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "API retornou erro {StatusCode} ao carregar detalhes para {GameName}",
                        response.StatusCode,
                        gameName);
                    return View("~/Views/Search/Details.cshtml", new List<PythonStoreResultDto>());
                }

                var data = await response.Content.ReadFromJsonAsync<List<PythonStoreResultDto>>();
                return View("~/Views/Search/Details.cshtml", data ?? new List<PythonStoreResultDto>());
            }
            catch (Exception error)
            {
                _logger.LogError(error, "Erro ao carregar detalhes do jogo {GameName}", gameName);
                return View("~/Views/Search/Details.cshtml", new List<PythonStoreResultDto>());
            }
        }
    }
}
