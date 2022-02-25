using Excel2Json.Contracts.v1.Requests;
using Excel2Json.Contracts.v1.Responses;
using Excel2Json.Controllers.v1.Requests;
using Excel2Json.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Excel2Json.Controllers.v1
{
    [Route("api/v1/identity")]
    [ApiController]
    public class IdentityController : Controller
    {
        private readonly IIdentityService _identityService;
        private readonly IGoogleSignInService _googleSignInService;

        public IdentityController(IIdentityService identityService, IGoogleSignInService googleSignInService)
        {
            _identityService = identityService;
            _googleSignInService = googleSignInService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistrationRequest request)
        {
            var authResponse = await _identityService.Register(request.Email, request.Password);
            if (!authResponse.Success)
                return BadRequest(new AuthFailedResponse { Error = authResponse.Error, });

            return Ok(new AuthSuccessResponse { Token = authResponse.Token });
        }

        [HttpPost("login")]
        public IActionResult Login(string email, string password)
        {
            return Ok();
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleSignIn([FromBody] GoogleSignInRequest request)
        {
            var authResponse = await _googleSignInService.SignInAsync(request.Token);
            if (!authResponse.Success)
                return BadRequest(new AuthFailedResponse { Error = authResponse.Error, });

            return Ok(new AuthSuccessResponse { Token = authResponse.Token });
        }
    }
}
