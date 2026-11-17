import Link from 'next/link';

import Cover from './Cover';
import { DiceIcon, FlameIcon } from './Icons';
import { openSurprise } from './SurpriseMe';
import Styles from './ShelfEnd.module.scss';

// Last item of a book grid. It spans from its slot to the end of the row
// (grid-column: auto / -1), so it fills whatever space the final row leaves —
// one empty slot → a card, three empty slots → a wide banner.
export default function ShelfEnd({ books = [], title = 'Still looking for the one?' }) {
	const fan = books.slice(0, 3);

	return (
		<aside className={`${Styles.end} reveal`} aria-label="More ways to find a book">
			<div className={Styles.inner}>
				{fan.length > 0 && (
					<div className={Styles.fan} aria-hidden="true">
						{fan.map((b, i) => (
							<span key={b.slug} className={Styles.fanCover} style={{ '--i': i }}>
								<Cover src={b.image} title={b.name} author={b.author} />
							</span>
						))}
					</div>
				)}
				<div className={Styles.copy}>
					<p className={Styles.eyebrow}>End of the shelf</p>
					<h3>{title}</h3>
					<p className={Styles.text}>
						Let us pick a book for you, or see what everyone&apos;s reading this week.
					</p>
					<div className={Styles.actions}>
						<button className="button" onClick={openSurprise} data-sound="open">
							<DiceIcon size={16} /> Surprise me
						</button>
						<Link href="/trending">
							<a className="button button--ghost">
								<FlameIcon size={16} /> Trending
							</a>
						</Link>
					</div>
				</div>
			</div>
		</aside>
	);
}
