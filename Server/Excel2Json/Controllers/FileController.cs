using Excel2Json.Data;
using Excel2Json.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace Excel2Json.Controllers
{
    [Route("api/files")]
    [ApiController]
    public class FileController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FileController(ApplicationDbContext context)
        {
            _context = context;
        }

        //[Authorize]
        public IActionResult GetFiles(string userId)
        {
            var claims = User.Claims;
            

            var files = _context.JsonFiles.Where(f => f.UserId == userId);
            return Ok(files);
        }

        //[Authorize]
        public async Task<IActionResult> AddFile(string text, string userId)
        {
            var newFile = new JsonFile()
            {
                //Id = Guid.NewGuid(),
                Text = text,
                UserId = userId,
            };

            await _context.JsonFiles.AddAsync(newFile);
            await _context.SaveChangesAsync();

            return Ok(newFile.Id);
        }
    }
}
