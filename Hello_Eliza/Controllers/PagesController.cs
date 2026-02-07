using Microsoft.AspNetCore.Mvc;
using Markdig;

public class PagesController : Controller
{
    private readonly IWebHostEnvironment _env;
    private readonly MarkdownPipeline _pipeline;

    public PagesController(IWebHostEnvironment env)
    {
        _env = env;
        _pipeline = new MarkdownPipelineBuilder()
            .UseAdvancedExtensions()
            .Build();
    }

    [Route("faq")]
    public IActionResult Faq()
    {
        var path = Path.Combine(_env.ContentRootPath, "Content", "Pages", "faq.md");
        if (!System.IO.File.Exists(path))
            return NotFound();

        var markdown = System.IO.File.ReadAllText(path);
        ViewData["Title"] = "FAQ";
        ViewData["ContentHtml"] = Markdig.Markdown.ToHtml(markdown, _pipeline);
        return View("Page");
    }
}