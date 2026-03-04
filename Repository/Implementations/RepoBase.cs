using Microsoft.EntityFrameworkCore;
using Repository.Data;
using Repository.Interfaces;
using System.Linq.Expressions;

namespace Repository.Implementations {
    public abstract class RepoBase<T> : IRepoBase<T> where T : class {
        protected readonly RepositoryContext _context;
        public RepoBase (RepositoryContext context) {
            _context = context;
        }

        public bool Any (Func<T, bool> value) {
            return _context.Set<T>().Any(value);
        }

        public void Create (T entity) {
            _context.Set<T>().Add(entity);
        }

        public void Delete (T entity) {
            _context.Set<T>().Remove(entity);
        }

        public async Task<IEnumerable<T>> GetAllAsync () {
            return await _context.Set<T>().ToListAsync();
        }


        public IQueryable<T> FindByCondition (
            Expression<Func<T, bool>> expression,
            bool trackChanges,
            Func<IQueryable<T>, IQueryable<T>>? include = null) {

            var query = !trackChanges
                ? _context.Set<T>().Where(expression).AsNoTracking()
                : _context.Set<T>().Where(expression);

            if(include != null) {
                query = include(query);
            }

            return query;
        }
        public bool TryGetFirstByCondition (
            Expression<Func<T, bool>> expression,
            bool trackChanges,
            out T entity,
            Func<IQueryable<T>, IQueryable<T>>? include = null) {

            var query = !trackChanges
                ? _context.Set<T>().Where(expression).AsNoTracking()
                : _context.Set<T>().Where(expression);

            if(include != null) {
                query = include(query);
            }

            entity = query.FirstOrDefault()!;
            return entity != null;
        }

        public async Task<T?> FindAsync (int id) {
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task SaveChangesAsync () => await _context.SaveChangesAsync();
    }
}
