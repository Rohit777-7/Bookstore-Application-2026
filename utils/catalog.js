// Helpers for formatting and slicing the catalogue into storefront sections.

const DAY = 24 * 60 * 60 * 1000;

export const formatPrice = (value) =>
	'₹' + Number(value || 0).toLocaleString('en-IN');

export const formatCompact = (n) =>
	n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

export const formatDate = (iso, opts = { day: 'numeric', month: 'short' }) =>
	iso ? new Date(iso).toLocaleDateString('en-IN', opts) : '';

export const discountOf = (product) =>
	product.originalPrice && product.originalPrice > product.price
		? Math.round((1 - product.price / product.originalPrice) * 100)
		: 0;

export const hasTag = (product, tag) =>
	Array.isArray(product.tags) && product.tags.includes(tag);

export const inStock = (product) => Number(product.countInStock) > 0;

/* ── Arrival & release ─────────────────────────────────────────── */

export const isComingSoon = (p) =>
	Boolean(p.releaseDate) && new Date(p.releaseDate).getTime() > Date.now();

export const daysSince = (iso) =>
	iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY)) : Infinity;

export const daysUntil = (iso) =>
	iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY)) : 0;

export const isNewArrival = (p) =>
	!isComingSoon(p) && (daysSince(p.arrivedAt) <= 30 || hasTag(p, 'new'));

export function arrivedLabel(iso) {
	const d = daysSince(iso);
	if (d === Infinity) return '';
	if (d === 0) return 'Arrived today';
	if (d === 1) return 'Arrived yesterday';
	if (d < 7) return `Arrived ${d} days ago`;
	if (d < 14) return 'Arrived last week';
	if (d < 31) return `Arrived ${Math.floor(d / 7)} weeks ago`;
	return `In store since ${formatDate(iso, { month: 'short', year: 'numeric' })}`;
}

/* ── Weekly chart ──────────────────────────────────────────────── */

const popularity = (p) => (p.numReviews || 0) * (p.rating || 0);
const weekly = (p) => p.weeklySales || 0;

/**
 * Ranks books by readers this week and compares with last week's chart.
 * Each entry gets: rank, lastRank (null = new entry), move (+ climbed / − fell).
 * Falls back to review popularity for catalogues without sales data.
 */
export function chart(products, { category, limit = 10 } = {}) {
	const pool = products.filter(
		(p) => !isComingSoon(p) && (!category || category === 'All' || p.category === category)
	);
	const hasSales = pool.some((p) => weekly(p) > 0);
	const score = hasSales ? weekly : popularity;

	const lastWeek = pool
		.filter((p) => (p.lastWeekSales || 0) > 0)
		.sort((a, b) => b.lastWeekSales - a.lastWeekSales);
	const lastRankOf = new Map(lastWeek.map((p, i) => [p.slug, i + 1]));

	return [...pool]
		.sort((a, b) => score(b) - score(a))
		.slice(0, limit)
		.map((p, i) => {
			const rank = i + 1;
			const lastRank = hasSales ? lastRankOf.get(p.slug) ?? null : rank;
			return { ...p, rank, lastRank, move: lastRank ? lastRank - rank : null };
		});
}

export function trending(products, n = 10) {
	return chart(products, { limit: n });
}

// Biggest week-on-week growth in readers (min. size so tiny titles don't dominate)
export function climbers(products, n = 3) {
	return products
		.filter((p) => !isComingSoon(p) && p.lastWeekSales > 300 && p.weeklySales > p.lastWeekSales)
		.map((p) => ({ ...p, growth: Math.round((p.weeklySales / p.lastWeekSales - 1) * 100) }))
		.sort((a, b) => b.growth - a.growth)
		.slice(0, n);
}

export function weekLabel(date = new Date()) {
	const start = new Date(date);
	start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	const f = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
	return `${f(start)} – ${f(end)}`;
}

/* ── Sections ──────────────────────────────────────────────────── */

// Days in store; books without an arrival date sort as the oldest
const age = (p) => {
	const d = daysSince(p.arrivedAt);
	return d === Infinity ? 1e9 : d;
};

export const SORTS = {
	featured: { label: 'Featured', fn: () => 0 },
	trending: {
		label: 'Trending',
		fn: (a, b) => weekly(b) - weekly(a) || popularity(b) - popularity(a),
	},
	rating: { label: 'Top rated', fn: (a, b) => b.rating - a.rating },
	newest: {
		label: 'Newest arrivals',
		fn: (a, b) => age(a) - age(b) || (b.publishedYear || 0) - (a.publishedYear || 0),
	},
	'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
	'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
};

