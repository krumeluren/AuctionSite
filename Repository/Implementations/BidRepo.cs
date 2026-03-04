using Models.Entities;
using Repository.Data;
using Repository.Interfaces;

namespace Repository.Implementations {
    public class BidRepo : RepoBase<Bid>, IBidRepo {
        public BidRepo (RepositoryContext context) : base(context) {
        }

    }
}
