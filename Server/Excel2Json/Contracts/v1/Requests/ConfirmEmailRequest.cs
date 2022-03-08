using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Contracts.v1.Requests
{
    public class ConfirmEmailRequest
    {
        [Required]
        public string Id { get; set; }
        
        [Required]
        public string Token { get; set; }
    }
}
