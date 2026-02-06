using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

public class FooterViewComponent : ViewComponent
{
    private readonly IWebHostEnvironment _env;
    private static readonly Random _random = new();

    public FooterViewComponent(IWebHostEnvironment env)
    {
        _env = env;
    }

    public IViewComponentResult Invoke(string page = "default")
    {
        var path = Path.Combine(_env.WebRootPath, "data", "footers.json");
        var json = System.IO.File.ReadAllText(path);
        var footers = JsonSerializer.Deserialize<Dictionary<string, List<string>>>(json);

        var pool = footers.ContainsKey(page) ? footers[page] : footers["default"];
        var quote = pool[_random.Next(pool.Count)];

        ViewBag.Quote = quote;
        ViewBag.Page = page;
        return View();
    }
}