using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Contracts.v1.Requests
{
    public class GoogleSignInRequest
    {
        [Required]
        public string Token { get; set; }
    }
}
