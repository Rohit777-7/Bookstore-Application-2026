import { useMemo, useState } from 'react';

import ProductItem from './ProductItem';
import { DiceIcon } from './Icons';
import { openSurprise } from './SurpriseMe';
import { MOODS, isComingSoon } from '../utils/catalog';
import Styles from './MoodPicker.module.scss';

const PER_PAGE = 4;

// "What are you in the mood for?" — pick a mood, get four matching books.
export default function MoodPicker({ products }) {
	const moods = useMemo(
		() => MOODS.filter((m) => products.some((p) => m.categories.includes(p.category))),
		[products]
	);
	const [mood, setMood] = useState(moods[0]?.key);
	const [page, setPage] = useState(0);

	const matches = useMemo(() => {
		const m = moods.find((x) => x.key === mood);
		if (!m) return [];
		return products
			.filter((p) => m.categories.includes(p.category) && !isComingSoon(p))
			.sort((a, b) => b.rating * 1000 + (b.weeklySales || 0) / 10 - (a.rating * 1000 + (a.weeklySales || 0) / 10));
	}, [products, moods, mood]);

	if (!moods.length) return null;

	const pages = Math.max(1, Math.ceil(matches.length / PER_PAGE));
	const shown = matches.slice((page % pages) * PER_PAGE, (page % pages) * PER_PAGE + PER_PAGE);

	return (
		<section className={Styles.section}>
			<div className="container">
				<div className="section-head center reveal">
					<p className="eyebrow">Find your next read</p>
					<h2 className="section-title">
						What are you in the <em>mood</em> for?
					</h2>
				</div>

				<div className={`${Styles.moods} reveal`} role="radiogroup" aria-label="Reading mood">
					{moods.map((m) => (
						<button
							key={m.key}
							role="radio"
							aria-checked={mood === m.key}
							className={`${Styles.mood} ${mood === m.key ? Styles.active : ''}`}
							onClick={() => {
								setMood(m.key);
								setPage(0);
							}}
						>
							<span className={Styles.emoji} aria-hidden="true">
								{m.emoji}
							</span>
							{m.label}
						</button>
					))}
				</div>

				<div className="book_listing book_listing--fill">
					{shown.map((book, i) => (
						<ProductItem key={`${mood}-${page}-${book.slug}`} product={book} index={i} />
					))}
				</div>

				<div className={Styles.actions}>
					{pages > 1 && (
						<button className="button button--ghost" onClick={() => setPage((p) => p + 1)} data-sound="open">
							Show me different picks
						</button>
					)}
					<button className={Styles.surprise} onClick={openSurprise} data-sound="open">
						<DiceIcon size={18} /> Can&apos;t decide? Surprise me
					</button>
				</div>
			</div>
		</section>
	);
}
