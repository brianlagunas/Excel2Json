using Excel2Json.Domain;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace Excel2Json.Services
{
    public interface IGoogleSignInService
    {
        Task<AuthenticationResult> SignInAsync(string token);
    }

    public class GoogleSignInService : IGoogleSignInService
    {
        private readonly IConfiguration _configuration;
        readonly ITokenService _tokenService;
        readonly UserManager<IdentityUser> _userManager;

        public GoogleSignInService(IConfiguration configuration, ITokenService tokenService, UserManager<IdentityUser> userManager)
        {
            _configuration = configuration;
            _tokenService = tokenService;
            _userManager = userManager;
        }

        public async Task<AuthenticationResult> SignInAsync(string token)
        {
            var payload = await ValidateGoogleTokenAsync(token);
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

            return new AuthenticationResult { Success = true, Token = jwtToken };
        }

        async Task<GoogleJsonWebSignature.Payload> ValidateGoogleTokenAsync(string token)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(token, new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new[] { _configuration["Authentication:Google:ClientId"] }
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
