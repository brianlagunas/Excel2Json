using Excel2Json.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;

namespace Excel2Json.Controllers
{
    [Route("api/share")]
    [ApiController]
    public class ShareController : ControllerBase
    {
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

        [HttpPost]
        public IActionResult Post([FromBody] string json)
        {
            var shareId = Guid.NewGuid().ToString().Replace("-", "");
            try
            {
                WriteJsonToFile(shareId, json);
                return CreatedAtAction(nameof(Get), new { shareId = shareId }, shareId);
            }
            catch
            {
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut]
        [Route("{shareId}")]
        public IActionResult Put(string shareId, [FromBody] string json)
        {
            try
            {
                WriteJsonToFile(shareId, json);
                return CreatedAtAction(nameof(Get), new { shareId = shareId }, shareId);
            }
            catch
            {
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }

        void WriteJsonToFile(string shareId, string json)
        {
            if (!Directory.Exists(Constants.UPLOAD_URL))
                Directory.CreateDirectory(Constants.UPLOAD_URL);

            var fileName = $"{shareId}.{Constants.JSON}";
            var filePath = Path.Combine(Constants.UPLOAD_URL, fileName);
            System.IO.File.WriteAllText(filePath, json);
        }
    }
}
