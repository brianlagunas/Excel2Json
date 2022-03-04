using System.Text.Json.Serialization;

namespace Excel2Json.Contracts.v1.Responses
{
    public class AuthResponse
    {
        public string ImageUrl { get; set; }
        public string Token { get; set; }
        [JsonIgnore]
        public string RefreshToken { get; set; }
        public bool IsAuthenticated { get; set; } = false;
        public string Error { get; set; }
    }
}
