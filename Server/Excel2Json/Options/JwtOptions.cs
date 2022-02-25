namespace Excel2Json.Options
{
    public class JwtOptions
    {
        public const string Jwt = "Jwt";

        public string Secret { get; set; }

        public string Issuer { get; set; }

        public string Audience { get; set; }
    }
}
