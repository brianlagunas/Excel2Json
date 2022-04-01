using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Contracts.Requests
{
    public class GoogleSignInRequest
    {
        [Required]
        public string Token { get; set; }
    }
}
