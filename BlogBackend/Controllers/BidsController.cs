using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs;
using Services.Interfaces;
using System.Security.Claims;

namespace BlogApi.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BidsController : ControllerBase {
    private readonly IBidService _bidService;

    public BidsController (IBidService bidService) {
        _bidService = bidService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBid ([FromBody] CreateBidDto dto) {
        try {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _bidService.CreateBidAsync(dto, userId);
            return Ok(result);
        } catch(InvalidOperationException ex) {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBid (int id) {
        try {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _bidService.DeleteBidAsync(id, userId);
            return NoContent();
        } catch(UnauthorizedAccessException ex) {
            return Forbid(ex.Message);
        } catch(InvalidOperationException ex) {
            return BadRequest(ex.Message);
        }
    }
}