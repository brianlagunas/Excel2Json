using Excel2Json.Data;
using Excel2Json.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Excel2Json.Extensions;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace Excel2Json.Controllers.V1
{
    [Route("api/v1/files")]
    [Authorize]
    [ApiController]
    public class FileController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetFiles()
        {
            var userId = HttpContext.GetUserId();
            var files = _context.JsonFiles.Where(f => f.UserId == userId);
            return Ok(files);
        }

        [HttpPost]
        public async Task<IActionResult> AddFile([FromBody] string json)
        {
            var userId = HttpContext.GetUserId();

            var newFile = new JsonFile()
            {
                Text = json,
                UserId = userId,
            };

            await _context.JsonFiles.AddAsync(newFile);
            await _context.SaveChangesAsync();

            var link = $"{Request.Scheme}://{Request.Host}/api/share/{newFile.Id}";

            return Ok(link);
        }

        [HttpPut]
        [Route("{fileId}")]
        public IActionResult UpdateFile(string fileId, [FromBody] string json)
        {
            return Ok();
        }
    }
}
