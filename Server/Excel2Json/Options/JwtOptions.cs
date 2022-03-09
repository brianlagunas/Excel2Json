using System;

namespace Excel2Json.Options
{
    public class JwtOptions
    {
        public const string Key = "Jwt";

        public string Secret { get; set; }

        public string Issuer { get; set; }

        public string Audience { get; set; }

        public TimeSpan TokenLifetime { get; set; }
    }
}
