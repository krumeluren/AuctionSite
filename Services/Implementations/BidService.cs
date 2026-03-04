using Microsoft.EntityFrameworkCore;
using Models.DTOs;
using Models.Entities;
using Repository.Interfaces;
using Services.Interfaces;
namespace Services.Implementations;

public class BidService : IBidService {
    private readonly IAuctionRepo _auctionRepo;
    private readonly IUserRepo _userRepo;
    private readonly IBidRepo _bidRepo;

    public BidService (IAuctionRepo repo, IUserRepo userRepo, IBidRepo bidRepo) {
        _auctionRepo = repo;
        _userRepo = userRepo;
        _bidRepo = bidRepo;
    }

    public async Task<BidDto> CreateBidAsync (CreateBidDto dto, int userId) {
        if(!_auctionRepo.TryGetFirstByCondition(x => x.Id == dto.AuctionId, true,
            out var auction,
            include: a => a.Include(a => a.Bids))) {
            throw new InvalidOperationException("Auction doesnt exist");
        }

        if(auction.EndDate <= DateTime.UtcNow)
            throw new InvalidOperationException("Auction is closed");

        if(auction.CreatorId == userId)
            throw new InvalidOperationException("Auction creator cant bid on auction.");

        var currentHighestPrice = auction.Bids.Any() ? auction.Bids.Max(b => b.Amount) : auction.StartingPrice;

        if(dto.Amount <= currentHighestPrice)
            throw new InvalidOperationException("Bid amount must be greater than current highest bid");

        if(!_userRepo.TryGetFirstByCondition(x => x.Id == userId, false, out var user))
            throw new InvalidOperationException("User doesnt exist");

        var bid = new Bid {
            Amount = dto.Amount,
            Date = DateTime.UtcNow,
            AuctionId = dto.AuctionId,
            UserId = userId
        };
        _bidRepo.Create(bid);
        await _bidRepo.SaveChangesAsync();

        return new BidDto {
            Id = bid.Id,
            Amount = bid.Amount,
            Date = bid.Date,
            UserId = bid.UserId,
            Username = user!.Username
        };
    }
    public async Task DeleteBidAsync (int bidId, int userId) {
        if(!_bidRepo.TryGetFirstByCondition(x => x.Id == bidId, true,
            out var bid,
            include: b => b.Include(b => b.Auction).ThenInclude(a => a.Bids))) {
            throw new InvalidOperationException("Bid doesnt exist");
        }

        if(bid == null)
            throw new InvalidOperationException("Bid doesnt exist");

        if(bid.UserId != userId)
            throw new UnauthorizedAccessException("You dont own the right to withdraw this bid");

        if(bid.Auction.EndDate <= DateTime.UtcNow)
            throw new InvalidOperationException("Bid withdrawal blocked. Auction is closed");

        var highestBid = bid.Auction.Bids.OrderByDescending(b => b.Amount).First();
        if(highestBid.Id != bidId)
            throw new InvalidOperationException("The provided bid isnt not the auction's highest bid");

        _bidRepo.Delete(bid);
        await _auctionRepo.SaveChangesAsync();
    }
}