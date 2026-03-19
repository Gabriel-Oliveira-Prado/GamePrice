using GamePrice.Api.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;

    public class SearchController : Controller
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;

        public SearchController(HttpClient http, IConfiguration configuration)
        {
            _http = http;
            _configuration = configuration;
        }

        [HttpGet("Search/SearchGame")]
        public async Task<IActionResult> SearchGame([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
                return BadRequest("Informe o nome do jogo");

            try
            {
                // Chama a API GamePrice.Api lendo da configuração
                var baseUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var apiUrl = $"{baseUrl.TrimEnd('/')}/api/scraper/price?gameName={Uri.EscapeDataString(query)}";
                
                var data = await _http.GetFromJsonAsync<GamePriceDto>(apiUrl);

                if (data == null)
                    return NotFound("Jogo não encontrado");

                return Json(data); // Retorna JSON para o JS
            }
            catch
            {
                return StatusCode(500, "Erro ao buscar jogos. Tente novamente.");
            }
        }

        [HttpGet("Search/GetDeals")]
        public async Task<IActionResult> GetDeals()
        {
            try
            {
                var baseUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var apiUrl = $"{baseUrl.TrimEnd('/')}/api/scraper/deals";
                
                var data = await _http.GetFromJsonAsync<List<GameDealDto>>(apiUrl);

                if (data == null || data.Count == 0)
                    return NotFound("Nenhuma oferta encontrada");

                return Json(data);
            }
            catch
            {
                return StatusCode(500, "Erro ao carregar ofertas em destaque.");
            }
        }
    }