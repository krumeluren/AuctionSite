using Models.DTOs;

namespace Services.Interfaces {
    public interface IUserService {
        Task<bool> ChangePasswordAsync (int userId, PasswordUpdateDto dto);
        Task<IEnumerable<UserDto>> GetAllUsersAsync ();
        Task<AuthResponseDto?> LoginAsync (LoginDto dto);
        Task<AuthResponseDto> RegisterAsync (RegisterDto dto);
    }
}