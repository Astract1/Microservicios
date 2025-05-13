using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RiskService.Models;
using RiskService.Data;

namespace RiskService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<User>> RegisterUser(User user)
        {
            try
            {
                // Check if user already exists with the same name, age, and location
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => 
                        u.Name == user.Name && 
                        u.Age == user.Age && 
                        u.Location == user.Location);

                if (existingUser != null)
                {
                    return Ok(existingUser);
                }

                // If user doesn't exist, create new user
                user.CreatedAt = DateTime.UtcNow;
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(RegisterUser), new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 