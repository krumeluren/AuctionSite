using System.Linq.Expressions;

namespace Repository.Interfaces {
    public interface IRepoBase<T> {
        Task<IEnumerable<T>> GetAllAsync ();
        Task SaveChangesAsync ();
        bool Any (Func<T, bool> value);
        Task<T?> FindAsync (int id);

        void Create (T entity);
        void Delete (T entity);
        IQueryable<T> FindByCondition (Expression<Func<T, bool>> expression, bool trackChanges, Func<IQueryable<T>, IQueryable<T>>? include = null);
        bool TryGetFirstByCondition (Expression<Func<T, bool>> expression, bool trackChanges, out T entity, Func<IQueryable<T>, IQueryable<T>>? include = null);
    }
}
