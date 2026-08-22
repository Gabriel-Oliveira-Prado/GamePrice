using Microsoft.AspNetCore.Mvc;

namespace GamePrice.Controllers
{
    public class TermsController : Controller
    {
        [HttpGet("/Home/Terms")]
        public IActionResult Terms() => View("~/Views/Home/Terms.cshtml");
    }
}
