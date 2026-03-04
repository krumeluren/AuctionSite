namespace Models.DTOs;

public record RegisterDto (string Username, string Email, string Password);
public record LoginDto (string Username, string Password);
public record AuthResponseDto (int UserId, string Token, string Username);


public class CreateAuctionDto {
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public DateTime EndDate { get; set; }
    // StartDate automatically set during creation
}
public class AuctionDto {
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int CreatorId { get; set; }
    public string CreatorUsername { get; set; } = string.Empty;
    public bool IsOpen { get; set; }
    public bool IsActive { get; set; }
}

public class AuctionDetailDto : AuctionDto {
    public IEnumerable<BidDto> Bids { get; set; } = new List<BidDto>();
    public BidDto? WinningBid { get; set; }
}

public class UpdateAuctionDto {
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
}

public class CreateBidDto {
    public int AuctionId { get; set; }
    public decimal Amount { get; set; }
}

public class BidDto {
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
}
public class PasswordUpdateDto {
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class UserDto {
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public bool IsActive { get; set; }
}