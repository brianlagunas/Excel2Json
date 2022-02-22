using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Excel2Json.Models
{
    public class JsonFile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Text { get; set; }

        public string UserId { get; set; }

        [Required]
        [ForeignKey(nameof(UserId))]
        public IdentityUser User { get; set; }
    }
}
