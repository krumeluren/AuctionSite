using Models.DTOs;

namespace Services.Interfaces {
    public interface IBidService {
        Task<BidDto> CreateBidAsync (CreateBidDto dto, int userId);
        Task DeleteBidAsync (int bidId, int userId);
    }
}