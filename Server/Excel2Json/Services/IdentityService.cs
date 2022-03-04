using Excel2Json.Domain;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Linq;
using Excel2Json.Data;

namespace Excel2Json.Services
{
    public interface IIdentityService
    {
        Task<AuthenticationResult> LogoutAsync(string userId);
        Task<AuthenticationResult> LoginAsync(string email, string password);
        Task<AuthenticationResult> RegisterAsync(string email, string password);
        Task<AuthenticationResult> GoogleLoginAsync(string token);
        Task<AuthenticationResult> RefreshTokenAsync(string token, string refreshToken);
    }

    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly ApplicationDbContext _context;

        public IdentityService(UserManager<ApplicationUser> userManager, ITokenService tokenService, ApplicationDbContext context)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _context = context;
        }

        public async Task<AuthenticationResult> LogoutAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return new AuthenticationResult { Success = false, Error = "User does not exist" };

            var refreshTokens = _context.RefreshTokens.Where(x => x.UserId == userId);
            _context.RefreshTokens.RemoveRange(refreshTokens);
            await _context.SaveChangesAsync();            

            return new AuthenticationResult { Success = true };
        }

        public async Task<AuthenticationResult> LoginAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new AuthenticationResult() { Error = "The email or password you entered is invalid.", Success = false };

            var userHasValidPassword = await _userManager.CheckPasswordAsync(user, password);
            if (!userHasValidPassword)
                return new AuthenticationResult() { Error = "The email or password you entered is invalid.", Success = false };

            return await CreateAuthenticationResultAsync(user);
        }

        public async Task<AuthenticationResult> RegisterAsync(string email, string password)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
                return new AuthenticationResult() { Error = "User already exists.", Success = false };

            var user = new ApplicationUser()
            {
                Email = email,
                UserName = email,
            };

            var createdUser = await _userManager.CreateAsync(user, password);
            if (!createdUser.Succeeded)
            {
                return new AuthenticationResult() { Error = createdUser.Errors.First().Description, Success = false };
            }

            await _userManager.AddToRoleAsync(user, "User");

            return await CreateAuthenticationResultAsync(user);
        }

        public async Task<AuthenticationResult> GoogleLoginAsync(string token)
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
                    user = new ApplicationUser
                    {
                        Email = payload.Email,
                        UserName = payload.Email,
                        EmailConfirmed = payload.EmailVerified,
                        ImageUrl = payload.Picture,
                        FirstName = payload.GivenName,
                        LastName = payload.FamilyName,
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

            var result = await CreateAuthenticationResultAsync(user);
            return result;
        }

        public async Task<AuthenticationResult> RefreshTokenAsync(string token, string refreshToken)
        {
            var result = await _tokenService.ValidateTokenAsync(token, refreshToken);
            if (!result.IsValid)
                return new AuthenticationResult { Success = false, Error = "Invalid Token" };

            var user = await _userManager.FindByIdAsync(result.UserId);
            if (user == null)
                return new AuthenticationResult { Success = false, Error = "User does not exist" };

            return await CreateAuthenticationResultAsync(user);
        }

        private async Task<AuthenticationResult> CreateAuthenticationResultAsync(ApplicationUser user)
        {
            var tokens = await _tokenService.CreateAuthenticatedTokens(user);
            return new AuthenticationResult() { Success = true, Token = tokens.Token, RefreshToken = tokens.RefreshToken, ImageURL = user.ImageUrl };
        }
    }
}
