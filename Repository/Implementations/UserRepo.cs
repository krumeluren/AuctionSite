using Models.Entities;
using Repository.Data;
using Repository.Interfaces;

namespace Repository.Implementations {
    public class UserRepo : RepoBase<User>, IUserRepo {
        public UserRepo (RepositoryContext context) : base(context) {
        }
    }
}
