namespace Excel2Json.Auth
{
    public class JwtSettings
    {
        public string Secret { get; set; }

        public string Issuer { get; set; }

        public string Audience { get; set; }
    }
}
