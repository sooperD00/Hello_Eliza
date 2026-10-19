using Hello_Eliza.Models;
using Microsoft.AspNetCore.Mvc;
using Hell0_TDD.Core;

namespace Hello_Eliza.Controllers
{
    public class AsciiController : Controller
    {
        public AsciiController() { } // Explicit, ensures tests can instantiate

        // GET: /Ascii/Input
        [HttpGet]
        public IActionResult Input()
        {
            return View(new AsciiInputModel { UserInput = "" }); // satisfies 'required'
        }

        // GET: /Ascii/Privacy
        [HttpGet]
        public IActionResult Privacy()
        {
            return View();
        }

        // GET: /Ascii/Cave
        [HttpGet]
        public IActionResult Cave()
        {
            return View();
        }

        // GET: /Ascii/Error (production exception handler, see Program.cs)
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel
            {
                RequestId = System.Diagnostics.Activity.Current?.Id ?? HttpContext.TraceIdentifier
            });
        }

        [HttpPost]
        public IActionResult Input(AsciiInputModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            // Use Hell0_TDD.Core to render ASCII art
            ViewData["AsciiOutput"] = Hell0_TDD.Core.AsciiRenderer.RenderAscii(model.UserInput);
            return View(model);
        }
    }
}
