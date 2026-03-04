using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Models.DTOs;
using Models.Entities;
using Repository.Interfaces;
using Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
namespace Services.Implementations;

public class UserService : IUserService {
    private readonly IConfiguration _configuration;
    private readonly IUserRepo _userRepo;
    public UserService (IConfiguration configuration, IUserRepo userRepo) {
        _configuration = configuration;
        _userRepo = userRepo;
    }
    public async Task<IEnumerable<UserDto>> GetAllUsersAsync () {
        var users = await _userRepo.GetAllAsync();
        return users.Select(u => new UserDto {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            IsAdmin = u.IsAdmin,
            IsActive = u.IsActive
        });
    }
    public async Task<AuthResponseDto> RegisterAsync (RegisterDto dto) {
        if(_userRepo.Any(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email already registered.");

        var user = new User {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password)
        };
        _userRepo.Create(user);
        await _userRepo.SaveChangesAsync();

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto?> LoginAsync (LoginDto dto) {
        if(!_userRepo.TryGetFirstByCondition(x => x.Username == dto.Username, true, out var user)) {
            throw new InvalidOperationException("Account not found");
        }
        if(!VerifyPassword(dto.Password, user.PasswordHash))
            return null;
        if(!user.IsActive)
            throw new InvalidOperationException("Account is inactive");

        return GenerateAuthResponse(user);
    }

    public async Task<bool> ChangePasswordAsync (int userId, PasswordUpdateDto dto) {
        if(!_userRepo.TryGetFirstByCondition(x => x.Id == userId, true, out var user)) {
            return false;
        }
        if(!VerifyPassword(dto.OldPassword, user.PasswordHash)) {
            throw new InvalidOperationException("Old password is incorrect");
        }

        user.PasswordHash = HashPassword(dto.NewPassword);
        await _userRepo.SaveChangesAsync();
        return true;
    }

    // helpers
    private string HashPassword (string password) {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private bool VerifyPassword (string password, string hash) {
        return HashPassword(password) == hash;
    }


    //https://learn.microsoft.com/en-us/dotnet/api/system.identitymodel.tokens.jwt.jwtsecuritytokenhandler?view=msal-web-dotnet-latest
    private AuthResponseDto GenerateAuthResponse (User user) {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

        var claims = new List<Claim> {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
        };

        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return new AuthResponseDto(user.Id, tokenHandler.WriteToken(token), user.Username);
    }

}
