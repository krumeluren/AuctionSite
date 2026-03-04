using Models.Entities;
using Repository.Interfaces;
using Services.Interfaces;

namespace Services.Implementations;

public class AdminUserService : IAdminUserService {
    private readonly IUserRepo _repo;
    public AdminUserService (IUserRepo repo) {
        _repo = repo;
    }
    public async Task<bool> ToggleUserStatusAsync (int userId) {
        User? user = await _repo.FindAsync(userId);
        if(user == null)
            return false;

        user.IsActive = !user.IsActive;
        await _repo.SaveChangesAsync();
        return true;
    }
}