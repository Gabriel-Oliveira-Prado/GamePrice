using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using GamePrice.Api.DTOs;

public class SearchController : Controller
{
    private readonly HttpClient _http;

    public SearchController(HttpClient http)
    {
        _http = http;
    }

    [HttpGet("Search/SearchGame")]
    public async Task<IActionResult> SearchGame([FromQuery] string query)
    {
        if (string.IsNullOrEmpty(query))
            return BadRequest("Informe o nome do jogo");

        try
        {
            // Chama a API GamePrice.Api na porta 5098
            var apiUrl = $"http://localhost:5098/api/scraper/price?gameName={Uri.EscapeDataString(query)}";
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
}