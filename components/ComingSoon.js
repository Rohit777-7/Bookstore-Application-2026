import Link from 'next/link';

import Book3D from './Book3D';
import { ArrowRight, BagIcon, CalendarIcon } from './Icons';
import useAddToCart from '../hooks/useAddToCart';
import useCountdown from '../hooks/useCountdown';
import { discountOf, formatDate, formatPrice } from '../utils/catalog';
import Styles from './ComingSoon.module.scss';

const pad = (n) => String(n).padStart(2, '0');

export function ComingSoonCard({ book, index = 0 }) {
	const t = useCountdown(book.releaseDate);
	const addToCart = useAddToCart();
	const discount = discountOf(book);

	const units = [
		[t ? t.days : '–', 'Days'],
		[t ? pad(t.hours) : '–', 'Hrs'],
		[t ? pad(t.minutes) : '–', 'Min'],
		[t ? pad(t.seconds) : '–', 'Sec'],
	];

	return (
		<article className={`${Styles.card} reveal`} style={{ '--i': index }}>
			<div className={Styles.stage}>
				<span className={Styles.veil} aria-hidden="true" />
				<Link href={`/books/${book.slug}`}>
					<a tabIndex={-1} aria-hidden="true">
						<Book3D src={book.image} title={book.name} author={book.author} width={130} turn={-30} />
					</a>
				</Link>
			</div>
			<div className={Styles.body}>
				<p className={Styles.date}>
					<CalendarIcon size={14} /> Arrives {formatDate(book.releaseDate, { day: 'numeric', month: 'long' })}
				</p>
				<Link href={`/books/${book.slug}`}>
					<a className={Styles.title}>{book.name}</a>
				</Link>
				<p className={Styles.author}>by {book.author}</p>

				<div className={Styles.countdown} aria-label={t ? `${t.days} days to release` : undefined}>
					{units.map(([value, label]) => (
						<span key={label}>
							<strong key={value}>{value}</strong>
							<small>{label}</small>
						</span>
					))}
				</div>

				<div className={Styles.footer}>
					<p className={Styles.price}>
						{formatPrice(book.price)}
						{discount > 0 && <s>{formatPrice(book.originalPrice)}</s>}
					</p>
					<button className="button button--sm" onClick={() => addToCart(book)} data-sound="none">
						<BagIcon size={14} /> Pre-order
					</button>
				</div>
			</div>
		</article>
	);
}

export function ComingSoonSection({ books, showLink = true }) {
	if (!books?.length) return null;
	return (
		<section className={Styles.section}>
			<div className="container">
				<header className={`${Styles.head} reveal`}>
					<div>
						<p className="eyebrow">Reserve your copy</p>
						<h2 className="section-title">
							Coming <em>soon</em>
						</h2>
						<p className="section-sub">
							Pre-order today. Your copy ships the day it arrives, and you pay today&apos;s price.
						</p>
					</div>
					{showLink && (
						<Link href="/new-arrivals#coming-soon">
							<a className="link-arrow" data-sound="tap">
								All upcoming <ArrowRight size={16} />
							</a>
						</Link>
					)}
				</header>
				<div className={Styles.grid}>
					{books.map((book, i) => (
						<ComingSoonCard key={book.slug} book={book} index={i} />
					))}
				</div>
			</div>
		</section>
	);
}
