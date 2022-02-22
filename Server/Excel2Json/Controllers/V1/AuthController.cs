using Excel2Json.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Excel2Json.Controllers.v1
{
    [Route("api/v1/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        readonly ITokenService _tokenService;
        readonly UserManager<IdentityUser> _userManager;

        public AuthController(ITokenService tokenService, UserManager<IdentityUser> userManager)
        {
            _tokenService = tokenService;
            _userManager = userManager;
        }

        [HttpPost]
        [Route("google")]
        public async Task<IActionResult> GoogleSignIn([FromBody] string token)
        {
            var payload = await _tokenService.ValidateGoogleToken(token);
            if (payload == null)
                return Unauthorized("Authentication failed");

            var info = new UserLoginInfo(payload.Issuer, payload.Subject, payload.Issuer);
            var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (user == null)
            {
                user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    user = new IdentityUser 
                    { 
                        Email = payload.Email, 
                        UserName = payload.Email,
                        EmailConfirmed = payload.EmailVerified,
                    };

                    await _userManager.CreateAsync(user);
                    await _userManager.AddToRoleAsync(user, "User");
                    await _userManager.AddLoginAsync(user, info);
                }
                else
                {
                    await _userManager.AddLoginAsync(user, info);
                }
            }

            if (user == null)
                return Unauthorized("Authentication failed");
            
            var jwtToken = _tokenService.BuildToken(user);
            return Ok(new { Token = jwtToken, IsSuccessful = true });
        }
    }
}
