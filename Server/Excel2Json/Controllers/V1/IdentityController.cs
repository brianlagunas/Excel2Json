using Excel2Json.Contracts.v1.Requests;
using Excel2Json.Contracts.v1.Responses;
using Excel2Json.Controllers.v1.Requests;
using Excel2Json.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;

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
                return BadRequest(new AuthFailedResponse { Error = ModelState.Values.First().Errors.First().ErrorMessage });
            }

            var authResponse = await _identityService.Register(request.Email, request.Password);
            if (!authResponse.Success)
                return BadRequest(new AuthFailedResponse { Error = authResponse.Error, });

            return Ok(new AuthSuccessResponse { Token = authResponse.Token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var authResponse = await _identityService.Login(request.Email, request.Password);
            if (!authResponse.Success)
                return BadRequest(new AuthFailedResponse { Error = authResponse.Error, });

            return Ok(new AuthSuccessResponse { Token = authResponse.Token });
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleSignInRequest request)
        {
            var authResponse = await _identityService.GoogleLogin(request.Token);
            if (!authResponse.Success)
                return BadRequest(new AuthFailedResponse { Error = authResponse.Error, });

            return Ok(new AuthSuccessResponse { Token = authResponse.Token, ImageUrl = authResponse.ImageURL });
        }
    }
}
