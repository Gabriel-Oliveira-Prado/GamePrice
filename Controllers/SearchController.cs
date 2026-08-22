using GamePrice.Api.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;

namespace GamePrice.Controllers
{
    public class SearchController : Controller
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SearchController> _logger;

        public SearchController(HttpClient http, IConfiguration configuration, ILogger<SearchController> logger)
        {
            _http = http;
            _http.Timeout = TimeSpan.FromSeconds(180); // Scraping 7 lojas com Selenium leva tempo
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("Search/SearchGame")]
        public async Task<IActionResult> SearchGame([FromQuery] string query)
        {
            query = query?.Trim() ?? string.Empty;
            if (query.Length < 2)
                return BadRequest("Informe o nome do jogo");

            try
            {
                var baseUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var apiUrl = $"{baseUrl.TrimEnd('/')}/api/scraper/search?query={Uri.EscapeDataString(query)}&limit=8";
                
                _logger.LogInformation("Buscando jogo: '{Query}' em {Url}", query, apiUrl);

                var response = await _http.GetAsync(apiUrl);
                
                _logger.LogInformation("Resposta da API: {StatusCode}", response.StatusCode);

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return Json(new List<GameSearchSuggestionDto>());
                }

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("API retornou erro {StatusCode}: {Body}", response.StatusCode, errorBody);
                    return StatusCode(502, "Não foi possível pesquisar agora. Tente novamente em instantes.");
                }

                var data = await response.Content.ReadFromJsonAsync<List<GameSearchSuggestionDto>>();

                if (data == null || data.Count == 0)
                    return Json(new List<GameSearchSuggestionDto>());

                _logger.LogInformation("Pesquisa encontrou {Count} titulo(s) para: {Query}", data.Count, query);
                return Json(data);
            }
            catch (TaskCanceledException)
            {
                _logger.LogWarning("Timeout ao buscar jogo: '{Query}'", query);
                return StatusCode(504, "Tempo esgotado ao buscar jogos. Tente novamente.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Erro de conexão com a API para o jogo: '{Query}'", query);
                return StatusCode(502, "Não foi possível pesquisar agora. Tente novamente em instantes.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao buscar jogo: '{Query}'", query);
                return StatusCode(500, "Não foi possível pesquisar agora. Tente novamente em instantes.");
            }
        }

        [HttpGet("Search/GetDeals")]
        public async Task<IActionResult> GetDeals()
        {
            try
            {
                var baseUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var apiUrl = $"{baseUrl.TrimEnd('/')}/api/scraper/deals";
                
                _logger.LogInformation("Carregando deals de: {Url}", apiUrl);

                var response = await _http.GetAsync(apiUrl);

                _logger.LogInformation("Resposta deals: {StatusCode}", response.StatusCode);

                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("API deals retornou {StatusCode}: {Body}", response.StatusCode, body);
                    return NotFound("Nenhuma oferta encontrada");
                }

                var data = await response.Content.ReadFromJsonAsync<List<GameDealDto>>();

                if (data == null || data.Count == 0)
                    return NotFound("Nenhuma oferta encontrada");

                _logger.LogInformation("Deals carregadas: {Count} ofertas", data.Count);
                return Json(data);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Erro de conexão ao carregar deals");
                return StatusCode(502, "Não foi possível atualizar as ofertas agora.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao carregar ofertas em destaque");
                return StatusCode(500, "Não foi possível atualizar as ofertas agora.");
            }
        }

    }
}
