using Microsoft.EntityFrameworkCore;
using Models.DTOs;
using Models.Entities;
using Repository.Interfaces;
using Services.Interfaces;

namespace Services.Implementations;

public class AuctionService : IAuctionService {
    private readonly IAuctionRepo _auctionRepo;
    private readonly IUserRepo _userRepo;
    private readonly IBidRepo _bidRepo;

    public AuctionService (IAuctionRepo repo, IUserRepo userRepo, IBidRepo bidRepo) {
        _auctionRepo = repo;
        _userRepo = userRepo;
        _bidRepo = bidRepo;
    }

    public async Task<IEnumerable<AuctionDto>> GetAuctionsAsync (string? searchQuery, bool isAdmin) {
        var query = _auctionRepo.FindByCondition(a => true, true, include: q => q.Include(a => a.Creator).Include(a => a.Bids)).AsQueryable();

        if(!isAdmin) { // show only active auctions to non admins
            query = query.Where(a => a.IsActive);
        }

        if(!string.IsNullOrWhiteSpace(searchQuery)) {
            query = query.Where(a => a.Title.Contains(searchQuery));
        }

        //order query by end date ascending
        query = query.OrderBy(a => a.EndDate);

        List<Auction> auctions = query.ToList();

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
            IsOpen = a.EndDate > DateTime.UtcNow,
            IsActive = a.IsActive
        });
    }

    public async Task<AuctionDetailDto?> GetAuctionByIdAsync (int id, bool isAdmin) {
        if(!_auctionRepo.TryGetFirstByCondition(
                expression: a => a.Id == id,
                trackChanges: false,
                out Auction auction,
                include: q => q.Include(a => a.Creator)
                               .Include(a => a.Bids).ThenInclude(b => b.User))) {
            return null;
        }

        if(!auction.IsActive && !isAdmin)
            return null;

        var isOpen = auction.EndDate > DateTime.UtcNow;
        var highestBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();

        var detailDto = new AuctionDetailDto {
            Id = auction.Id,
            Title = auction.Title,
            Description = auction.Description,
            StartingPrice = auction.StartingPrice,
            CurrentPrice = highestBid?.Amount ?? auction.StartingPrice,
            StartDate = auction.StartDate,
            EndDate = auction.EndDate,
            CreatorId = auction.CreatorId,
            CreatorUsername = auction.Creator.Username,
            IsOpen = isOpen,
            IsActive = auction.IsActive,
            Bids = new List<BidDto>()
        };

        if(isOpen) {
            detailDto.Bids = auction.Bids.OrderByDescending(b => b.Date).Select(b => new BidDto {
                Id = b.Id,
                Amount = b.Amount,
                Date = b.Date,
                UserId = b.UserId,
                Username = b.User.Username
            });
        } else if(highestBid != null) {
            detailDto.WinningBid = new BidDto {
                Id = highestBid.Id,
                Amount = highestBid.Amount,
                Date = highestBid.Date,
                UserId = highestBid.UserId,
                Username = highestBid.User.Username
            };
        }

        return detailDto;
    }

    public async Task<bool> UpdateAuctionAsync (int id, UpdateAuctionDto dto, int userId) {
        if(!_auctionRepo.TryGetFirstByCondition(
                expression: a => a.Id == id,
                trackChanges: true,
                out Auction auction,
                include: q => q.Include(a => a.Bids))) {
            return false;
        }

        if(auction.CreatorId != userId)
            throw new UnauthorizedAccessException("Only the creator can update an action");

        if(auction.Bids.Any() && auction.StartingPrice != dto.StartingPrice) {
            throw new InvalidOperationException("Cant change price when a bid has been made");
        }

        auction.Title = dto.Title;
        auction.Description = dto.Description;
        auction.StartingPrice = dto.StartingPrice;

        await _auctionRepo.SaveChangesAsync();
        return true;
    }

    public async Task<AuctionDto> CreateAuctionAsync (CreateAuctionDto dto, int userId) {
        User? user = await _userRepo.FindAsync(userId) ??
            throw new InvalidOperationException("User doesnt exist");

        var auction = new Auction {
            Title = dto.Title,
            Description = dto.Description,
            StartingPrice = dto.StartingPrice,
            StartDate = DateTime.UtcNow,
            EndDate = dto.EndDate.ToUniversalTime(),
            CreatorId = userId,
            IsActive = true
        };

        _auctionRepo.Create(auction);
        await _auctionRepo.SaveChangesAsync();

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
            IsOpen = true,
            IsActive = auction.IsActive
        };
    }
}