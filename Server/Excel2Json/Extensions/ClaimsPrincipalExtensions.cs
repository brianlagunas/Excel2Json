using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;

namespace Excel2Json.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetUserId(this ClaimsPrincipal cp)
        {
            return cp.Claims.Single(x => x.Type == "id").Value;
        }

        public static string GetJwtExpirationTime(this ClaimsPrincipal cp)
        {
            return cp.Claims.Single(x => x.Type == JwtRegisteredClaimNames.Exp).Value;
        }

        public static string GetJwtJti(this ClaimsPrincipal cp)
        {
            return cp.Claims.Single(x => x.Type == JwtRegisteredClaimNames.Jti).Value;
        }
    }
}
