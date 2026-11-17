import Link from 'next/link';
import { useEffect, useState } from 'react';

import Cover from './Cover';
import { BagIcon } from './Icons';
import { useToast } from './Toast';
import useAddToCart from '../hooks/useAddToCart';
import { formatPrice, inStock, isComingSoon } from '../utils/catalog';
import { playSound } from '../utils/sound';
import Styles from './BoughtTogether.module.scss';

// "Frequently bought together": this book + two companions, add all in one click.
export default function BoughtTogether({ book, related }) {
	const companions = related.filter((b) => inStock(b) && !isComingSoon(b)).slice(0, 2);
	const items = [book, ...companions];
	const [selected, setSelected] = useState(() => new Set(items.map((b) => b.slug)));
	const [adding, setAdding] = useState(false);
	const addToCart = useAddToCart();
	const toast = useToast();

	const key = items.map((b) => b.slug).join('|');
	useEffect(() => {
		setSelected(new Set(key.split('|')));
	}, [key]);

	if (companions.length === 0 || !inStock(book)) return null;

	const chosen = items.filter((b) => selected.has(b.slug));
	const total = chosen.reduce((a, b) => a + b.price, 0);

	const toggle = (slug) =>
		setSelected((s) => {
			const next = new Set(s);
			next.has(slug) ? next.delete(slug) : next.add(slug);
			return next;
		});

	const addAll = async () => {
		setAdding(true);
		let added = 0;
		for (const b of chosen) {
			if (await addToCart(b, { quiet: true })) added += 1;
		}
		setAdding(false);
		if (added) {
			playSound('add');
			toast({
				title: `${added} book${added > 1 ? 's' : ''} added to your bag`,
				message: chosen.map((b) => b.name).join(' · '),
				action: { href: '/cart', label: 'View bag' },
			});
		}
	};

	return (
		<section className={`${Styles.box} reveal`}>
			<h2>Frequently bought together</h2>
			<div className={Styles.row}>
				<div className={Styles.covers}>
					{items.map((b, i) => (
						<div key={b.slug} className={Styles.coverWrap}>
							{i > 0 && (
								<span className={Styles.plus} aria-hidden="true">
									+
								</span>
							)}
							<Link href={`/books/${b.slug}`}>
								<a
									className={`${Styles.cover} ${selected.has(b.slug) ? '' : Styles.off}`}
									tabIndex={-1}
									aria-hidden="true"
								>
									<Cover src={b.image} title={b.name} author={b.author} />
								</a>
							</Link>
						</div>
					))}
				</div>

				<div className={Styles.side}>
					<ul className={Styles.list}>
						{items.map((b, i) => (
							<li key={b.slug}>
								<label className={Styles.item}>
									<input
										type="checkbox"
										checked={selected.has(b.slug)}
										onChange={() => toggle(b.slug)}
										data-sound="toggle"
									/>
									<span className={Styles.check} aria-hidden="true" />
									<span className={Styles.name}>
										{i === 0 ? <strong>This book: </strong> : null}
										{b.name}
									</span>
									<span className={Styles.price}>{formatPrice(b.price)}</span>
								</label>
							</li>
						))}
					</ul>
					<div className={Styles.total}>
						<span>
							Total for {chosen.length} {chosen.length === 1 ? 'book' : 'books'}
						</span>
						<strong>{formatPrice(total)}</strong>
					</div>
					<button className="button" onClick={addAll} disabled={!chosen.length || adding} data-sound="none">
						<BagIcon size={16} /> {adding ? 'Adding…' : `Add ${chosen.length} to bag`}
					</button>
				</div>
			</div>
		</section>
	);
}
