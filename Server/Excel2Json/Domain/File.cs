using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Excel2Json.Domain
{
    public class File
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        public bool CanShare { get; set; } = true;

        public DateTime CreationDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [MaxLength(100)]
        public string Name { get; set; }

        public string Text { get; set; }

        public string UserId { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public ApplicationUser User { get; set; }
    }
}
