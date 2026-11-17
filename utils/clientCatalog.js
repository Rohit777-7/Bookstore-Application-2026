// Client-side catalogue cache shared by search, "Surprise me", etc.
// Fetched once per session from /api/products.
let cache = null;
let pending = null;

export function loadCatalog() {
	if (cache) return Promise.resolve(cache);
	if (!pending) {
		pending = fetch('/api/products')
			.then((r) => (r.ok ? r.json() : { books: [] }))
			.then((d) => {
				cache = d.books || [];
				return cache;
			})
			.catch(() => {
				pending = null;
				return [];
			});
	}
	return pending;
}

export const cachedCatalog = () => cache;
