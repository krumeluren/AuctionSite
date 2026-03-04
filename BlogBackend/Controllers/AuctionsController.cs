using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs;
using Services.Interfaces;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class AuctionsController : ControllerBase {
    private readonly IAuctionService _auctionService;
    private readonly IAdminAuctionService _adminAuctionService;

    public AuctionsController (IAuctionService auctionService, IAdminAuctionService adminAuctionService) {
        _auctionService = auctionService;
        _adminAuctionService = adminAuctionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAuctions ([FromQuery] string? search) {
        var isAdmin = User.IsInRole("Admin");
        var auctions = await _auctionService.GetAuctionsAsync(search, isAdmin);
        return Ok(auctions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAuctionById (int id) {
        var isAdmin = User.IsInRole("Admin");
        var auction = await _auctionService.GetAuctionByIdAsync(id, isAdmin);

        if(auction == null)
            return NotFound("Auction doesnt exist");

        return Ok(auction);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateAuction ([FromBody] CreateAuctionDto dto) {
        try {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _auctionService.CreateAuctionAsync(dto, userId);
            return CreatedAtAction(nameof(GetAuctionById), new { id = result.Id }, result);
        } catch(InvalidOperationException ex) {
            return BadRequest(ex.Message);
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAuction (int id, [FromBody] UpdateAuctionDto dto) {
        try {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _auctionService.UpdateAuctionAsync(id, dto, userId);

            if(!success)
                return NotFound();
            return NoContent();
        } catch(UnauthorizedAccessException ex) {
            return Forbid(ex.Message);
        } catch(InvalidOperationException ex) {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("admin/toggle/{id}")]
    public async Task<IActionResult> ToggleAuctionStatus (int id) {
        var success = await _adminAuctionService.ToggleAuctionStatusAsync(id);
        if(!success)
            return NotFound();
        return NoContent();
    }
}