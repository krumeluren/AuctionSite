namespace Models.Entities;

public class User {
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public ICollection<Auction> Auctions { get; set; } = new List<Auction>();
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
}

public class Auction {
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int CreatorId { get; set; }
    public User Creator { get; set; } = null!;
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
}

public class Bid {
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int AuctionId { get; set; }
    public Auction Auction { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}