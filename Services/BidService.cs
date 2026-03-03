using Microsoft.EntityFrameworkCore;
using Models.DTOs;
using Models.Entities;
using Repository.Data;
namespace Services;

public class BidService {
    private readonly RepositoryContext _context;

    public BidService (RepositoryContext context) {
        _context = context;
    }

    public async Task<BidDto> CreateBidAsync (CreateBidDto dto, int userId) {
        var auction = await _context.Auctions
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == dto.AuctionId);

        if(auction == null)
            throw new InvalidOperationException("Auction doesnt exist");

        if(auction.EndDate <= DateTime.UtcNow)
            throw new InvalidOperationException("Auction is closed");

        if(auction.CreatorId == userId)
            throw new InvalidOperationException("Auction creator cant bid on auction.");

        var currentHighestPrice = auction.Bids.Any() ? auction.Bids.Max(b => b.Amount) : auction.StartingPrice;

        if(dto.Amount <= currentHighestPrice)
            throw new InvalidOperationException("Bid amount must be greater than current highest bid");

        var user = await _context.Users.FindAsync(userId);

        var bid = new Bid {
            Amount = dto.Amount,
            Date = DateTime.UtcNow,
            AuctionId = dto.AuctionId,
            UserId = userId
        };

        _context.Bids.Add(bid);
        await _context.SaveChangesAsync();

        return new BidDto {
            Id = bid.Id,
            Amount = bid.Amount,
            Date = bid.Date,
            UserId = bid.UserId,
            Username = user!.Username
        };
    }
}