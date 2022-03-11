using Excel2Json.Domain;
using Excel2Json.Options;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace Excel2Json.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlContent);
        Task<string> GenerateHtmlContent(EmailTemplates emailTemplate, string actionLink);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailOptions _options;

        public EmailService(IOptions<EmailOptions> options)
        {
            _options = options.Value;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlContent)
        {
            var client = new SendGridClient(_options.ApiKey);
            var message = new SendGridMessage
            {
                From = new EmailAddress(_options.FromEmail, _options.FromName),
                Subject = subject,
                HtmlContent = htmlContent
            };
            message.AddTo(new EmailAddress(to));

            var response = await client.SendEmailAsync(message);
            if (!response.IsSuccessStatusCode)
            {
                throw new System.Exception("Error sending mail");
            }
        }

        public async Task<string> GenerateHtmlContent(EmailTemplates emailTemplate, string actionLink)
        {
            var html = await GetEmailTemplate(emailTemplate);
            return GenerateHtmlContent(html, actionLink);
        }

        async Task<string> GetEmailTemplate(EmailTemplates emailTemplate)
        {
            return await GetResource($"Excel2Json.EmailTemplates.{emailTemplate}.html");
        }

        async Task<string> GetResource(string resourceName)
        {
            var resource = Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName);
            using (var reader = new StreamReader(resource))
            {
                return await reader.ReadToEndAsync();
            }
        }

        string GenerateHtmlContent(string html, string actionLink)
        {
            return html.Replace("{EMAIL_ACTION_LINK}", actionLink);
        }
    }
}
