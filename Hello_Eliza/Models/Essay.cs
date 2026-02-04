namespace Hello_Eliza.Models;

public class Essay
{
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public string Content { get; set; } = string.Empty;  // Rendered HTML
    public bool Published { get; set; } = true;
}
