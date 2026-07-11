using GamePrice.Api.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json;

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
            if (string.IsNullOrEmpty(query))
                return BadRequest("Informe o nome do jogo");

            try
            {
                var baseUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";
                var apiUrl = $"{baseUrl.TrimEnd('/')}/api/scraper/prices?gameName={Uri.EscapeDataString(query)}";
                
                _logger.LogInformation("Buscando jogo: '{Query}' em {Url}", query, apiUrl);

                var response = await _http.GetAsync(apiUrl);
                
                _logger.LogInformation("Resposta da API: {StatusCode}", response.StatusCode);

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return Json(new List<PythonStoreResultDto>()); // Retorna lista vazia
                }

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("API retornou erro {StatusCode}: {Body}", response.StatusCode, errorBody);
                    return StatusCode(502, "Erro ao buscar jogos na API.");
                }

                var data = await response.Content.ReadFromJsonAsync<List<PythonStoreResultDto>>();

                if (data == null || data.Count == 0)
                    return Json(new List<PythonStoreResultDto>());

                _logger.LogInformation("Jogo encontrado: {Title}. Total de lojas: {Count}", data[0].Nome, data.Count);
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
                return StatusCode(502, "Não foi possível conectar à API. Verifique se GamePrice.Api está rodando.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao buscar jogo: '{Query}'", query);
                return StatusCode(500, "Erro ao buscar jogos. Tente novamente.");
            }
        }

        [HttpGet("Search/Details")]
        public async Task<IActionResult> Details([FromQuery] string gameName)
        {
            if (string.IsNullOrEmpty(gameName))
            {
                ViewBag.GameName = "Jogo Não Especificado";
                return View(new List<PythonStoreResultDto>());
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
                    _logger.LogWarning("API retornou erro {StatusCode} ao carregar detalhes para {GameName}", response.StatusCode, gameName);
                    return View(new List<PythonStoreResultDto>());
                }

                var data = await response.Content.ReadFromJsonAsync<List<PythonStoreResultDto>>();
                return View(data ?? new List<PythonStoreResultDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao carregar detalhes do jogo {GameName}", gameName);
                return View(new List<PythonStoreResultDto>());
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
                return StatusCode(502, "Não foi possível conectar à API. Verifique se GamePrice.Api está rodando.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao carregar ofertas em destaque");
                return StatusCode(500, "Erro ao carregar ofertas em destaque.");
            }
        }

        [HttpGet("Search/Status")]
        public async Task<IActionResult> GetStatus()
        {
            var baseApiUrl = _configuration["ApiSettings:GamePriceApiUrl"] ?? "http://localhost:5098";

            // Ping da API
            bool apiOnline = false;
            long apiLatency = 0;
            JsonElement? apiHealthData = null;
            try
            {
                var sw = System.Diagnostics.Stopwatch.StartNew();
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                var response = await _http.GetAsync($"{baseApiUrl.TrimEnd('/')}/api/health", cts.Token);
                sw.Stop();
                apiOnline = response.IsSuccessStatusCode;
                apiLatency = sw.ElapsedMilliseconds;
                if (apiOnline)
                {
                    apiHealthData = await response.Content.ReadFromJsonAsync<JsonElement>();
                }
            }
            catch
            {
                apiOnline = false;
            }

            // Ping do Scraper
            bool scraperOnline = false;
            long scraperLatency = 0;
            try
            {
                var sw = System.Diagnostics.Stopwatch.StartNew();
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                var scraperUrl = _configuration["ApiSettings:ScraperApiUrl"] ?? "http://localhost:8000";
                var response = await _http.GetAsync($"{scraperUrl.TrimEnd('/')}/health", cts.Token);
                sw.Stop();
                scraperOnline = response.IsSuccessStatusCode;
                scraperLatency = sw.ElapsedMilliseconds;
            }
            catch
            {
                scraperOnline = false;
            }

            var overallStatus = apiOnline && scraperOnline ? "stable" : (apiOnline || scraperOnline ? "degraded" : "offline");

            return Json(new
            {
                overall = overallStatus,
                api = new { online = apiOnline, latency = apiLatency, details = apiHealthData },
                scraper = new { online = scraperOnline, latency = scraperLatency }
            });
        }
    }