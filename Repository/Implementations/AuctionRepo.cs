using Models.Entities;
using Repository.Data;
using Repository.Interfaces;

namespace Repository.Implementations {
    public class AuctionRepo : RepoBase<Auction>, IAuctionRepo {
        public AuctionRepo (RepositoryContext context) : base(context) {
        }
    }
}
