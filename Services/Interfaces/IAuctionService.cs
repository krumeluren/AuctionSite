using Models.DTOs;

namespace Services.Interfaces {
    public interface IAuctionService {
        Task<AuctionDto> CreateAuctionAsync (CreateAuctionDto dto, int userId);
        Task<AuctionDetailDto?> GetAuctionByIdAsync (int id, bool isAdmin);
        Task<IEnumerable<AuctionDto>> GetAuctionsAsync (string? searchQuery, bool isAdmin);
        Task<bool> UpdateAuctionAsync (int id, UpdateAuctionDto dto, int userId);
    }
}