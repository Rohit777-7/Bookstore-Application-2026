import Link from 'next/link';

import Layout from '../components/Layout';
import Book3D from '../components/Book3D';
import ProductItem from '../components/ProductItem';
import StarRating from '../components/StarRating';
import { ComingSoonSection } from '../components/ComingSoon';
import { ArrowRight, BagIcon, ClockIcon, HeartIcon, SparkleIcon } from '../components/Icons';
import useAddToCart from '../hooks/useAddToCart';
import useWishlist from '../hooks/useWishlist';
import Product from '../models/Product';
import db from '../utils/db';
import {
	arrivalGroups,
	arrivedLabel,
	comingSoon,
	discountOf,
	formatPrice,
	inStock,
	newArrivals,
} from '../utils/catalog';
import Styles from '../styles/NewArrivals.module.scss';

function Spotlight({ book }) {
	const addToCart = useAddToCart();
	const { isWished, toggle } = useWishlist();
	const wished = isWished(book.slug);
	const discount = discountOf(book);

	return (
		<section className={`${Styles.spotlight} reveal`}>
			<div className={Styles.crate}>
				<span className={Styles.tape} aria-hidden="true" />
				<Book3D src={book.image} title={book.name} author={book.author} width={230} turn={-24} interactive eager />
			</div>
			<div className={Styles.spotInfo}>
				<p className={Styles.stamp}>
					<SparkleIcon size={14} /> Just landed · {arrivedLabel(book.arrivedAt).replace('Arrived ', '')}
				</p>
				<h2>{book.name}</h2>
				<p className={Styles.by}>by {book.author}</p>
				<StarRating value={book.rating} count={book.numReviews} />
				<p className={Styles.desc}>{book.description}</p>
				<div className={Styles.price}>
					<strong>{formatPrice(book.price)}</strong>
					{discount > 0 && <s>{formatPrice(book.originalPrice)}</s>}
				</div>
				<div className={Styles.actions}>
					<button className="button button--lg" onClick={() => addToCart(book)} disabled={!inStock(book)} data-sound="none">
						<BagIcon size={18} /> Add to bag
					</button>
					<button
						className="button button--ghost button--lg"
						onClick={() => toggle(book)}
						aria-pressed={wished}
						data-sound="none"
					>
						<HeartIcon filled={wished} size={18} /> {wished ? 'Saved' : 'Save'}
					</button>
					<Link href={`/books/${book.slug}`}>
						<a className="link-arrow">
							Details <ArrowRight size={16} />
						</a>
					</Link>
				</div>
			</div>
		</section>
	);
}

export default function NewArrivals({ products }) {
	const [latest] = newArrivals(products, 1);
	const upcoming = comingSoon(products);
	const groups = arrivalGroups(products.filter((p) => p.slug !== latest?.slug));

	return (
		<Layout title="New Arrivals">
			<section className={`page-hero ${Styles.hero}`}>
				<div className="container">
					<p className="eyebrow">Fresh ink</p>
					<h1>
						New <em>arrivals</em>
					</h1>
					<p>
						Straight from the delivery van to our shelves. Here&apos;s everything that arrived recently,
						plus the books you can reserve before they land.
					</p>
					<nav className={Styles.jump} aria-label="Jump to section">
						{upcoming.length > 0 && <a href="#coming-soon">Coming soon · {upcoming.length}</a>}
						{groups.map((g) => (
							<a key={g.key} href={`#${g.key}`}>
								{g.label} · {g.books.length}
							</a>
						))}
					</nav>
				</div>
			</section>

			<div className="container">{latest && <Spotlight book={latest} />}</div>

			<div id="coming-soon">
				<ComingSoonSection books={upcoming} showLink={false} />
			</div>

			<div className="container">
				<div className={Styles.timeline}>
					{groups.map((group) => (
						<section key={group.key} id={group.key} className={Styles.group}>
							<header className={`${Styles.groupHead} reveal`}>
								<span className={Styles.dot} aria-hidden="true" />
								<h2>{group.label}</h2>
								<span className={Styles.count}>
									{group.books.length} {group.books.length === 1 ? 'title' : 'titles'}
								</span>
							</header>
							<div className="book_listing">
								{group.books.map((book, i) => (
									<ProductItem
										key={book.slug}
										product={book}
										index={i}
										note={
											<>
												<ClockIcon size={12} /> {arrivedLabel(book.arrivedAt)}
											</>
										}
									/>
								))}
							</div>
						</section>
					))}
				</div>

				{!latest && (
					<div className="empty-state">
						<h3>No new arrivals yet</h3>
						<p>Check back soon — new books land every week.</p>
					</div>
				)}
			</div>
		</Layout>
	);
}

export async function getServerSideProps() {
	await db.connect();
	const products = await Product.find().lean();
	return { props: { products: products.map(db.convertDoctoObj) } };
}
