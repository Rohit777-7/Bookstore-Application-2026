import { useContext } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { Store } from '../utils/Store';
import Styles from './cart.module.scss';

import Layout from '../components/Layout';
import Cover from '../components/Cover';
import { ArrowRight, BagIcon, ShieldIcon, TrashIcon, TruckIcon } from '../components/Icons';
import useAddToCart from '../hooks/useAddToCart';
import { formatDate, formatPrice, isComingSoon } from '../utils/catalog';
import { playSound } from '../utils/sound';

import { FREE_SHIPPING_OVER as FREE_SHIPPING_AT } from '../utils/pricing';

const Cart = () => {
	const router = useRouter();
	const { state, dispatch } = useContext(Store);
	const addToCart = useAddToCart();
	const {
		cart: { cartItems },
	} = state;

	const removeProduct = (slug) => {
		playSound('unwish');
		dispatch({
			type: 'CART_REMOVE_ITEM',
			payload: slug,
		});
	};

	const cartUpdateHandler = (item, quantity) => addToCart(item, { quantity, quiet: true });

	const TotalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
	const TotalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
	const freeShipProgress = Math.min(100, (TotalPrice / FREE_SHIPPING_AT) * 100);

	return (
		<Layout title="Shopping bag">
			<div className="container page">
				<div className={Styles.cart_page}>
					<header className={Styles.head}>
						<p className="eyebrow">Your selection</p>
						<h1>
							Shopping <em>bag</em>
						</h1>
					</header>

					{cartItems.length == 0 ? (
						<div className="empty-state">
							<span className="empty-state__icon">
								<BagIcon size={28} />
							</span>
							<h3>Your bag is empty</h3>
							<p>Great stories are waiting. Let&apos;s find your next one.</p>
							<Link href="/books">
								<a className="button">Go shopping</a>
							</Link>
						</div>
					) : (
						<div className={Styles.cart_page_inner}>
							<ul className={Styles.items}>
								{cartItems.map((item, i) => (
									<li key={item.slug} className={`${Styles.item} reveal`} style={{ '--i': i }}>
										<Link href={`/books/${item.slug}`}>
											<a className={Styles.thumb} tabIndex={-1} aria-hidden="true">
												<Cover src={item.image} title={item.name} author={item.author} />
											</a>
										</Link>
										<div className={Styles.info}>
											<Link href={`/books/${item.slug}`}>
												<a className={Styles.product_name}>{item.name}</a>
											</Link>
											{item.author && <p className={Styles.author}>by {item.author}</p>}
											<p className={Styles.unit}>{formatPrice(item.price)} each</p>
											{isComingSoon(item) && (
												<p className={Styles.pre}>
													Pre-order · ships {formatDate(item.releaseDate, { day: 'numeric', month: 'long' })}
												</p>
											)}
										</div>
										<div className={Styles.qty} aria-label={`Quantity for ${item.name}`}>
											<button
												disabled={item.quantity === 1}
												onClick={() => cartUpdateHandler(item, item.quantity - 1)}
												aria-label="Decrease quantity"
											>
												−
											</button>
											<span className={Styles.cart_number} key={item.quantity}>
												{item.quantity}
											</span>
											<button
												disabled={Number(item.countInStock) <= item.quantity}
												onClick={() => cartUpdateHandler(item, item.quantity + 1)}
												aria-label="Increase quantity"
											>
												+
											</button>
										</div>
										<p className={Styles.line}>{formatPrice(item.price * item.quantity)}</p>
										<button
											className={Styles.remove_product}
											onClick={() => removeProduct(item.slug)}
											aria-label={`Remove ${item.name}`}
											data-sound="none"
										>
											<TrashIcon size={18} />
										</button>
									</li>
								))}
							</ul>

							<aside className={Styles.cart_action_block}>
								<h2>Order summary</h2>

								<div className={Styles.ship}>
									<p>
										{TotalPrice > FREE_SHIPPING_AT ? (
											<>
												<TruckIcon size={16} /> You&apos;ve unlocked <strong>free shipping</strong>
											</>
										) : (
											<>
												Add <strong>{formatPrice(FREE_SHIPPING_AT - TotalPrice + 1)}</strong> more for free
												shipping
											</>
										)}
									</p>
									<span className={Styles.shipBar}>
										<span style={{ width: `${freeShipProgress}%` }} />
									</span>
								</div>

								<dl>
									<div>
										<dt>Items</dt>
										<dd>{TotalQuantity}</dd>
									</div>
									<div className={Styles.total}>
										<dt>Subtotal</dt>
										<dd>{formatPrice(TotalPrice)}</dd>
									</div>
								</dl>
								<p className={Styles.note}>Taxes and shipping are calculated at checkout.</p>
								<button
									className={`${Styles.checkout_button} button button--lg`}
									onClick={() => router.push('/login?redirect=/shipping')}
									data-sound="open"
								>
									Checkout <ArrowRight size={18} />
								</button>
								<p className={Styles.secure}>
									<ShieldIcon size={16} /> Secure checkout
								</p>
							</aside>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default dynamic(() => Promise.resolve(Cart), { ssr: false });
