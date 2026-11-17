import Link from 'next/link';

import Book3D from './Book3D';
import Cover from './Cover';
import StarRating from './StarRating';
import { ArrowRight, BagIcon, SparkleIcon, TrophyIcon } from './Icons';
import useAddToCart from '../hooks/useAddToCart';
import { formatCompact, formatPrice, inStock, weekLabel } from '../utils/catalog';
import Styles from './Charts.module.scss';

/* ── ▲ 3 / ▼ 2 / — / NEW ─────────────────────────────────────── */

export function Movement({ move, compact = false }) {
	if (move === null || move === undefined) {
		return (
			<span className={`${Styles.move} ${Styles.isNew}`} title="New entry this week">
				<SparkleIcon size={11} /> {compact ? 'New' : 'New entry'}
			</span>
		);
	}
	if (move > 0) {
		return (
			<span className={`${Styles.move} ${Styles.up}`} title={`Up ${move} from last week`}>
				▲ {move}
			</span>
		);
	}
	if (move < 0) {
		return (
			<span className={`${Styles.move} ${Styles.down}`} title={`Down ${-move} from last week`}>
				▼ {-move}
			</span>
		);
	}
	return (
		<span className={`${Styles.move} ${Styles.same}`} title="Same position as last week">
			—
		</span>
	);
}

/* ── One row of the chart ─────────────────────────────────────── */

export function ChartRow({ book, max, index = 0 }) {
	const addToCart = useAddToCart();
	const heat = max ? Math.max(6, Math.round(((book.weeklySales || 0) / max) * 100)) : 0;

	return (
		<li className={`${Styles.row} reveal`} style={{ '--i': index }}>
			<span className={Styles.rank}>{String(book.rank).padStart(2, '0')}</span>
			<span className={Styles.rowMove}>
				<Movement move={book.move} compact />
			</span>
			<Link href={`/books/${book.slug}`}>
				<a className={Styles.thumb} tabIndex={-1} aria-hidden="true">
					<Cover src={book.image} title={book.name} author={book.author} />
				</a>
			</Link>
			<div className={Styles.rowInfo}>
				<Link href={`/books/${book.slug}`}>
					<a className={Styles.rowTitle}>{book.name}</a>
				</Link>
				<p className={Styles.rowAuthor}>
					{book.author} · <span>{book.category}</span>
				</p>
				{max > 0 && (
					<div className={Styles.heat} aria-label={`${book.weeklySales} readers this week`}>
						<span className={Styles.heatBar}>
							<span style={{ width: `${heat}%` }} />
						</span>
						<span className={Styles.heatLabel}>{formatCompact(book.weeklySales)} readers</span>
					</div>
				)}
			</div>
			<span className={Styles.rowPrice}>{formatPrice(book.price)}</span>
			<button
				className={Styles.rowAdd}
				onClick={() => addToCart(book)}
				disabled={!inStock(book)}
				aria-label={`Add ${book.name} to bag`}
				data-sound="none"
			>
				<BagIcon size={18} />
			</button>
		</li>
	);
}

/* ── Top-3 podium ─────────────────────────────────────────────── */

const PODIUM_ORDER = [1, 0, 2]; // silver · gold · bronze

export function Podium({ books }) {
	const top = books.slice(0, 3);
	if (top.length < 3) return null;
	return (
		<div className={Styles.podium}>
			{PODIUM_ORDER.map((i) => {
				const book = top[i];
				return (
					<div key={book.slug} className={`${Styles.step} ${Styles[`place${i + 1}`]}`}>
						<Link href={`/books/${book.slug}`}>
							<a className={Styles.stepBook} aria-label={`No. ${i + 1}: ${book.name}`} data-sound="tap">
								{i === 0 && (
									<span className={Styles.crown} aria-hidden="true">
										<TrophyIcon size={22} />
									</span>
								)}
								<Book3D
									src={book.image}
									title={book.name}
									author={book.author}
									width={i === 0 ? 170 : 140}
									turn={i === 1 ? 22 : i === 2 ? -30 : -14}
									eager
								/>
							</a>
						</Link>
						<div className={Styles.stepCaption}>
							<Movement move={book.move} />
							<strong>{book.name}</strong>
							<span>{book.author}</span>
							<span className={Styles.stepReaders}>{formatCompact(book.weeklySales)} readers this week</span>
						</div>
						<div className={Styles.block}>
							<span>{i + 1}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/* ── Home-page chart preview: No.1 spotlight + next four ─────── */

export function ChartPreview({ books }) {
	const addToCart = useAddToCart();
	if (books.length < 2) return null;
	const [first, ...rest] = books;
	const max = first.weeklySales || 0;

	return (
		<section className={Styles.preview}>
			<div className="container">
				<header className={`${Styles.previewHead} reveal`}>
					<div>
						<p className="eyebrow">The weekly chart · {weekLabel()}</p>
						<h2 className="section-title">
							Trending <em>now</em>
						</h2>
						<p className="section-sub">Ranked by how many readers picked each book up this week.</p>
					</div>
					<Link href="/trending">
						<a className="button button--ghost">
							Full Top 10 <ArrowRight size={16} />
						</a>
					</Link>
				</header>

				<div className={Styles.previewGrid}>
					<article className={`${Styles.number1} reveal`}>
						<span className={Styles.bigRank} aria-hidden="true">
							1
						</span>
						<div className={Styles.n1Stage}>
							<Book3D
								src={first.image}
								title={first.name}
								author={first.author}
								width={180}
								turn={-24}
								interactive
							/>
						</div>
						<div className={Styles.n1Info}>
							<p className={Styles.n1Label}>
								<TrophyIcon size={14} /> No.1 this week <Movement move={first.move} compact />
							</p>
							<Link href={`/books/${first.slug}`}>
								<a>
									<h3>{first.name}</h3>
								</a>
							</Link>
							<p className={Styles.rowAuthor}>by {first.author}</p>
							<StarRating value={first.rating} count={first.numReviews} />
							{max > 0 && <p className={Styles.n1Readers}>{formatCompact(max)} readers this week</p>}
							<button className="button" onClick={() => addToCart(first)} disabled={!inStock(first)} data-sound="none">
								<BagIcon size={16} /> {formatPrice(first.price)}
							</button>
						</div>
					</article>

					<ol className={Styles.list}>
						{rest.slice(0, 4).map((book, i) => (
							<ChartRow key={book.slug} book={book} max={max} index={i} />
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
