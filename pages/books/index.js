import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import Layout from '../../components/Layout';
import ProductItem from '../../components/ProductItem';
import ShelfEnd from '../../components/ShelfEnd';
import { CloseIcon, SearchIcon } from '../../components/Icons';
import Product from '../../models/Product';
import db from '../../utils/db';
import { inStock, LIBRARY_BG, SORTS, trending } from '../../utils/catalog';
import Styles from '../../styles/Shop.module.scss';

const Books = ({ products: books }) => {
	const router = useRouter();
	const categories = useMemo(() => [...new Set(books.map((b) => b.category))].sort(), [books]);
	const priceCeiling = useMemo(
		() => Math.ceil(Math.max(0, ...books.map((b) => b.price)) / 100) * 100,
		[books]
	);

	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('All');
	const [sort, setSort] = useState('featured');
	const [maxPrice, setMaxPrice] = useState(priceCeiling);
	const [onlyInStock, setOnlyInStock] = useState(false);

	// Read initial filters from the URL (?q=, ?category=, ?sort=)
	useEffect(() => {
		if (!router.isReady) return;
		const { q, category: c, sort: s } = router.query;
		setQuery(typeof q === 'string' ? q : '');
		setCategory(typeof c === 'string' && categories.includes(c) ? c : 'All');
		setSort(typeof s === 'string' && SORTS[s] ? s : 'featured');
	}, [router.isReady, router.query, categories]);

	// Keep the URL shareable without re-running getServerSideProps
	const updateUrl = (next) => {
		const params = { ...router.query, ...next };
		Object.keys(params).forEach((k) => {
			if (!params[k] || params[k] === 'All' || params[k] === 'featured') delete params[k];
		});
		router.replace({ pathname: '/books', query: params }, undefined, { shallow: true, scroll: false });
	};

	const results = useMemo(() => {
		const q = query.trim().toLowerCase();
		const list = books.filter(
			(b) =>
				(category === 'All' || b.category === category) &&
				b.price <= maxPrice &&
				(!onlyInStock || inStock(b)) &&
				(!q || [b.name, b.author, b.category].some((f) => f.toLowerCase().includes(q)))
		);
		return sort === 'featured' ? list : [...list].sort(SORTS[sort].fn);
	}, [books, query, category, maxPrice, onlyInStock, sort]);

	const filtersActive =
		query || category !== 'All' || maxPrice < priceCeiling || onlyInStock || sort !== 'featured';

	const reset = () => {
		setQuery('');
		setCategory('All');
		setSort('featured');
		setMaxPrice(priceCeiling);
		setOnlyInStock(false);
		router.replace('/books', undefined, { shallow: true, scroll: false });
	};

	const heading =
		sort === 'trending' ? (
			<>
				Trending <em>now</em>
			</>
		) : sort === 'newest' ? (
			<>
				New <em>arrivals</em>
			</>
		) : category !== 'All' ? (
			<em>{category}</em>
		) : (
			<>
				Browse <em>Books</em>
			</>
		);

	return (
		<Layout title="Browse Books">
			<section className="page-hero" style={{ '--page-hero-image': `url("${LIBRARY_BG}")` }}>
				<div className="container">
					<p className="eyebrow">The library</p>
					<h1>{heading}</h1>
					<p>
						{books.length} hand-picked titles across {categories.length} genres. Filter, sort and
						find the one that is meant for you.
					</p>
				</div>
			</section>

			<div className="container">
				<div className={Styles.toolbar}>
					<label className={Styles.search}>
						<SearchIcon size={18} />
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onBlur={() => updateUrl({ q: query.trim() })}
							placeholder="Search title, author or genre"
							aria-label="Search books"
						/>
					</label>

					<div className={Styles.controls}>
						<label className={Styles.select}>
							<span>Sort</span>
							<select
								value={sort}
								onChange={(e) => {
									setSort(e.target.value);
									updateUrl({ sort: e.target.value });
								}}
							>
								{Object.entries(SORTS).map(([key, { label }]) => (
									<option key={key} value={key}>
										{label}
									</option>
								))}
							</select>
						</label>

						<label className={Styles.range}>
							<span>
								Up to <strong>₹{Number(maxPrice).toLocaleString('en-IN')}</strong>
							</span>
							<input
								type="range"
								min={0}
								max={priceCeiling}
								step={100}
								value={maxPrice}
								onChange={(e) => setMaxPrice(Number(e.target.value))}
								style={{ '--fill': `${priceCeiling ? (maxPrice / priceCeiling) * 100 : 100}%` }}
							/>
						</label>

						<label className={Styles.toggle}>
							<input
								type="checkbox"
								checked={onlyInStock}
								onChange={(e) => setOnlyInStock(e.target.checked)}
								data-sound="toggle"
							/>
							<span aria-hidden="true" />
							In stock
						</label>
					</div>
				</div>

				<div className={Styles.chips} role="tablist" aria-label="Categories">
					{['All', ...categories].map((c) => (
						<button
							key={c}
							role="tab"
							aria-selected={category === c}
							className={`${Styles.chip} ${category === c ? Styles.chipActive : ''}`}
							onClick={() => {
								setCategory(c);
								updateUrl({ category: c });
							}}
						>
							{c}
							<span>{c === 'All' ? books.length : books.filter((b) => b.category === c).length}</span>
						</button>
					))}
				</div>

				<div className={Styles.meta}>
					<p>
						Showing <strong>{results.length}</strong> of {books.length} books
					</p>
					{filtersActive && (
						<button className={Styles.clear} onClick={reset}>
							<CloseIcon size={14} /> Clear filters
						</button>
					)}
				</div>

				{results.length > 0 ? (
					<div className="book_listing">
						{results.map((product, i) => (
							<ProductItem product={product} key={product.slug} index={i} />
						))}
						{/* Fills the rest of the last row, whatever its length */}
						<ShelfEnd books={trending(books, 3)} />
					</div>
				) : (
					<div className="empty-state">
						<span className="empty-state__icon">
							<SearchIcon size={28} />
						</span>
						<h3>No books found</h3>
						<p>
							{books.length === 0
								? 'The catalogue is empty — run `npm run seed` to add books.'
								: 'Try a different search, a wider price range or another category.'}
						</p>
						{filtersActive && (
							<button className="button button--ghost" onClick={reset}>
								Reset filters
							</button>
						)}
					</div>
				)}
			</div>
		</Layout>
	);
};

export default Books;

export async function getServerSideProps() {
	await db.connect();
	const products = await Product.find().lean();

	return {
		props: {
			products: products.map(db.convertDoctoObj),
		},
	};
}
