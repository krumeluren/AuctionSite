using Microsoft.EntityFrameworkCore;
using Models.DTOs;
using Models.Entities;
using Repository.Data;
namespace Services;

public class AuctionService {
    private readonly RepositoryContext _context;

    public AuctionService (RepositoryContext context) {
        _context = context;
    }

    public async Task<IEnumerable<AuctionDto>> GetOpenAuctionsAsync (string? searchQuery) {
        var query = _context.Auctions
            .Include(a => a.Creator)
            .Include(a => a.Bids)
            .Where(a => a.EndDate > DateTime.UtcNow);

        if(!string.IsNullOrWhiteSpace(searchQuery)) {
            query = query.Where(a => a.Title.Contains(searchQuery));
        }

        var auctions = await query.ToListAsync();

        return auctions.Select(a => new AuctionDto {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            StartingPrice = a.StartingPrice,
            CurrentPrice = a.Bids.Any() ? a.Bids.Max(b => b.Amount) : a.StartingPrice,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            CreatorId = a.CreatorId,
            CreatorUsername = a.Creator.Username,
            IsOpen = true
        });
    }

    public async Task<AuctionDetailDto?> GetAuctionByIdAsync (int id) {
        var auction = await _context.Auctions
            .Include(a => a.Creator)
            .Include(a => a.Bids)
                .ThenInclude(b => b.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if(auction == null)
            return null;

        var isOpen = auction.EndDate > DateTime.UtcNow;

        return new AuctionDetailDto {
            Id = auction.Id,
            Title = auction.Title,
            Description = auction.Description,
            StartingPrice = auction.StartingPrice,
            CurrentPrice = auction.Bids.Any() ? auction.Bids.Max(b => b.Amount) : auction.StartingPrice,
            StartDate = auction.StartDate,
            EndDate = auction.EndDate,
            CreatorId = auction.CreatorId,
            CreatorUsername = auction.Creator.Username,
            IsOpen = isOpen,
            Bids = auction.Bids.OrderByDescending(b => b.Date).Select(b => new BidDto {
                Id = b.Id,
                Amount = b.Amount,
                Date = b.Date,
                UserId = b.UserId,
                Username = b.User.Username
            })
        };
    }

    public async Task<AuctionDto> CreateAuctionAsync (CreateAuctionDto dto, int userId) {
        var user = await _context.Users.FindAsync(userId);
        if(user == null)
            throw new InvalidOperationException("User not found");

        var auction = new Auction {
            Title = dto.Title,
            Description = dto.Description,
            StartingPrice = dto.StartingPrice,
            StartDate = DateTime.UtcNow,
            EndDate = dto.EndDate.ToUniversalTime(),
            CreatorId = userId
        };

        _context.Auctions.Add(auction);
        await _context.SaveChangesAsync();

        return new AuctionDto {
            Id = auction.Id,
            Title = auction.Title,
            Description = auction.Description,
            StartingPrice = auction.StartingPrice,
            CurrentPrice = auction.StartingPrice,
            StartDate = auction.StartDate,
            EndDate = auction.EndDate,
            CreatorId = auction.CreatorId,
            CreatorUsername = user.Username,
            IsOpen = true
        };
    }
}
