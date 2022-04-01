namespace Excel2Json.Contracts.Responses
{
    public class AuthResponse
    {
        public string ImageUrl { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public bool IsAuthenticated { get; set; } = false;
        public string Error { get; set; }
    }
}
