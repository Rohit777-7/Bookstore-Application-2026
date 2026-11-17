import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import Book3D from './Book3D';
import StarRating from './StarRating';
import { ArrowRight, BagIcon, CloseIcon, DiceIcon } from './Icons';
import useAddToCart from '../hooks/useAddToCart';
import { formatPrice, inStock, isComingSoon } from '../utils/catalog';
import { cachedCatalog, loadCatalog } from '../utils/clientCatalog';
import { playSound } from '../utils/sound';
import Styles from './SurpriseMe.module.scss';

export const SURPRISE_EVENT = 'bookstore:surprise';
export const openSurprise = () => window.dispatchEvent(new Event(SURPRISE_EVENT));

const pick = (list, not) => {
	const pool = list.length > 1 ? list.filter((b) => b.slug !== not?.slug) : list;
	return pool[Math.floor(Math.random() * pool.length)];
};

// A slot-machine style "spin" through the catalogue that lands on a random book.
export default function SurpriseMe({ onClose }) {
	const [books, setBooks] = useState(() => (cachedCatalog() || []).filter((b) => inStock(b) && !isComingSoon(b)));
	const [current, setCurrent] = useState(null);
	const [spinning, setSpinning] = useState(false);
	const [spins, setSpins] = useState(0);
	const timers = useRef([]);
	const addToCart = useAddToCart();

	const clearTimers = () => {
		timers.current.forEach(clearTimeout);
		timers.current = [];
	};

	const spin = useCallback(
		(list = books) => {
			if (!list.length) return;
			clearTimers();
			setSpinning(true);
			const final = pick(list, current);
			const steps = 16;
			let elapsed = 0;
			for (let i = 0; i < steps; i++) {
				elapsed += 45 + i * i * 2.4; // ease out: each step a little slower
				const last = i === steps - 1;
				timers.current.push(
					setTimeout(() => {
						setCurrent(last ? final : pick(list));
						playSound(last ? 'add' : 'tap');
						if (last) {
							setSpinning(false);
							setSpins((n) => n + 1);
						}
					}, elapsed)
				);
			}
		},
		[books, current]
	);

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		const onKey = (e) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', onKey);
		loadCatalog().then((all) => {
			const list = all.filter((b) => inStock(b) && !isComingSoon(b));
			setBooks(list);
			spin(list);
		});
		return () => {
			clearTimers();
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
		// spin once on open
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={Styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
			<div className={Styles.panel} role="dialog" aria-modal="true" aria-label="Surprise me with a book">
				<button className={Styles.close} onClick={onClose} aria-label="Close" data-sound="close">
					<CloseIcon />
				</button>

				<p className="eyebrow">Book roulette</p>
				<h2 className={Styles.heading}>
					{spinning ? 'Shuffling the shelves…' : current ? 'Your next read is…' : 'Loading the library…'}
				</h2>

				<div className={`${Styles.stage} ${spinning ? Styles.spinning : Styles.landed}`}>
					<span className={Styles.rays} aria-hidden="true" />
					{current && (
						<div key={`${current.slug}-${spins}-${spinning}`} className={Styles.flip}>
							<Book3D
								src={current.image}
								title={current.name}
								author={current.author}
								width={170}
								turn={spinning ? 0 : -26}
								eager
							/>
						</div>
					)}
				</div>

				<div className={`${Styles.result} ${!spinning && current ? Styles.show : ''}`} aria-live="polite">
					{current && !spinning && (
						<>
							<h3>{current.name}</h3>
							<p className={Styles.author}>
								by {current.author} · {current.category}
							</p>
							<StarRating value={current.rating} count={current.numReviews} />
							<div className={Styles.actions}>
								<button className="button" onClick={() => addToCart(current)} data-sound="none">
									<BagIcon size={16} /> {formatPrice(current.price)}
								</button>
								<Link href={`/books/${current.slug}`}>
									<a className="button button--ghost" onClick={onClose}>
										View book <ArrowRight size={16} />
									</a>
								</Link>
							</div>
						</>
					)}
				</div>

				<button
					className={Styles.again}
					onClick={() => spin()}
					disabled={spinning || !books.length}
					data-sound="none"
				>
					<DiceIcon size={18} /> {spins ? 'Spin again' : 'Spin'}
				</button>
			</div>
		</div>
	);
}
