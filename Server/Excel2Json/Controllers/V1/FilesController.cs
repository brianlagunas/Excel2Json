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
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Excel2Json.Controllers.v1
{
    [Route("api/v1/files")]
    [Authorize]
    public class FilesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FilesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            var file = await _context.Files.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (file == null)
                return NotFound();

            var userId = HttpContext.GetUserId();
            if (file.UserId != userId)
                return Unauthorized("User does not have access to this file.");
            
            return Ok(file);
        }

        [HttpGet]
        public IActionResult GetFiles([FromQuery] bool includeText = false)
        {
            IEnumerable<File> files = null;
            var userId = HttpContext.GetUserId();            

            if (includeText)
            {
                files = _context.Files.AsNoTracking().Where(f => f.UserId == userId);
            }
            else
            {
                files = _context.Files.AsNoTracking().Where(f => f.UserId == userId).Select(x => new File
                {
                    Id = x.Id,
                    CanShare = x.CanShare,
                    CreationDate = x.CreationDate,
                    UpdatedDate = x.UpdatedDate,
                    Name = x.Name,
                });
            }

            if (files == null)
                return NotFound();

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
                CreationDate = DateTime.UtcNow
            };

            await _context.Files.AddAsync(newFile);
            await _context.SaveChangesAsync();

            var response = new FileResponse() { Id = newFile.Id };

            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateFileRequest fileRequest)
        {
            var file = await _context.Files.FirstOrDefaultAsync(x => x.Id == id);
            if (file == null)
                return NotFound();

            var userId = HttpContext.GetUserId();
            if (file.UserId != userId)
                return Unauthorized("User does not have access to this file.");

            file.CanShare = fileRequest.CanShare;
            file.Name = fileRequest.Name;
            file.Text = fileRequest.Text;
            file.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(file);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute]Guid id)
        {
            var file = await _context.Files.FirstOrDefaultAsync(x => x.Id == id);
            if (file == null)
                return NotFound();

            var userId = HttpContext.GetUserId();
            if (file.UserId != userId)
                return Unauthorized("User does not have access to this file.");

            _context.Files.Remove(file);
            await _context.SaveChangesAsync();

            return Ok(file);
        }
    }
}
