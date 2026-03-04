namespace Services.Interfaces {
    public interface IAdminUserService {
        Task<bool> ToggleUserStatusAsync (int userId);
    }
}