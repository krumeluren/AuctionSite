namespace Services.Interfaces {
    public interface IAdminAuctionService {
        Task<bool> ToggleAuctionStatusAsync (int id);
    }
}