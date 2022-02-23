﻿using Excel2Json.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace Excel2Json.Controllers.v1
{
    [Route("api/v1/share")]
    [ApiController]
    public class ShareController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ShareController(ApplicationDbContext context)
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

            if (file.CanShare)
                return Ok(file.Text);
            else
                return BadRequest("File is not shared");
        }
    }
}