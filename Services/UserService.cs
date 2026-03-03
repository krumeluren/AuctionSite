using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Models.DTOs;
using Models.Entities;
using Repository.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
namespace Services;

public class UserService {
    private readonly RepositoryContext _context;
    private readonly IConfiguration _configuration;

    public UserService (RepositoryContext context, IConfiguration configuration) {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync (RegisterDto dto) {
        if(await _context.Users.AnyAsync(u => u.Username == dto.Username))
            throw new InvalidOperationException("Username already taken.");

        var user = new User {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto?> LoginAsync (LoginDto dto) {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if(user == null || !VerifyPassword(dto.Password, user.PasswordHash))
            return null;

        return GenerateAuthResponse(user);
    }

    public async Task<bool> UpdateUserAsync (int userId, UserUpdateDto dto) {
        var user = await _context.Users.FindAsync(userId);
        if(user == null)
            return false;

        user.Email = dto.Email;
        if(!string.IsNullOrEmpty(dto.Password)) {
            user.PasswordHash = HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task DeleteUserAsync (int userId) {
        var user = await _context.Users.FindAsync(userId);
        if(user != null) {
            var userBids = _context.Bids.Where(b => b.UserId == userId);
            _context.Bids.RemoveRange(userBids);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
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
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            ]),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new AuthResponseDto(user.Id, tokenHandler.WriteToken(token), user.Username);
    }
}
