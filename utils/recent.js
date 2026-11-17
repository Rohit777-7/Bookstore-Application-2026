// "Recently viewed" books, stored per-browser in localStorage.
const KEY = 'bs-recent';
const MAX = 10;

export function getRecent() {
	try {
		return JSON.parse(localStorage.getItem(KEY)) || [];
	} catch {
		return [];
	}
}

export function pushRecent(product) {
	if (!product) return;
	try {
		const list = getRecent().filter((p) => p.slug !== product.slug);
		list.unshift(product);
		localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
	} catch {
		/* storage unavailable */
	}
}
