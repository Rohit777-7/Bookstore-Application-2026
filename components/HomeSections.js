import Link from 'next/link';
import { useEffect, useState } from 'react';

import Book3D from './Book3D';
import StarRating from './StarRating';
import { ArrowRight, BagIcon, SparkleIcon } from './Icons';
import { useToast } from './Toast';
import useAddToCart from '../hooks/useAddToCart';
import { discountOf, formatPrice, LIBRARY_BG } from '../utils/catalog';
import { playSound } from '../utils/sound';
import Styles from '../styles/Home.module.scss';

/* ── Shop by category ─────────────────────────────────────────── */

export function CategoryTiles({ categories }) {
	if (!categories?.length) return null;
	return (
		<section className={Styles.section}>
			<div className="container">
				<div className="section-head center reveal">
					<p className="eyebrow">Browse the shelves</p>
					<h2 className="section-title">
						Shop by <em>category</em>
					</h2>
				</div>
				<div className={Styles.categories}>
					{categories.map((cat, i) => (
						<Link href={`/books?category=${encodeURIComponent(cat.name)}`} key={cat.name}>
							<a
								className={`${Styles.category} reveal`}
								style={{ '--i': i, '--tint': cat.tint, '--img': `url("${cat.image}")` }}
								data-sound="tap"
							>
								<span className={Styles.categoryBg} aria-hidden="true" />
								<span className={Styles.categoryBody}>
									<span className={Styles.categoryCount}>
										{cat.count} {cat.count === 1 ? 'title' : 'titles'}
									</span>
									<strong>{cat.name}</strong>
									<span className={Styles.categoryBlurb}>{cat.blurb}</span>
								</span>
								<span className={Styles.categoryArrow} aria-hidden="true">
									<ArrowRight size={18} />
								</span>
							</a>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}

/* ── Deal of the day with live countdown ──────────────────────── */

function useCountdownToMidnight() {
	const [left, setLeft] = useState(null);
	useEffect(() => {
		const tick = () => {
			const now = new Date();
			const end = new Date(now);
			end.setHours(24, 0, 0, 0);
			setLeft(Math.max(0, end - now));
		};
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);
	if (left === null) return ['--', '--', '--'];
	const s = Math.floor(left / 1000);
	return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) =>
		String(n).padStart(2, '0')
	);
}

export function DealOfTheDay({ book }) {
	const [h, m, s] = useCountdownToMidnight();
	const addToCart = useAddToCart();
	if (!book) return null;
	const discount = discountOf(book);

	return (
		<section className={Styles.section}>
			<div className="container">
				<div className={`${Styles.deal} reveal`}>
					<div className={Styles.dealStage}>
						<span className={Styles.dealRing} aria-hidden="true" />
						<Book3D
							src={book.image}
							title={book.name}
							author={book.author}
							width={210}
							turn={-30}
							interactive
						/>
					</div>
					<div className={Styles.dealCopy}>
						<p className="eyebrow">
							<SparkleIcon size={14} /> Deal of the day
						</p>
						<h2 className="section-title">{book.name}</h2>
						<p className={Styles.dealAuthor}>by {book.author}</p>
						<StarRating value={book.rating} count={book.numReviews} />
						<p className={Styles.dealText}>{book.description}</p>

						<div className={Styles.dealPrice}>
							<strong>{formatPrice(book.price)}</strong>
							{discount > 0 && (
								<>
									<s>{formatPrice(book.originalPrice)}</s>
									<span>−{discount}%</span>
								</>
							)}
						</div>

						<div className={Styles.countdown} aria-label={`Offer ends in ${h} hours ${m} minutes`}>
							{[
								[h, 'Hours'],
								[m, 'Minutes'],
								[s, 'Seconds'],
							].map(([value, label]) => (
								<div key={label}>
									<strong key={value}>{value}</strong>
									<span>{label}</span>
								</div>
							))}
						</div>

						<div className={Styles.dealActions}>
							<button className="button button--lg" onClick={() => addToCart(book)} data-sound="none">
								<BagIcon size={18} /> Claim the deal
							</button>
							<Link href={`/books/${book.slug}`}>
								<a className="link-arrow" data-sound="tap">
									Details <ArrowRight size={16} />
								</a>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

/* ── Quote band ───────────────────────────────────────────────── */

export function QuoteBand() {
	return (
		<section className={Styles.quote} style={{ '--img': `url("${LIBRARY_BG}")` }}>
			<div className="container reveal">
				<span className={Styles.quoteMark} aria-hidden="true">
					“
				</span>
				<blockquote>
					A reader lives a thousand lives before he dies. The man who never reads lives only one.
				</blockquote>
				<p className={Styles.quoteBy}>George R.R. Martin</p>
			</div>
		</section>
	);
}

/* ── Newsletter ───────────────────────────────────────────────── */

export function Newsletter() {
	const toast = useToast();
	const [email, setEmail] = useState('');

	const submit = (e) => {
		e.preventDefault();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			playSound('error');
			toast({ type: 'error', title: 'Check your email', message: 'Please enter a valid email address.' });
			return;
		}
		playSound('add');
		toast({ title: 'You’re on the list', message: 'Watch your inbox for new arrivals and offers.' });
		setEmail('');
	};

	return (
		<section className={Styles.section}>
			<div className="container">
				<div className={`${Styles.newsletter} reveal`}>
					<div>
						<p className="eyebrow">The reading room</p>
						<h2 className="section-title">
							New chapters, <em>first</em>
						</h2>
						<p className="section-sub">
							Monthly picks from our editors, early access to deals and the occasional
							beautifully-bound surprise.
						</p>
					</div>
					<form className={Styles.newsletterForm} onSubmit={submit} noValidate>
						<label htmlFor="newsletter-email" className="sr-only">
							Email address
						</label>
						<input
							id="newsletter-email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							autoComplete="email"
						/>
						<button className="button" type="submit" data-sound="none">
							Subscribe
						</button>
					</form>
				</div>
			</div>
		</section>
	);
}
