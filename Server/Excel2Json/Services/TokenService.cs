using Excel2Json.Options;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
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
        Task<GoogleJsonWebSignature.Payload> ValidateGoogleTokenAsync(string token);
    }

    public class TokenService : ITokenService
    {
        private readonly JwtOptions _jwtOptions;
        private readonly GoogleOptions _googleOptions;

        public TokenService(IOptions<JwtOptions> jwtOptions, IOptions<GoogleOptions> googleOptions)
        {
            _jwtOptions = jwtOptions.Value;
            _googleOptions = googleOptions.Value;
        }

        public string BuildToken(IdentityUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtOptions.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = _jwtOptions.Audience,
                Issuer = _jwtOptions.Issuer,
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id),
                    new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public async Task<GoogleJsonWebSignature.Payload> ValidateGoogleTokenAsync(string token)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(token, new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new[] { _googleOptions.ClientId }
                });

                return payload;
            }
            catch
            {
                return null;
            }
        }
    }
}
