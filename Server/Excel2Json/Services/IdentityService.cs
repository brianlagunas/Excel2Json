﻿using Excel2Json.Domain;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Linq;
using Excel2Json.Data;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace Excel2Json.Services
{
    public interface IIdentityService
    {
        Task<ServiceResult> LogoutAsync(string userId);
        Task<AuthenticationResult> LoginAsync(string email, string password);
        Task<ServiceResult> RegisterAsync(string baseUri, string email, string password);
        Task<AuthenticationResult> GoogleLoginAsync(string token);
        Task<AuthenticationResult> RefreshTokenAsync(string token, string refreshToken);
        Task<ServiceResult> ConfirmEmail(string id, string token);
        Task<ServiceResult> ResendConfirmationEmail(string baseUri, string email);
        Task<ServiceResult> SendPasswordResetEmail(string baseUri, string email);
        Task<ServiceResult> ResetPassword(string email, string password, string token);
    }

    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;

        public IdentityService(UserManager<ApplicationUser> userManager, ITokenService tokenService, IEmailService emailService, ApplicationDbContext context)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _emailService = emailService;
            _context = context;
        }

        public async Task<ServiceResult> LogoutAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return new ServiceResult { Success = false, Error = "User does not exist" };

            var refreshTokens = _context.RefreshTokens.Where(x => x.UserId == userId);
            _context.RefreshTokens.RemoveRange(refreshTokens);
            await _context.SaveChangesAsync();            

            return new ServiceResult { Success = true };
        }

        public async Task<AuthenticationResult> LoginAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new AuthenticationResult() { Error = "The email or password you entered is invalid.", Success = false };

            var userHasValidPassword = await _userManager.CheckPasswordAsync(user, password);
            if (!userHasValidPassword)
                return new AuthenticationResult() { Error = "The email or password you entered is invalid.", Success = false };

            if (!user.EmailConfirmed)
                return new AuthenticationResult() { Error = "The email has not been verified.", Success = false };

            return await CreateAuthenticationResultAsync(user);
        }

        public async Task<ServiceResult> RegisterAsync(string baseUri, string email, string password)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
                return new ServiceResult() { Error = "User already exists." };

            var user = new ApplicationUser()
            {
                Email = email,
                UserName = email,
            };

            var createdUser = await _userManager.CreateAsync(user, password);
            if (!createdUser.Succeeded)
            {
                return new ServiceResult() { Error = createdUser.Errors.First().Description };
            }

            await _userManager.AddToRoleAsync(user, "User");

            await SendConfirmationEmail(baseUri, user);

            return new ServiceResult { Success = true };
        }

        
        public async Task<ServiceResult> ConfirmEmail(string id, string token)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return new ServiceResult { Error = "Unable to verify email." };

            if (user.EmailConfirmed)
                return new ServiceResult { Error = "Unable to verify email." };

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
            if (!result.Succeeded)
            {
                return new ServiceResult { Error = result.Errors.FirstOrDefault()?.Description };
            }
            
            return new ServiceResult { Success = true };
        }

        public async Task<ServiceResult> ResendConfirmationEmail(string baseUri, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new ServiceResult { Error = "Unable to send email." };

            if (user.EmailConfirmed)
                return new ServiceResult { Error = "Unable to send email." };

            await SendConfirmationEmail(baseUri, user);

            return new ServiceResult { Success = true };
        }

        public async Task<AuthenticationResult> GoogleLoginAsync(string token)
        {
            var payload = await _tokenService.ValidateGoogleTokenAsync(token);
            if (payload == null)
                return new AuthenticationResult { Success = false, Error = "Token Validation Failed" };

            if (!payload.EmailVerified)
                return new AuthenticationResult { Success = false, Error = "Email must be verified with Google" };

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
                return new AuthenticationResult { Success = false, Error = "Invalid User" };

            return await CreateAuthenticationResultAsync(user);
        }

        public async Task<ServiceResult> SendPasswordResetEmail(string baseUri, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new ServiceResult { Error = "Unable to send email." };

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var resetPassordLink = $"{baseUri}/account/reset-password?email={user.Email}&token={encodedToken}";

            var htmlContent = await _emailService.GenerateHtmlContent(EmailTemplates.ForgotPassword, resetPassordLink);

            await _emailService.SendEmailAsync(user.Email, "Reset Your Password", htmlContent);

            return new ServiceResult { Success = true };
        }

        public async Task<ServiceResult> ResetPassword(string email, string password, string token)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new ServiceResult { Error = "Unabe to reset password." };

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, password);
            if (!result.Succeeded)
            {
                return new ServiceResult { Error = result.Errors.FirstOrDefault()?.Description };
            }

            return new ServiceResult { Success = true };
        }

        private async Task<AuthenticationResult> CreateAuthenticationResultAsync(ApplicationUser user)
        {
            var tokens = await _tokenService.CreateAuthenticatedTokens(user);
            return new AuthenticationResult() { Success = true, Token = tokens.Token, RefreshToken = tokens.RefreshToken, ImageURL = user.ImageUrl };
        }

        private async Task SendConfirmationEmail(string baseUri, ApplicationUser user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var confirmationLink = $"{baseUri}/account/confirm?id={user.Id}&token={encodedToken}";

            var htmlContent = await _emailService.GenerateHtmlContent(EmailTemplates.ConfirmEmail, confirmationLink);

            await _emailService.SendEmailAsync(user.Email, "Welcome to Excel2Json! Confirm Your Email", htmlContent);
        }
    }
}
