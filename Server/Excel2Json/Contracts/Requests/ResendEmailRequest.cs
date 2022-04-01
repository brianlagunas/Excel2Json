using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Contracts.Requests
{
    public class ResendEmailRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
