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
        Task<AuthenticationResult> GoogleLogin(string token);
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
                return new AuthenticationResult() { Error = "The email or password you entered is invalid.", Success = false };

            var userHasValidPassword = await _userManager.CheckPasswordAsync(user, password);
            if (!userHasValidPassword)
                return new AuthenticationResult() { Error = "The email or password you entered is invalid.", Success = false };

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
                return new AuthenticationResult() { Error = "User already exists.", Success = false };

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

        public async Task<AuthenticationResult> GoogleLogin(string token)
        {
            var payload = await _tokenService.ValidateGoogleTokenAsync(token);
            if (payload == null)
                return new AuthenticationResult { Success = false, Error = "Token Validation Failed" };

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
                return new AuthenticationResult { Success = false, Error = "User Authentication Failed" };

            var jwtToken = _tokenService.BuildToken(user);

            return new AuthenticationResult { Success = true, Token = jwtToken, ImageURL = payload.Picture };
        }
    }
}
