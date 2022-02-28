namespace Excel2Json.Domain
{
    public class AuthenticationResult
    {
        public string ImageURL { get; set; }
        public string Token { get; set; }
        public bool Success { get; set; }
        public string Error { get; set; }
    }
}
