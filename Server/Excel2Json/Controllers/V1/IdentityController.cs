using Excel2Json.Contracts.v1.Requests;
using Excel2Json.Contracts.v1.Responses;
using Excel2Json.Controllers.v1.Requests;
using Excel2Json.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Excel2Json.Extensions;

namespace Excel2Json.Controllers.v1
{
    [Route("api/v1/identity")]
    public class IdentityController : Controller
    {
        private readonly IIdentityService _identityService;

        public IdentityController(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistrationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponse { Error = ModelState.Values.First().Errors.First().ErrorMessage });
            }

            var authResponse = await _identityService.RegisterAsync($"{Request.Scheme}://{Request.Host}", request.Email, request.Password);
            if (!authResponse.Success)
                return BadRequest(new AuthResponse { Error = authResponse.Error, });

            return Ok(new AuthResponse { IsAuthenticated = true, Token = authResponse.Token, RefreshToken = authResponse.RefreshToken });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var authResponse = await _identityService.LoginAsync(request.Email, request.Password);
            if (!authResponse.Success)
                return BadRequest(new AuthResponse { Error = authResponse.Error, });

            return Ok(new AuthResponse { IsAuthenticated = true, Token = authResponse.Token, RefreshToken = authResponse.RefreshToken });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            string id = HttpContext.GetUserId();
            var authResponse = await _identityService.LogoutAsync(id);
            if (!authResponse.Success)
                return BadRequest(new AuthResponse { Error = authResponse.Error, });

            return Ok();
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleSignInRequest request)
        {
            var authResponse = await _identityService.GoogleLoginAsync(request.Token);
            if (!authResponse.Success)
                return BadRequest(new AuthResponse { Error = authResponse.Error, });

            return Ok(new AuthResponse { IsAuthenticated = true, Token = authResponse.Token, RefreshToken = authResponse.RefreshToken, ImageUrl = authResponse.ImageURL });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            var authResponse = await _identityService.RefreshTokenAsync(request.Token, request.RefreshToken);
            if (!authResponse.Success)
                return BadRequest(new AuthResponse { Error = authResponse.Error, });

            return Ok(new AuthResponse { IsAuthenticated = true, Token = authResponse.Token, RefreshToken = authResponse.RefreshToken });
        }

        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
        {
            var authResponse = await _identityService.ConfirmEmail(request.Id, request.Token);
            if (!authResponse.Success)
                return BadRequest(new AuthResponse { Error = authResponse.Error, });

            return Ok(new AuthResponse { IsAuthenticated = true });
        }

        [HttpPost("resend")]
        public async Task<IActionResult> ResendConfirmationEmail([FromBody] ResendEmailRequest request)
        {
            var authResponse = await _identityService.ResendConfirmationEmail($"{Request.Scheme}://{Request.Host}", request.Email);
            if (!authResponse.Success)
                return BadRequest(new AuthResponse { Error = authResponse.Error, });

            return Ok(new AuthResponse { IsAuthenticated = true });
        }
    }
}
