using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Excel2Json.Domain
{
    public class ApplicationUser : IdentityUser
    {
        [MaxLength(100)]
        public string FirstName { get; set; }

        [MaxLength(100)]
        public string LastName { get; set; }

        [MaxLength(256)]
        public string ImageUrl { get; set; }

        public IEnumerable<File> Files { get; set; }

        public IEnumerable<RefreshToken> RefreshTokens { get; set; }
    }
}
