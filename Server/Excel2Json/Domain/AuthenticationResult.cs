namespace Excel2Json.Domain
{
    public class AuthenticationResult : ServiceResult
    {
        public string ImageURL { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}
