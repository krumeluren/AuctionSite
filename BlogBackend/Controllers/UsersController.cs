using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs;
using Services.Interfaces;
using System.Security.Claims;

namespace BlogApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase {
    private readonly IUserService _userService;
    private readonly IAdminUserService _adminUserService;

    public UsersController (IUserService userService, IAdminUserService adminUserService) {
        _userService = userService;
        _adminUserService = adminUserService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetUsers () {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register (RegisterDto dto) {
        try {
            var result = await _userService.RegisterAsync(dto);
            return Ok(result);
        } catch(InvalidOperationException ex) {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login (LoginDto dto) {
        try {
            var result = await _userService.LoginAsync(dto);
            if(result == null)
                return Unauthorized("Invalid credentials");
            return Ok(result);
        } catch(InvalidOperationException ex) {
            return BadRequest(ex.Message);
        }
    }

    [Authorize]
    [HttpPut("password")]
    public async Task<IActionResult> UpdatePassword ([FromBody] PasswordUpdateDto dto) {
        try {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _userService.ChangePasswordAsync(userId, dto);

            if(!success)
                return NotFound();
            return NoContent();
        } catch(InvalidOperationException ex) {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("admin/toggle/{id}")]
    public async Task<IActionResult> ToggleUserStatus (int id) {
        var success = await _adminUserService.ToggleUserStatusAsync(id);
        if(!success)
            return NotFound();
        return NoContent();
    }
}