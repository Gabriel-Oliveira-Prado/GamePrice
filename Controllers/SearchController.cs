using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace GamePrice.Controllers
{
    public class SearchController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public SearchController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<IActionResult> SearchGame(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty");

            // Flow: MVC -> API -> Scraper
            // Tenta pegar a URL do Docker (Env Var), senão usa localhost
            var baseUrl = Environment.GetEnvironmentVariable("API_URL") ?? "http://localhost:5200";
            var apiUrl = $"{baseUrl}/Search?query={query}";
            
            var client = _httpClientFactory.CreateClient();
            
            try 
            {
                var response = await client.GetStringAsync(apiUrl);
                return Content(response, "application/json");
            }
            catch
            {
                return StatusCode(500, new { error = "Falha ao conectar com a API GamePrice." });
            }
        }
    }
}