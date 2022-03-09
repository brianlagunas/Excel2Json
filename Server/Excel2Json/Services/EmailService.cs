using Excel2Json.Options;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace Excel2Json.Services
{
    public interface IEmailService
    {
        Task SendEmailConfirmationAsync(string to, string link);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailOptions _options;

        public EmailService(IOptions<EmailOptions> options)
        {
            _options = options.Value;
        }

        public async Task SendEmailConfirmationAsync(string to, string link)
        {
            var client = new SendGridClient(_options.ApiKey);

            //TODO: creat templates for plain text and html
            var message = new SendGridMessage
            {
                From = new EmailAddress(_options.FromEmail, _options.FromName),
                Subject = _options.ConfirmSubject,
                PlainTextContent = $"By clicking on the following link, you are confirming your email address. Confirm Email ({link})",
                HtmlContent = $"<p>By clicking on the following link, you are confirming your email address.</p>" +
                              $"<a href='{link}'>Confirm Email</strong>"
            };
            message.AddTo(new EmailAddress(to));
            message.SetClickTracking(false, false);

            var response = await client.SendEmailAsync(message);
            if (!response.IsSuccessStatusCode)
            {
                throw new System.Exception("Error sending mail");
            }
        }
    }
}
