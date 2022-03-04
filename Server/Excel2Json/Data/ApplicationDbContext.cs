using Excel2Json.Domain;
using Excel2Json.Options;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Excel2Json.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        private readonly ConnectionStringOptions _connectionStringOptions;

        public DbSet<File> Files { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IOptions<ConnectionStringOptions> connectionStringOptions)
            : base(options)
        {
            _connectionStringOptions = connectionStringOptions.Value;
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfiguration(new RoleConfiguration());
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(_connectionStringOptions.DefaultConnection);
        }
    }
}
