import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';

import Layout from '../../components/Layout';
import Book3D from '../../components/Book3D';
import BookRail from '../../components/BookRail';
import StarRating from '../../components/StarRating';
import { useToast } from '../../components/Toast';
import {
	BagIcon,
	BookIcon,
	HeartIcon,
	ShareIcon,
	ShieldIcon,
	SparkleIcon,
	TruckIcon,
} from '../../components/Icons';
import useAddToCart from '../../hooks/useAddToCart';
import useWishlist from '../../hooks/useWishlist';
import { Store } from '../../utils/Store';
import { pushRecent } from '../../utils/recent';
import {
	arrivedLabel,
	discountOf,
	formatDate,
	formatPrice,
	hasTag,
	inStock,
	isComingSoon,
	isNewArrival,
} from '../../utils/catalog';
import Reviews from '../../components/Reviews';
import BoughtTogether from '../../components/BoughtTogether';
import { CalendarIcon, ClockIcon, TrendUpIcon } from '../../components/Icons';
import useCountdown from '../../hooks/useCountdown';
import { playSound } from '../../utils/sound';
import db from '../../utils/db';
import Product from '../../models/Product';
import Styles from './bookSingle.module.scss';

const pad2 = (n) => String(n).padStart(2, '0');
const formatCountdown = (t) =>
	t ? `${t.days}d ${pad2(t.hours)}h ${pad2(t.minutes)}m ${pad2(t.seconds)}s` : '…';

