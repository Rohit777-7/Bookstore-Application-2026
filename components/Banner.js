import Link from 'next/link';
import { useCallback, useRef } from 'react';

import Book3D from './Book3D';
import { ArrowRight, FlameIcon } from './Icons';
import Styles from './Banner.module.css';

// Hero: copy on the left, a fan of floating 3D books on the right that
// drifts with the pointer (parallax via CSS variables).
const Banner = ({ books = [], stats }) => {
	const ref = useRef(null);
	const featured = books.slice(0, 3);

	const onPointerMove = useCallback((e) => {
		if (e.pointerType !== 'mouse' || !ref.current) return;
		const r = ref.current.getBoundingClientRect();
		ref.current.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
		ref.current.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
	}, []);

	return (
		<section className={Styles.hero} ref={ref} onPointerMove={onPointerMove}>
			<div className={Styles.bg} aria-hidden="true" />
			<div className={Styles.orbs} aria-hidden="true">
				<span />
				<span />
			</div>

			<div className={`container ${Styles.inner}`}>
				<div className={Styles.copy}>
					<p className={`eyebrow ${Styles.rise}`} style={{ '--d': '0ms' }}>
						The {new Date().getFullYear()} Collection
					</p>
					<h1 className={`${Styles.title} ${Styles.rise}`} style={{ '--d': '120ms' }}>
						Find your next
						<br />
						<em>great</em> book
					</h1>
					<p className={`${Styles.lead} ${Styles.rise}`} style={{ '--d': '240ms' }}>
						Browse through a hand-picked library of timeless classics, modern
						bestsellers and life-changing ideas, delivered to your door.
					</p>
					<div className={`${Styles.ctas} ${Styles.rise}`} style={{ '--d': '360ms' }}>
						<Link href="/books">
							<a className="button button--lg">
								Find Books <ArrowRight size={18} />
							</a>
						</Link>
						<Link href="/trending">
							<a className="button button--ghost button--lg">
								<FlameIcon size={18} /> Trending now
							</a>
						</Link>
					</div>

					{stats && (
						<ul className={`${Styles.stats} ${Styles.rise}`} style={{ '--d': '480ms' }}>
							<li>
								<strong>{stats.titles}+</strong>
								<span>Titles</span>
							</li>
							<li>
								<strong>{stats.rating}★</strong>
								<span>Avg. rating</span>
							</li>
							<li>
								<strong>{stats.reviews.toLocaleString('en-IN')}</strong>
								<span>Reader reviews</span>
							</li>
						</ul>
					)}
				</div>

				{featured.length > 0 && (
					<div className={Styles.stage}>
						<div className={Styles.halo} aria-hidden="true" />
						{featured.map((book, i) => (
							<Link href={`/books/${book.slug}`} key={book.slug}>
								<a className={`${Styles.floating} ${Styles[`pos${i}`]}`} aria-label={book.name} data-sound="tap">
									<Book3D
										src={book.image}
										title={book.name}
										author={book.author}
										width={i === 1 ? 210 : 170}
										turn={i === 0 ? 28 : i === 1 ? -20 : -34}
										eager
									/>
								</a>
							</Link>
						))}
						<div className={Styles.plinth} aria-hidden="true" />
					</div>
				)}
			</div>

			<a href="#discover" className={Styles.scrollCue} aria-label="Scroll to discover" data-sound="none">
				<span />
			</a>
		</section>
	);
};

export default Banner;