export function topRated(products, n = 8) {
	return products
		.filter((p) => p.rating >= 4.5 && !isComingSoon(p))
		.sort((a, b) => b.rating - a.rating || b.numReviews - a.numReviews)
		.slice(0, n);
}

export function newArrivals(products, n = 10) {
	return products
		.filter((p) => !isComingSoon(p))
		.sort(SORTS.newest.fn)
		.slice(0, n);
}

export function comingSoon(products) {
	return products
		.filter(isComingSoon)
		.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
}

// Group arrivals into timeline buckets for the New Arrivals page
export function arrivalGroups(products) {
	const groups = [
		{ key: 'week', label: 'This week', max: 7, books: [] },
		{ key: 'fortnight', label: 'Last week', max: 14, books: [] },
		{ key: 'month', label: 'Earlier this month', max: 31, books: [] },
		{ key: 'recent', label: 'The last few months', max: 120, books: [] },
	];
	newArrivals(products, products.length).forEach((p) => {
		const d = daysSince(p.arrivedAt);
		const g = groups.find((x) => d <= x.max);
		if (g) g.books.push(p);
	});
	return groups.filter((g) => g.books.length);
}

// The biggest in-stock discount is the "deal of the day".
export function dealOfTheDay(products) {
	return (
		[...products]
			.filter((p) => inStock(p) && !isComingSoon(p))
			.sort((a, b) => discountOf(b) - discountOf(a) || weekly(b) - weekly(a))[0] || null
	);
}

export function categoriesWithCounts(products) {
	const counts = {};
	products.forEach((p) => {
		counts[p.category] = (counts[p.category] || 0) + 1;
	});
	return Object.entries(counts)
		.map(([name, count]) => ({ name, count, ...categoryMeta(name) }))
		.sort((a, b) => b.count - a.count);
}

/* ── Moods ─────────────────────────────────────────────────────── */

export const MOODS = [
	{ key: 'escape', emoji: '🐉', label: 'Escape to another world', categories: ['Fantasy & Sci-Fi'] },
	{ key: 'thrill', emoji: '🔪', label: 'Keep me up all night', categories: ['Thriller'] },
	{ key: 'feel', emoji: '💛', label: 'Make me feel something', categories: ['Fiction'] },
	{ key: 'grow', emoji: '🌱', label: 'Help me grow', categories: ['Self Help'] },
	{ key: 'money', emoji: '💰', label: 'Get smarter about money', categories: ['Finance'] },
	{ key: 'curious', emoji: '🧠', label: 'Feed my curiosity', categories: ['Non-Fiction'] },
	{ key: 'timeless', emoji: '🕯️', label: 'Something timeless', categories: ['Classics'] },
];

/* ── Category art ──────────────────────────────────────────────── */

const unsplash = (id) =>
	`https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

// Background art + accent per category. If an image ever fails to load, the
// gradient underneath still gives each tile its own look.
const CATEGORY_META = {
	Classics: {
		image: unsplash('photo-1544947950-fa07a98d237f'),
		tint: '#6b4a1f',
		blurb: 'Timeless stories that shaped literature',
	},
	Fiction: {
		image: unsplash('photo-1512820790803-83ca734da794'),
		tint: '#5a2330',
		blurb: 'Modern novels you will not put down',
	},
	'Fantasy & Sci-Fi': {
		image: unsplash('photo-1532012197267-da84d127e765'),
		tint: '#1f3a5a',
		blurb: 'Dragons, deserts and distant worlds',
	},
	Thriller: {
		image: unsplash('photo-1495446815901-a7297e633e8d'),
		tint: '#2a2a2a',
		blurb: 'Twists, secrets and sleepless nights',
	},
	'Self Help': {
		image: unsplash('photo-1519682337058-a94d519337bc'),
		tint: '#2f5a48',
		blurb: 'Small habits, big changes',
	},
	Finance: {
		image: unsplash('photo-1524995997946-a1c2e315a42f'),
		tint: '#4a4a1f',
		blurb: 'Think smarter about money',
	},
	'Non-Fiction': {
		image: unsplash('photo-1481627834876-b7833e8f5570'),
		tint: '#3d2a50',
		blurb: 'True stories and big ideas',
	},
};

export function categoryMeta(name) {
	return (
		CATEGORY_META[name] || {
			image: unsplash('photo-1507842217343-583bb7270b66'),
			tint: '#4a3a24',
			blurb: 'Explore the collection',
		}
	);
}

export const LIBRARY_BG = unsplash('photo-1507842217343-583bb7270b66').replace(
	'w=900',
	'w=1800'
);
