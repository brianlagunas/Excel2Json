using Excel2Json.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Excel2Json.Extensions;
using Microsoft.AspNetCore.Http;
using Excel2Json.Domain;

namespace Excel2Json.Controllers.v1
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

            //todo: set name
            var newFile = new JsonFile()
            {
                Text = json,
                UserId = userId,
            };

            await _context.JsonFiles.AddAsync(newFile);
            await _context.SaveChangesAsync();

            return Ok(newFile.Id.ToString());
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> UpdateFile(Guid id, [FromBody] string json)
        {
            var file = _context.JsonFiles.FirstOrDefault(x => x.Id == id);
            if (file == null)
                return NotFound();

            var userId = HttpContext.GetUserId();
            if (file.UserId != userId)
                return Unauthorized("User does not have access to this file.");

            //todo: update name
            file.Text = json;

            await _context.SaveChangesAsync();

            return Ok(file.Id.ToString());
        }
    }
}
