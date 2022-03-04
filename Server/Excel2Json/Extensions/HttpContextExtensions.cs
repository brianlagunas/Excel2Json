using Microsoft.AspNetCore.Http;
using System.Linq;

namespace Excel2Json.Extensions
{
    public static class HttpContextExtensions
    {
        public static string GetUserId(this HttpContext context)
        {
            if (context.User == null || context.User.Claims == null)
                return string.Empty;

            return context.User.Claims.Single(x => x.Type == "id").Value;         
        }
    }
}
