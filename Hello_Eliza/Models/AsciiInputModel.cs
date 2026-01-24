using System.ComponentModel.DataAnnotations;

namespace Hello_Eliza.Models
{
    public class AsciiInputModel
    {
        // Public so tests can reference it dynamically
        public const int MaxLength = 200;

        [Required(ErrorMessage = "Please enter some text.")]
        [MaxLength(MaxLength)]
        public required string UserInput { get; set; }

        // Optional: font selection for future stretch goal
        public string Font { get; set; } = "Standard";
    }
}
