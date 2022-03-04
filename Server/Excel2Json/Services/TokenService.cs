using Excel2Json.Data;
using Excel2Json.Domain;
using Excel2Json.Extensions;
using Excel2Json.Options;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
        Task<(string Token, string RefreshToken)> CreateAuthenticatedTokens(IdentityUser user);
        Task<(bool IsValid, string UserId)> ValidateTokenAsync(string token, string refreshToken);
        Task<GoogleJsonWebSignature.Payload> ValidateGoogleTokenAsync(string token);
    }

    public class TokenService : ITokenService
    {
        private readonly JwtOptions _jwtOptions;
        private readonly GoogleOptions _googleOptions;
        private readonly ApplicationDbContext _context;

        public TokenService(IOptions<JwtOptions> jwtOptions, IOptions<GoogleOptions> googleOptions, ApplicationDbContext applicationDbContext)
        {
            _jwtOptions = jwtOptions.Value;
            _googleOptions = googleOptions.Value;
            _context = applicationDbContext;
        }

        public async Task<(string Token, string RefreshToken)> CreateAuthenticatedTokens(IdentityUser user)
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
                Expires = DateTime.UtcNow.Add(_jwtOptions.TokenLifetime),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(token);

            var refreshToken = new RefreshToken()
            {
                JwtId = token.Id,
                UserId = user.Id,
                CreationDate = DateTime.UtcNow,
                ExpireDate = DateTime.UtcNow.AddMonths(6),
            };

            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            return (accessToken, refreshToken.Token);
        }

        public async Task<(bool IsValid, string UserId)> ValidateTokenAsync(string token, string refreshToken)
        {
            var claimsPrincipal = GetClaimsPrincipalFromToken(token);
            if (claimsPrincipal == null)
                return (false, null);

            var storedRefreshToken = await _context.RefreshTokens.SingleOrDefaultAsync(x => x.Token == refreshToken);
            if (storedRefreshToken == null) //refresh token not found in db
                return (false, null);

            if (DateTime.UtcNow > storedRefreshToken.ExpireDate) //refresh token has expired
                return (false, null);

            if (storedRefreshToken.IsUsed) //refresh token has already been used
                return (false, null);

            var jti = claimsPrincipal.GetJwtJti();
            if (storedRefreshToken.JwtId != jti) //the refresh token is not associated with the access token
                return (false, null);

            storedRefreshToken.IsUsed = true;
            _context.RefreshTokens.Update(storedRefreshToken);
            await _context.SaveChangesAsync();

            var userId = claimsPrincipal.GetUserId();
            return (true, userId);
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

        private ClaimsPrincipal GetClaimsPrincipalFromToken(string token)
        {
            try
            {
                //we are trying to check an expired token. To prevent an exception from being thrown, we must disable the lifetime validation
                //before the validation occurs. Instead of trying to reuse the same validation parameters used to create the token, let's
                //create a new instance and set the ValidateLifetime to false
                var tokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtOptions.Secret)),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtOptions.Audience,
                    ValidateLifetime = false
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);
                if (!IsTokenSecurityAlgorithmValid(validatedToken))
                    return null;
                else
                    return principal;
            }
            catch (Exception)
            {
                return null;
            }
        }

        private bool IsTokenSecurityAlgorithmValid(SecurityToken validatedToken)
        {
            return (validatedToken is JwtSecurityToken jwtSecurityToken) && 
                jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase);
        }
    }
}
