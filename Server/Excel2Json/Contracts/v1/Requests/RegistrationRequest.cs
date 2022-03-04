using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Controllers.v1.Requests
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