export default function BookSingle({ book: initialBook, related, chartRank }) {
	const { state } = useContext(Store);
	// Rating/review count update live after the reader posts a review
	const [book, setBook] = useState(initialBook);
	useEffect(() => setBook(initialBook), [initialBook]);
	const countdown = useCountdown(isComingSoon(initialBook || {}) ? initialBook.releaseDate : null);
	const addToCart = useAddToCart();
	const { isWished, toggle } = useWishlist();
	const toast = useToast();
	const [adding, setAdding] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [inCart, setInCart] = useState(0);

	useEffect(() => {
		if (book) pushRecent(book);
	}, [book]);

	useEffect(() => {
		setInCart(state.cart.cartItems.find((i) => i.slug === book?.slug)?.quantity || 0);
	}, [state.cart.cartItems, book]);

	if (!book) {
		return (
			<Layout title="Book not found">
				<div className="container page">
					<div className="empty-state">
						<span className="empty-state__icon">
							<BookIcon size={28} />
						</span>
						<h3>Book can&apos;t be found</h3>
						<p>It may have been moved or is no longer in our catalogue.</p>
						<Link href="/books">
							<a className="button">Browse all books</a>
						</Link>
					</div>
				</div>
			</Layout>
		);
	}

	const discount = discountOf(book);
	const available = inStock(book);
	const preorder = isComingSoon(book);
	const stock = Number(book.countInStock);
	const wished = isWished(book.slug);
	const longText = book.description.length > 260;

	const onAdd = async () => {
		setAdding(true);
		await addToCart(book);
		setAdding(false);
	};

	const share = async () => {
		const url = window.location.href;
		try {
			if (navigator.share) {
				await navigator.share({ title: book.name, text: `${book.name} by ${book.author}`, url });
				return;
			}
			await navigator.clipboard.writeText(url);
			playSound('toggle');
			toast({ title: 'Link copied', message: 'Share it with a fellow reader.' });
		} catch {
			/* user cancelled the share sheet */
		}
	};

	return (
		<Layout title={book.name}>
			<div className={Styles.book_single_wrap}>
				<div className="container">
					<nav className="breadcrumb" aria-label="Breadcrumb">
						<Link href="/">
							<a>Home</a>
						</Link>
						<span>/</span>
						<Link href={`/books?category=${encodeURIComponent(book.category)}`}>
							<a>{book.category}</a>
						</Link>
						<span>/</span>
						<span aria-current="page">{book.name}</span>
					</nav>

					<div className={Styles.book_single_details}>
						<div className={Styles.book_image}>
							<span className={Styles.halo} aria-hidden="true" />
							<Book3D
								src={book.image}
								title={book.name}
								author={book.author}
								width={260}
								turn={-28}
								interactive
								eager
							/>
							<p className={Styles.hint}>Move your cursor over the book to turn it</p>
						</div>

						<div className={Styles.book_single_content}>
							<div className={Styles.tags}>
								<span className="eyebrow">{book.category}</span>
								{hasTag(book, 'bestseller') && <span className={Styles.tag}>Bestseller</span>}
								{hasTag(book, 'editors-pick') && (
									<span className={Styles.tag}>
										<SparkleIcon size={12} /> Editor&apos;s pick
									</span>
								)}
								{chartRank && (
									<Link href="/trending">
										<a className={`${Styles.tag} ${Styles.hot}`}>
											<TrendUpIcon size={12} /> No. {chartRank} this week
										</a>
									</Link>
								)}
								{preorder ? (
									<span className={`${Styles.tag} ${Styles.preTag}`}>
										<CalendarIcon size={12} /> Pre-order
									</span>
								) : (
									isNewArrival(book) && (
										<span className={Styles.tag}>
											<ClockIcon size={12} /> {arrivedLabel(book.arrivedAt)}
										</span>
									)
								)}
							</div>
							<h1 className={Styles.title}>{book.name}</h1>
							<p className={Styles.book_author}>
								by <strong>{book.author}</strong>
							</p>
							<a href="#reviews" className={Styles.ratingLink} data-sound="none">
								<StarRating value={book.rating} count={book.numReviews} size={16} />
							</a>

							<div className={`${Styles.book_description} ${expanded || !longText ? Styles.open : ''}`}>
								<p>{book.description}</p>
							</div>
							{longText && (
								<button className={Styles.readMore} onClick={() => setExpanded((e) => !e)}>
									{expanded ? 'Show less' : 'Read more'}
								</button>
							)}

							<div className={Styles.book_order_block}>
								<div className={Styles.priceRow}>
									<div className={Styles.price}>
										<strong>{formatPrice(book.price)}</strong>
										{discount > 0 && (
											<>
												<s>{formatPrice(book.originalPrice)}</s>
												<span className={Styles.save}>Save {discount}%</span>
											</>
										)}
									</div>
									{preorder ? (
										<p className={`${Styles.stock} ${Styles.preStock}`}>
											<span aria-hidden="true" />
											Ships {formatDate(book.releaseDate, { day: 'numeric', month: 'long' })}
										</p>
									) : (
										<p className={`${Styles.stock} ${!available ? Styles.out : stock <= 5 ? Styles.low : ''}`}>
											<span aria-hidden="true" />
											{!available ? 'Out of stock' : stock <= 5 ? `Only ${stock} left` : 'In stock'}
										</p>
									)}
								</div>

								{preorder && (
									<div className={Styles.release} aria-live="off">
										<span>Arrives in</span>
										<strong>{formatCountdown(countdown)}</strong>
									</div>
								)}

								{available && !preorder && (
									<div className={Styles.stockBar} aria-hidden="true">
										<span style={{ width: `${Math.min(100, (stock / 30) * 100)}%` }} />
									</div>
								)}

								<div className={Styles.actions}>
									<button
										onClick={onAdd}
										className={`${Styles.book_button} button button--lg`}
										disabled={!available || adding}
										data-sound="none"
									>
										<BagIcon size={18} />
										{!available
											? 'Out of stock'
											: adding
											? 'Adding…'
											: preorder
											? 'Pre-order now'
											: 'Add to bag'}
									</button>
									<button
										className={`${Styles.iconAction} ${wished ? Styles.wished : ''}`}
										onClick={() => toggle(book)}
										aria-pressed={wished}
										aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
										data-sound="none"
									>
										<HeartIcon filled={wished} />
									</button>
									<button className={Styles.iconAction} onClick={share} aria-label="Share this book" data-sound="none">
										<ShareIcon />
									</button>
								</div>

								{inCart > 0 && (
									<p className={Styles.inCart}>
										{inCart} in your bag ·{' '}
										<Link href="/cart">
											<a>View bag</a>
										</Link>
									</p>
								)}

								<ul className={Styles.perks}>
									<li>
										<TruckIcon size={18} /> Free shipping over ₹200
									</li>
									<li>
										<ShieldIcon size={18} /> Secure checkout
									</li>
								</ul>
							</div>

							<dl className={Styles.specs}>
								{book.pages && (
									<div>
										<dt>Pages</dt>
										<dd>{book.pages}</dd>
									</div>
								)}
								{book.publishedYear && (
									<div>
										<dt>Published</dt>
										<dd>{book.publishedYear}</dd>
									</div>
								)}
								{book.pages && (
									<div>
										<dt>Reading time</dt>
										<dd>~{Math.max(1, Math.round((book.pages * 275) / 250 / 60))} hrs</dd>
									</div>
								)}
								{book.isbn && (
									<div>
										<dt>ISBN</dt>
										<dd>{book.isbn}</dd>
									</div>
								)}
							</dl>
						</div>
					</div>

					<BoughtTogether book={book} related={related} />

					<Reviews
						book={book}
						onRatingChange={(rating, numReviews) => setBook((b) => ({ ...b, rating, numReviews }))}
					/>
				</div>

				{related.length > 0 && (
					<BookRail
						eyebrow={`More in ${book.category}`}
						title="You may also like"
						books={related}
						href={`/books?category=${encodeURIComponent(book.category)}`}
					/>
				)}
			</div>
		</Layout>
	);
}

export async function getServerSideProps({ params }) {
	await db.connect();
	const book = await Product.findOne({ slug: params.slug }).lean();
	if (!book) {
		return { props: { book: null, related: [], chartRank: null } };
	}
	const related = await Product.find({ category: book.category, slug: { $ne: book.slug } })
		.sort({ weeklySales: -1, rating: -1 })
		.limit(8)
		.lean();

	// Position in this week's overall chart (only shown for the Top 10)
	let chartRank = null;
	if (book.weeklySales > 0) {
		const rank = (await Product.countDocuments({ weeklySales: { $gt: book.weeklySales } })) + 1;
		if (rank <= 10) chartRank = rank;
	}

	return {
		props: {
			book: db.convertDoctoObj(book),
			related: related.map(db.convertDoctoObj),
			chartRank,
		},
	};
}
