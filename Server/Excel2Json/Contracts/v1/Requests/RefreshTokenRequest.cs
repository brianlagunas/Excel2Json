using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Contracts.v1.Requests
{
    public class RefreshTokenRequest
    {
        [Required]
        public string Token { get; set; }
        [Required]
        public string RefreshToken { get; set; }
    }
}
