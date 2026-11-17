import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import Book3D from './Book3D';
import StarRating from './StarRating';
import { ArrowRight, BagIcon, CloseIcon, HeartIcon } from './Icons';
import useAddToCart from '../hooks/useAddToCart';
import useWishlist from '../hooks/useWishlist';
import { discountOf, formatDate, formatPrice, inStock, isComingSoon } from '../utils/catalog';
import { playSound } from '../utils/sound';
import Styles from './QuickView.module.scss';

const QuickViewContext = createContext(() => {});
export const useQuickView = () => useContext(QuickViewContext);

export function QuickViewProvider({ children }) {
	const [product, setProduct] = useState(null);
	const open = useCallback((p) => setProduct(p), []);
	const close = useCallback(() => {
		playSound('close');
		setProduct(null);
	}, []);

	return (
		<QuickViewContext.Provider value={open}>
			{children}
			{product && <QuickViewModal product={product} onClose={close} />}
		</QuickViewContext.Provider>
	);
}

function QuickViewModal({ product, onClose }) {
	const panelRef = useRef(null);
	const addToCart = useAddToCart();
	const { isWished, toggle } = useWishlist();
	const discount = discountOf(product);
	const available = inStock(product);
	const wished = isWished(product.slug);

	useEffect(() => {
		const previous = document.activeElement;
		document.body.style.overflow = 'hidden';
		panelRef.current?.focus();
		const onKey = (e) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
			previous?.focus?.();
		};
	}, [onClose]);

	return (
		<div className={Styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
			<div
				className={Styles.panel}
				role="dialog"
				aria-modal="true"
				aria-label={`Quick view: ${product.name}`}
				tabIndex={-1}
				ref={panelRef}
			>
				<button className={Styles.close} onClick={onClose} aria-label="Close quick view" data-sound="none">
					<CloseIcon />
				</button>

				<div className={Styles.stage}>
					<Book3D
						src={product.image}
						title={product.name}
						author={product.author}
						width={200}
						turn={-22}
						interactive
						eager
					/>
					<p className={Styles.hint}>Move your cursor to turn the book</p>
				</div>

				<div className={Styles.info}>
					<p className="eyebrow">{product.category}</p>
					<h2 className={Styles.title}>{product.name}</h2>
					<p className={Styles.author}>by {product.author}</p>
					<StarRating value={product.rating} count={product.numReviews} />
					<p className={Styles.description}>{product.description}</p>

					<div className={Styles.price}>
						<strong>{formatPrice(product.price)}</strong>
						{discount > 0 && (
							<>
								<s>{formatPrice(product.originalPrice)}</s>
								<span className={Styles.save}>Save {discount}%</span>
							</>
						)}
					</div>

					<div className={Styles.actions}>
						<button
							className="button"
							disabled={!available}
							data-sound="none"
							onClick={async () => {
								if (await addToCart(product)) onClose();
							}}
						>
							<BagIcon size={18} />
							{!available
								? 'Sold out'
								: isComingSoon(product)
								? `Pre-order · ships ${formatDate(product.releaseDate)}`
								: 'Add to bag'}
						</button>
						<button
							className={`button button--ghost ${wished ? Styles.wished : ''}`}
							onClick={() => toggle(product)}
							aria-pressed={wished}
							data-sound="none"
						>
							<HeartIcon filled={wished} size={18} />
							{wished ? 'Saved' : 'Wishlist'}
						</button>
					</div>

					<Link href={`/books/${product.slug}`}>
						<a className={Styles.more} onClick={onClose} data-sound="tap">
							View full details <ArrowRight size={16} />
						</a>
					</Link>
				</div>
			</div>
		</div>
	);
}
