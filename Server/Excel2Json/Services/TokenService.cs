using Excel2Json.Domain;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Excel2Json.Services
{
    public interface ITokenService
    {
        string BuildToken(IdentityUser user);

        bool ValidateToken(string token);

        Task<GoogleJsonWebSignature.Payload> ValidateGoogleToken(string token);
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly JwtSettings _jwtSettings;

        public TokenService(IConfiguration configuration, JwtSettings jwtSettings)
        {
            _configuration = configuration;
            _jwtSettings = jwtSettings;
        }

        public string BuildToken(IdentityUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public bool ValidateToken(string token)
        {
            throw new NotImplementedException();
        }

        public async Task<GoogleJsonWebSignature.Payload> ValidateGoogleToken(string token)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(token, new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new[] { _configuration["Authentication:Google:ClientId"] }
                });

                return payload;
            }
            catch (Exception ex)
            {
                //log an exception
                return null;
            }
        }
    }
}
