using Excel2Json.Common;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;

namespace Excel2Json.Controllers
{
    [Route("api/share")]
    [EnableCors("AllowAll")]
    [ApiController]
    public class ShareController : ControllerBase
    {
        [HttpPost]
        [EnableCors("AllowAll")]
        public IActionResult Post([FromBody] string json)
        {
            var shareId = Guid.NewGuid().ToString().Replace("-", "");
            var fileName = $"{shareId}.{Constants.JSON}";
            var filePath = Path.Combine(Constants.UPLOAD_URL, fileName);
            System.IO.File.WriteAllText(filePath, json);
            var shareLink = $"https://localhost:44307/api/share/{shareId}";
            return Ok(shareLink);
            
            //TODO: research this code
            //return CreatedAtAction(nameof(Get), shareId);            
        }

        [HttpGet]
        [Route("{shareId}")]
        public IActionResult Get(string shareId)
        {
            var file = Path.Combine(Constants.UPLOAD_URL, $"{shareId}.{Constants.JSON}");
            if (!System.IO.File.Exists(file))
                return NotFound();

            var json = System.IO.File.ReadAllText(file);
            return Ok(json);
        }

    }
}
