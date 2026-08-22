using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    public class PrivacyController : Controller
    {
        [HttpGet("/Home/Privacy")]
        public IActionResult Privacy() => View("~/Views/Home/Privacy.cshtml");
    }
}
