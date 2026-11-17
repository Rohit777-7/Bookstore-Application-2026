import { useEffect, useState } from 'react';

import Layout from '../components/Layout';
import Banner from '../components/Banner';
import BookRail from '../components/BookRail';
import ProductItem from '../components/ProductItem';
import MoodPicker from '../components/MoodPicker';
import { ChartPreview } from '../components/Charts';
import { ComingSoonSection } from '../components/ComingSoon';
import { CategoryTiles, DealOfTheDay, Newsletter, QuoteBand } from '../components/HomeSections';
import { BookIcon, ClockIcon, SparkleIcon } from '../components/Icons';
import db from '../utils/db';
import Product from '../models/Product';
import {
	arrivedLabel,
	categoriesWithCounts,
	chart,
	comingSoon,
	dealOfTheDay,
	newArrivals,
	topRated,
} from '../utils/catalog';
import { getRecent } from '../utils/recent';

const RIBBON = [
	'Free shipping on orders over ₹200',
	'Secure checkout',
	'Pre-order upcoming titles',
	'New arrivals every week',
	'Write a review, help a reader',
	'Weekly bestseller charts',
];

const arrivalNote = (book) => (
	<>
		<ClockIcon size={12} /> {arrivedLabel(book.arrivedAt)}
	</>
);

export default function Home({ products }) {
	const topRatedBooks = topRated(products, 8);
	const weeklyChart = chart(products, { limit: 5 });
	const newBooks = newArrivals(products, 10);
	const upcoming = comingSoon(products).slice(0, 3);
	const deal = dealOfTheDay(products);
	const categories = categoriesWithCounts(products);
	const [recent, setRecent] = useState([]);

	useEffect(() => setRecent(getRecent()), []);

	let stats = null;
	if (products.length) {
		stats = {
			titles: products.length,
			rating: (products.reduce((a, p) => a + p.rating, 0) / products.length).toFixed(1),
			reviews: products.reduce((a, p) => a + (p.numReviews || 0), 0),
		};
	}

	return (
		<Layout title="Homepage">
			<Banner books={topRatedBooks.length ? topRatedBooks : products} stats={stats} />

			<div className="marquee" aria-hidden="true">
				<div className="marquee__track">
					{[...RIBBON, ...RIBBON].map((text, i) => (
						<span key={i}>{text}</span>
					))}
				</div>
			</div>

			<div id="discover" />

			{products.length === 0 ? (
				<div className="container">
					<div className="empty-state">
						<span className="empty-state__icon">
							<BookIcon size={30} />
						</span>
						<h3>The shelves are empty</h3>
						{process.env.NODE_ENV !== 'production' ? (
							<p>
								No books were found in the database. Seed the catalogue with{' '}
								<code>npm run seed</code> and refresh this page.
							</p>
						) : (
							<p>Our collection is being restocked. Please check back soon.</p>
						)}
					</div>
				</div>
			) : (
				<>
					{/* Trending = this week's chart (ranked by readers, with movement) */}
					<ChartPreview books={weeklyChart} />

					<ComingSoonSection books={upcoming} />

					<CategoryTiles categories={categories} />

					<MoodPicker products={products} />

					<section className="book_listing_wrap">
						<div className="container">
							<div className="section-head center reveal">
								<p className="eyebrow">Loved by readers</p>
								<h2 className="section-title">
									Top Rated <em>Books</em>
								</h2>
								<p className="section-sub">Every title here holds a rating of 4.5 stars or higher.</p>
							</div>
							<div className="book_listing book_listing--fill">
								{topRatedBooks.map((product, i) => (
									<ProductItem product={product} key={product.slug} index={i} />
								))}
							</div>
						</div>
					</section>

					<DealOfTheDay book={deal} />

					{/* New arrivals = most recently added to the store */}
					<BookRail
						eyebrow="Fresh off the delivery van"
						icon={<SparkleIcon size={14} />}
						title="New arrivals"
						books={newBooks}
						href="/new-arrivals"
						noteFor={arrivalNote}
					/>

					<QuoteBand />

					{recent.length > 0 && (
						<BookRail eyebrow="Pick up where you left off" title="Recently viewed" books={recent} />
					)}

					<Newsletter />
				</>
			)}
		</Layout>
	);
}

export async function getServerSideProps() {
	await db.connect();
	const products = await Product.find().lean();

	return {
		props: {
			products: products.map(db.convertDoctoObj),
		},
	};
}
