using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Excel2Json.Domain
{
    public class RefreshToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Token { get; set; }

        [Required]
        [MaxLength(256)]
        public string JwtId { get; set; }

        public DateTime CreationDate { get; set; }

        public DateTime ExpireDate { get; set; }

        public bool IsUsed { get; set; }

        public string UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public ApplicationUser User { get; set; }
    }
}
