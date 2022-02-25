using Excel2Json.Domain;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Linq;

namespace Excel2Json.Services
{
    public interface IIdentityService
    {
        Task<AuthenticationResult> Login(string email, string password);
        Task<AuthenticationResult> Register(string email, string password);
    }

    public class IdentityService :IIdentityService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ITokenService _tokenService;

        public IdentityService(UserManager<IdentityUser> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        public async Task<AuthenticationResult> Login(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new AuthenticationResult() { Error = "User does not exist.", Success = false };

            var userHasValidPassword = await _userManager.CheckPasswordAsync(user, password);
            if (!userHasValidPassword)
                return new AuthenticationResult() { Error = "Username/Password combination is invalid", Success = false };

            var token = _tokenService.BuildToken(user);

            return new AuthenticationResult()
            {
                Success = true,
                Token = token
            };
        }

        public async Task<AuthenticationResult> Register(string email, string password)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
                return new AuthenticationResult() { Error = "User with email already exists.", Success = false };

            var newUser = new IdentityUser()
            {
                Email = email,
                UserName = email,
            };

            var createdUser = await _userManager.CreateAsync(newUser, password);
            if (!createdUser.Succeeded)
            {                
                return new AuthenticationResult() { Error = createdUser.Errors.First().Description, Success = false };
            }

            await _userManager.AddToRoleAsync(newUser, "User");

            var token = _tokenService.BuildToken(newUser);

            return new AuthenticationResult()
            {
                Success = true,
                Token = token
            };
        }
    }
}
