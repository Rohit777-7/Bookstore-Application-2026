import Link from 'next/link';
import { useRef } from 'react';
import ProductItem from './ProductItem';
import { ArrowLeft, ArrowRight } from './Icons';
import Styles from './BookRail.module.scss';

// Horizontal, snap-scrolling shelf of books with arrow controls.
export default function BookRail({ eyebrow, title, books, href, ranked = false, icon, noteFor, id }) {
	const track = useRef(null);
	if (!books || books.length === 0) return null;

	const scroll = (dir) => {
		const el = track.current;
		if (!el) return;
		el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
	};

	return (
		<section className={Styles.rail} id={id}>
			<div className="container">
				<header className={`${Styles.head} reveal`}>
					<div>
						{eyebrow && (
							<p className="eyebrow">
								{icon} {eyebrow}
							</p>
						)}
						<h2 className="section-title">{title}</h2>
					</div>
					<div className={Styles.controls}>
						{href && (
							<Link href={href}>
								<a className="link-arrow" data-sound="tap">
									View all <ArrowRight size={16} />
								</a>
							</Link>
						)}
						<button className={Styles.arrow} onClick={() => scroll(-1)} aria-label="Scroll left">
							<ArrowLeft size={18} />
						</button>
						<button className={Styles.arrow} onClick={() => scroll(1)} aria-label="Scroll right">
							<ArrowRight size={18} />
						</button>
					</div>
				</header>
			</div>
			<div className={Styles.track} ref={track}>
				{books.map((book, i) => (
					<div className={Styles.slot} key={book.slug}>
						<ProductItem
							product={book}
							index={i}
							rank={ranked ? i + 1 : undefined}
							note={noteFor ? noteFor(book, i) : undefined}
						/>
					</div>
				))}
			</div>
		</section>
	);
}
