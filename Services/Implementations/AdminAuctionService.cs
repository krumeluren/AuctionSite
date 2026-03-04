using Models.Entities;
using Repository.Interfaces;
using Services.Interfaces;

namespace Services.Implementations;

public class AdminAuctionService : IAdminAuctionService {
    private readonly IAuctionRepo _repo;

    public AdminAuctionService (IAuctionRepo repo) {
        _repo = repo;
    }

    public async Task<bool> ToggleAuctionStatusAsync (int id) {
        Auction? auction = await _repo.FindAsync(id);
        if(auction == null)
            return false;

        auction.IsActive = !auction.IsActive;
        await _repo.SaveChangesAsync();
        return true;
    }
}
