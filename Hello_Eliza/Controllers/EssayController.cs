using Microsoft.AspNetCore.Mvc;
using Hell0_Web.Models;
using Markdig;
using Markdig.Extensions.Yaml;
using Markdig.Syntax;
using YamlDotNet.Serialization;

namespace Hell0_Web.Controllers;

public class EssayController : Controller
{
    private readonly string _essaysPath;
    private readonly MarkdownPipeline _pipeline;
    private readonly IDeserializer _yamlDeserializer;

    public EssayController(IWebHostEnvironment env)
    {
        _essaysPath = Path.Combine(env.ContentRootPath, "Content", "Essays");
        _pipeline = new MarkdownPipelineBuilder()
            .UseYamlFrontMatter()
            .UseAdvancedExtensions()
            .Build();
        _yamlDeserializer = new DeserializerBuilder().Build();
    }

    // GET: /essays or /blogs (route both in Program.cs if you want)
    public IActionResult Index()
    {
        var essays = GetAllEssays()
            .Where(e => e.Published)
            .OrderByDescending(e => e.Date)
            .ToList();

        return View(essays);
    }

    // GET: /essays/{slug}
    public IActionResult Detail(string slug)
    {
        var essay = GetAllEssays().FirstOrDefault(e => e.Slug == slug);
        
        if (essay == null || !essay.Published)
            return NotFound();

        return View(essay);
    }

    private List<Essay> GetAllEssays()
    {
        var essays = new List<Essay>();

        if (!Directory.Exists(_essaysPath))
            return essays;

        foreach (var file in Directory.GetFiles(_essaysPath, "*.md", SearchOption.AllDirectories))
        {
            var essay = ParseEssay(file);
            if (essay != null)
                essays.Add(essay);
        }

        return essays;
    }

    private Essay? ParseEssay(string filePath)
    {
        try
        {
            var markdown = System.IO.File.ReadAllText(filePath);
            var document = Markdown.Parse(markdown, _pipeline);

            // Extract YAML frontmatter
            var yamlBlock = document.Descendants<YamlFrontMatterBlock>().FirstOrDefault();
            var frontmatter = new Dictionary<string, string>();

            if (yamlBlock != null)
            {
                var yamlText = markdown.Substring(yamlBlock.Span.Start, yamlBlock.Span.Length)
                    .Trim('-', '\n', '\r');
                frontmatter = _yamlDeserializer.Deserialize<Dictionary<string, string>>(yamlText) 
                    ?? new Dictionary<string, string>();
            }

            // Render markdown (excluding frontmatter)
            var html = Markdown.ToHtml(markdown, _pipeline);

            return new Essay
            {
                Slug = Path.GetFileNameWithoutExtension(filePath),
                Title = frontmatter.GetValueOrDefault("title", "Untitled"),
                Date = DateTime.TryParse(frontmatter.GetValueOrDefault("date", ""), out var date) 
                    ? date 
                    : System.IO.File.GetCreationTime(filePath),
                Description = frontmatter.GetValueOrDefault("description"),
                Published = !bool.TryParse(frontmatter.GetValueOrDefault("published", "true"), out var pub) || pub,
                Content = html
            };
        }
        catch
        {
            return null;
        }
    }
}
