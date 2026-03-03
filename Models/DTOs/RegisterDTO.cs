namespace Models.DTOs;

public record RegisterDto (string Username, string Email, string Password);
public record LoginDto (string Username, string Password);
public record AuthResponseDto (int UserId, string Token, string Username);

// User
public record UserUpdateDto (string Email, string? Password);



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
}

public class AuctionDetailDto : AuctionDto {
    public IEnumerable<BidDto> Bids { get; set; } = new List<BidDto>();
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