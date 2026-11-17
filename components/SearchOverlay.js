import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';

import Cover from './Cover';
import { ArrowRight, CloseIcon, SearchIcon } from './Icons';
import { formatPrice, trending } from '../utils/catalog';
import { cachedCatalog, loadCatalog } from '../utils/clientCatalog';
import Styles from './SearchOverlay.module.scss';

export default function SearchOverlay({ onClose }) {
	const router = useRouter();
	const inputRef = useRef(null);
	const [books, setBooks] = useState(cachedCatalog() || []);
	const [query, setQuery] = useState('');
	const [active, setActive] = useState(0);

	useEffect(() => {
		inputRef.current?.focus();
		document.body.style.overflow = 'hidden';
		loadCatalog().then(setBooks);
		return () => {
			document.body.style.overflow = '';
		};
	}, []);

	const results = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return trending(books, 5);
		return books
			.filter((b) =>
				[b.name, b.author, b.category].some((f) => f?.toLowerCase().includes(q))
			)
			.slice(0, 7);
	}, [books, query]);

	useEffect(() => setActive(0), [query]);

	const go = (href) => {
		onClose();
		router.push(href);
	};

	const onKeyDown = (e) => {
		if (e.key === 'Escape') onClose();
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActive((i) => Math.min(i + 1, results.length - 1));
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActive((i) => Math.max(i - 1, 0));
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			if (results[active] && query.trim()) go(`/books/${results[active].slug}`);
			else if (query.trim()) go(`/books?q=${encodeURIComponent(query.trim())}`);
			else if (results[active]) go(`/books/${results[active].slug}`);
		}
	};

	return (
		<div className={Styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
			<div className={Styles.panel} role="dialog" aria-modal="true" aria-label="Search books">
				<div className={Styles.field}>
					<SearchIcon size={22} />
					<input
						ref={inputRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={onKeyDown}
						placeholder="Search by title, author or genre…"
						aria-label="Search books"
						role="combobox"
						aria-expanded="true"
						aria-controls="search-results"
						aria-activedescendant={results[active] ? `sr-${results[active].slug}` : undefined}
					/>
					<kbd className={Styles.kbd}>Esc</kbd>
					<button className={Styles.close} onClick={onClose} aria-label="Close search" data-sound="close">
						<CloseIcon />
					</button>
				</div>

				<p className={Styles.label}>{query.trim() ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Trending searches'}</p>

				<ul className={Styles.results} id="search-results" role="listbox">
					{results.map((b, i) => (
						<li key={b.slug} id={`sr-${b.slug}`} role="option" aria-selected={i === active}>
							<Link href={`/books/${b.slug}`}>
								<a
									className={`${Styles.result} ${i === active ? Styles.active : ''}`}
									onMouseEnter={() => setActive(i)}
									onClick={onClose}
									data-sound="tap"
								>
									<span className={Styles.thumb}>
										<Cover src={b.image} title={b.name} author={b.author} />
									</span>
									<span className={Styles.meta}>
										<strong>{b.name}</strong>
										<span>
											{b.author} · {b.category}
										</span>
									</span>
									<span className={Styles.price}>{formatPrice(b.price)}</span>
								</a>
							</Link>
						</li>
					))}
					{query.trim() && results.length === 0 && (
						<li className={Styles.empty}>No books match “{query}”. Try another title or author.</li>
					)}
				</ul>

				{query.trim() && (
					<button
						className={Styles.all}
						onClick={() => go(`/books?q=${encodeURIComponent(query.trim())}`)}
					>
						See all results for “{query.trim()}” <ArrowRight size={16} />
					</button>
				)}
			</div>
		</div>
	);
}
