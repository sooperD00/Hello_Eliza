using System;
using System.ComponentModel.DataAnnotations;

namespace Hello_Eliza.Models
{
    // Custom attribute ensures error message and test conditions always match MaxLength constant
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class MaxLengthAttribute(int maxLength) : ValidationAttribute
    {
        private readonly int _maxLength = maxLength;

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is string str && str.Length > _maxLength)
            {
                var errorMessage = ErrorMessage ?? $"Input cannot exceed {_maxLength} characters.";
                return new ValidationResult(errorMessage);
            }

            return ValidationResult.Success;
        }
    }
}
