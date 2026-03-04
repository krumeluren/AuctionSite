using Microsoft.EntityFrameworkCore;
using Models.Entities;
namespace Repository.Data;

public class RepositoryContext : DbContext {
    public RepositoryContext (DbContextOptions<RepositoryContext> options) : base(options) {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Auction> Auctions { get; set; }
    public DbSet<Bid> Bids { get; set; }

    protected override void OnModelCreating (ModelBuilder modelBuilder) {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Auction>()
            .HasOne(a => a.Creator)
            .WithMany(u => u.Auctions)
            .HasForeignKey(a => a.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Bid>()
            .HasOne(b => b.Auction)
            .WithMany(a => a.Bids)
            .HasForeignKey(b => b.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Bid>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bids)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>().HasData(new User {
            Id = 1,
            Username = "admin",
            Email = "admin@system.local",
            PasswordHash = "jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=", // hashed "admin"
            IsAdmin = true,
            IsActive = true
        });
    }
}