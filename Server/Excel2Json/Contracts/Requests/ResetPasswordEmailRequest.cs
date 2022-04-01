using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Contracts.Requests
{
    public class ResetPasswordEmailRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
