using Excel2Json.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Excel2Json.Extensions;
using Microsoft.AspNetCore.Http;
using Excel2Json.Domain;
using Excel2Json.Contracts.v1.Requests;
using Excel2Json.Contracts.v1.Responses;

namespace Excel2Json.Controllers.v1
{
    [Route("api/v1/files")]
    [Authorize]
    [ApiController]
    public class FilesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FilesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("{id}")]
        public IActionResult Get([FromRoute] Guid id)
        {
            var file = _context.Files.FirstOrDefault(x => x.Id == id);
            if (file == null)
                return NotFound();

            var userId = HttpContext.GetUserId();
            if (file.UserId != userId)
                return Unauthorized("User does not have access to this file.");
            
            return Ok(file);
        }

        [HttpGet]
        public IActionResult GetFiles()
        {
            var userId = HttpContext.GetUserId();
            var files = _context.Files.Where(f => f.UserId == userId);
            return Ok(files);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFileRequest fileRequest)
        {
            var userId = HttpContext.GetUserId();

            var newFile = new File()
            {
                Name = fileRequest.Name,
                Text = fileRequest.Text,
                UserId = userId,
            };

            await _context.Files.AddAsync(newFile);
            await _context.SaveChangesAsync();

            var response = new FileResponse() { Id = newFile.Id };

            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateFileRequest fileRequest)
        {
            var file = _context.Files.FirstOrDefault(x => x.Id == id);
            if (file == null)
                return NotFound();

            var userId = HttpContext.GetUserId();
            if (file.UserId != userId)
                return Unauthorized("User does not have access to this file.");

            file.CanShare = fileRequest.CanShare;
            file.Name = fileRequest.Name;
            file.Text = fileRequest.Text;

            await _context.SaveChangesAsync();

            return Ok(file);
        }

        [HttpDelete]
        [Route("{id}")]
        public IActionResult Delete([FromRoute]Guid id)
        {
            var file = _context.Files.FirstOrDefault(x => x.Id == id);
            if (file == null)
                return NotFound();

            var userId = HttpContext.GetUserId();
            if (file.UserId != userId)
                return Unauthorized("User does not have access to this file.");

            _context.Files.Remove(file);
            _context.SaveChanges();

            return Ok(file);
        }
    }
}
