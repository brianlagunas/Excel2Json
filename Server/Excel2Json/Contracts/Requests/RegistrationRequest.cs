using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Contracts.Requests
{
    public class RegistrationRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}