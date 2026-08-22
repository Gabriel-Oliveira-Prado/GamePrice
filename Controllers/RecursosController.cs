using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    public class RecursosController : Controller
    {
        [HttpGet("/Home/Recursos")]
        public IActionResult Recursos() => View("~/Views/Home/Recursos.cshtml");
    }
}
