import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';

import CheckoutProgress from '../components/CheckoutProgress';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { useToast } from '../components/Toast';
import { playSound } from '../utils/sound';
import { formatPrice } from '../utils/catalog';
import { priceOrder } from '../utils/pricing';

import Styles from './order.module.scss';
import TableStyles from './table.module.scss';

export default function PlaceOrderScreen() {
	const { state, dispatch } = useContext(Store);
	const { cart } = state;
	const { cartItems, shippingAddress, paymentMethod } = cart;

	// Shown for review only — the server recalculates every amount from the
	// database when the order is placed (see utils/pricing.js).
	const { itemsPrice, shippingPrice, taxPrice, totalPrice } = priceOrder(cartItems);

	const router = useRouter();
	const toast = useToast();
	useEffect(() => {
		if (!paymentMethod) {
			router.push('/payment');
		}
	}, [paymentMethod, router]);

	const [loading, setLoading] = useState(false);

	const placeOrderHandler = async () => {
		try {
			setLoading(true);
			// Only which books and how many — never prices or totals.
			const { data } = await axios.post('/api/orders', {
				orderItems: cartItems.map(({ slug, quantity }) => ({ slug, quantity })),
				shippingAddress,
				paymentMethod,
			});
			setLoading(false);
			dispatch({ type: 'CART_CLEAR_ITEMS' });
			Cookies.set(
				'cart',
				JSON.stringify({
					...cart,
					cartItems: [],
				})
			);
			router.push(`/order/${data._id}?placed=1`);
		} catch (err) {
			setLoading(false);
			playSound('error');
			const outOfStock = err.response?.status === 409;
			toast({
				type: 'error',
				title: outOfStock ? 'Stock changed' : 'Order failed',
				message: err.response?.data?.message || err.message,
				action: outOfStock ? { href: '/cart', label: 'Update bag' } : undefined,
				duration: 7000,
			});
		}
	};

	return (
		<Layout title="Place Order">
			<div className="container">
				<CheckoutProgress activeStep={3} />
				<h2 className={Styles.oder_page_title}>Place Order</h2>
				{cartItems.length === 0 ? (
					<div>
						Cart is empty. <Link href="/">Go shopping</Link>
					</div>
				) : (
					<div className={Styles.oder_page}>
						<div className={Styles.oder_page_details}>
							<div className={Styles.action_block}>
								<h3>Shipping Address</h3>
								<p>
									{shippingAddress.fullName},{' '}
									{shippingAddress.address},{' '}
									{shippingAddress.city},{' '}
									{shippingAddress.postalCode},{' '}
									{shippingAddress.country}
								</p>
								<div>
									<Link href="/shipping">Edit</Link>
								</div>
							</div>
							<div className={Styles.action_block}>
								<h3>Payment Method</h3>
								<p>{paymentMethod}</p>
								<div>
									<Link href="/payment">Edit</Link>
								</div>
							</div>
							<div className={Styles.action_block}>
								<h3>Order Items</h3>
								<div className={Styles.order_table}>
									<table className={TableStyles.table}>
										<thead>
											<tr>
												<th>Item</th>
												<th>Quantity</th>
												<th>Price</th>
												<th>Subtotal</th>
											</tr>
										</thead>
										<tbody>
											{cartItems.map((item) => (
												<tr key={item._id}>
													<td>
														<Link
															href={`/books/${item.slug}`}
														>
															<a
																className={
																	Styles.product_name
																}
															>
																<img
																	src={
																		item.image
																	}
																	alt={
																		item.name
																	}
																	width={50}
																	height={50}
																/>
																<strong>
																	{item.name}
																</strong>
															</a>
														</Link>
													</td>
													<td>{item.quantity}</td>
													<td>{formatPrice(item.price)}</td>
													<td>{formatPrice(item.quantity * item.price)}</td>
												</tr>
											))}
											<tr>
												<td colSpan={4}>
													<div className="t-align-center">
														<Link href="/cart">
															Edit
														</Link>
													</div>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className={Styles.oder_page_summary}>
							<div className={Styles.action_block}>
								<h3>Order Summary</h3>
								<ul>
									<li>
										<div className={Styles.order_summary_row}>
											<div>Items ({cartItems.reduce((a, c) => a + c.quantity, 0)})</div>
											<div>{formatPrice(itemsPrice)}</div>
										</div>
									</li>
									<li>
										<div className={Styles.order_summary_row}>
											<div>Tax (15%)</div>
											<div>{formatPrice(taxPrice)}</div>
										</div>
									</li>
									<li>
										<div className={Styles.order_summary_row}>
											<div>Shipping</div>
											<div>
												{shippingPrice ? formatPrice(shippingPrice) : <span className={Styles.free}>Free</span>}
											</div>
										</div>
									</li>
									<li>
										<div className={Styles.order_summary_row}>
											<div>Total</div>
											<div>{formatPrice(totalPrice)}</div>
										</div>
									</li>
									<li>
										<button
											disabled={loading}
											onClick={placeOrderHandler}
											className={`${Styles.order_button} button button--lg`}
											data-sound="add"
										>
											{loading ? 'Placing order…' : 'Place Order'}
										</button>
									</li>
								</ul>
							</div>

							<div className={Styles.action_block}>
								<h3>What happens next</h3>
								<ol className={Styles.tracker}>
									{[
										['Confirmation', 'Your order and invoice appear instantly'],
										['Download invoice', 'Get a PDF copy from the order page'],
										['Packed & shipped', 'Your books are wrapped with care'],
										['Delivered', 'Straight to the address above'],
									].map(([label, note], i) => (
										<li key={label}>
											<span className={Styles.trackDot} aria-hidden="true">
												{i + 1}
											</span>
											<div>
												<strong>{label}</strong>
												<span>{note}</span>
											</div>
										</li>
									))}
								</ol>
							</div>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
}

PlaceOrderScreen.auth = true;
