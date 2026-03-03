using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs;
using Services;
using System.Security.Claims;

namespace BlogApi.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase {
        private readonly UserService _userService;

        public UsersController (UserService userService) {
            _userService = userService;
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
            var result = await _userService.LoginAsync(dto);
            if(result == null)
                return Unauthorized("Invalid credentials");
            return Ok(result);
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> Update (UserUpdateDto dto) {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _userService.UpdateUserAsync(userId, dto);
            if(!success)
                return NotFound();
            return Ok("User updated successfully");
        }

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> Delete () {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _userService.DeleteUserAsync(userId);
            return Ok("User deleted");
        }
    }
}


[Route("api/[controller]")]
[ApiController]
public class AuctionsController : ControllerBase {
    private readonly AuctionService _auctionService;

    public AuctionsController (AuctionService auctionService) {
        _auctionService = auctionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOpenAuctions ([FromQuery] string? search) {
        var auctions = await _auctionService.GetOpenAuctionsAsync(search);
        return Ok(auctions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuctionById (int id) {
        var auction = await _auctionService.GetAuctionByIdAsync(id);

        if(auction == null) {
            return NotFound("Auktionen kunde inte hittas.");
        }

        return Ok(auction);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateAuction ([FromBody] CreateAuctionDto dto) {
        try {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(!int.TryParse(userIdString, out int userId)) {
                return Unauthorized("Ogiltig användaridentitet.");
            }

            var result = await _auctionService.CreateAuctionAsync(dto, userId);
            return CreatedAtAction(nameof(GetAuctionById), new { id = result.Id }, result);
        } catch(InvalidOperationException ex) {
            return BadRequest(ex.Message);
        }
    }
}