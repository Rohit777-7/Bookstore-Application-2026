import Link from 'next/link';
import { useState } from 'react';

import Book3D from './Book3D';
import StarRating from './StarRating';
import { useQuickView } from './QuickView';
import { BagIcon, EyeIcon, HeartIcon } from './Icons';
import useTilt from '../hooks/useTilt';
import useAddToCart from '../hooks/useAddToCart';
import useWishlist from '../hooks/useWishlist';
import {
	discountOf,
	formatDate,
	formatPrice,
	hasTag,
	inStock,
	isComingSoon,
	isNewArrival,
} from '../utils/catalog';
import Styles from './ProductItem.module.scss';

// `note` is an optional context line (chart movement, arrival date, release date…)
export default function ProductItem({ product, index = 0, rank, note }) {
	const tilt = useTilt(7);
	const addToCart = useAddToCart();
	const { isWished, toggle } = useWishlist();
	const openQuickView = useQuickView();
	const [adding, setAdding] = useState(false);

	const discount = discountOf(product);
	const available = inStock(product);
	const preorder = isComingSoon(product);
	const wished = isWished(product.slug);
	const href = `/books/${product.slug}`;

	const onAdd = async () => {
		setAdding(true);
		await addToCart(product);
		setAdding(false);
	};

	return (
		<div className={`reveal ${Styles.wrap}`} style={{ '--i': index % 8 }}>
			<article
				ref={tilt.ref}
				onPointerMove={tilt.onPointerMove}
				onPointerLeave={tilt.onPointerLeave}
				className={Styles.card}
			>
				<div className={Styles.media}>
					{rank && (
						<span className={Styles.rank} aria-label={`Rank ${rank}`}>
							{rank}
						</span>
					)}
					<div className={Styles.badges}>
						{discount > 0 && (
							<span className={`${Styles.badge} ${Styles.sale}`}>
								−{discount}%
							</span>
						)}
						{hasTag(product, 'bestseller') && (
							<span className={Styles.badge}>Bestseller</span>
						)}
						{preorder ? (
							<span className={`${Styles.badge} ${Styles.pre}`}>
								Pre-order · {formatDate(product.releaseDate)}
							</span>
						) : (
							isNewArrival(product) && (
								<span className={`${Styles.badge} ${Styles.new}`}>New</span>
							)
						)}
					</div>

					<button
						type="button"
						className={`${Styles.wish} ${wished ? Styles.wished : ''}`}
						onClick={() => toggle(product)}
						aria-pressed={wished}
						aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
						data-sound="none"
					>
						<HeartIcon filled={wished} size={18} />
					</button>

					<Link href={href}>
						<a className={Styles.cover} tabIndex={-1} aria-hidden="true">
							<Book3D
								src={product.image}
								title={product.name}
								author={product.author}
								width={138}
							/>
						</a>
					</Link>

					<button
						type="button"
						className={Styles.quick}
						onClick={() => openQuickView(product)}
						data-sound="open"
					>
						<EyeIcon size={16} /> Quick view
					</button>
					<span className={Styles.glare} aria-hidden="true" />
				</div>

				<div className={Styles.body}>
					{note && <div className={Styles.note}>{note}</div>}
					<p className={Styles.category}>{product.category}</p>
					<h3 className={Styles.title}>
						<Link href={href}>
							<a>{product.name}</a>
						</Link>
					</h3>
					<p className={Styles.author}>by {product.author}</p>
					<StarRating value={product.rating} count={product.numReviews} size={13} />

					<div className={Styles.footer}>
						<p className={Styles.price}>
							<span>{formatPrice(product.price)}</span>
							{discount > 0 && <s>{formatPrice(product.originalPrice)}</s>}
						</p>
						<button
							type="button"
							onClick={onAdd}
							className={`${Styles.add} button`}
							disabled={!available || adding}
							data-sound="none"
							aria-label={
								available
									? `${preorder ? 'Pre-order' : 'Add'} ${product.name} to cart`
									: 'Out of stock'
							}
						>
							{available ? (
								<>
									<BagIcon size={16} />
									<span>{adding ? 'Adding…' : preorder ? 'Pre-order' : 'Add'}</span>
								</>
							) : (
								<span>Sold out</span>
							)}
						</button>
					</div>
				</div>
			</article>
		</div>
	);
}
