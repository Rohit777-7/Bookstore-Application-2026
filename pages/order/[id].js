import { useEffect, useReducer } from 'react';
import Link from 'next/link';
/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';

import axios from 'axios';

import Layout from '../../components/Layout';
import InvoiceButton from '../../components/InvoiceButton';
import { invoiceNumber } from '../../utils/invoice';
import { formatPrice } from '../../utils/catalog';

const fmtDate = (d) =>
	d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

import Styles from '../order.module.scss';
import TableStyles from '../table.module.scss';

function reducer(state, action) {
	switch (action.type) {
		case 'FETCH_REQUEST':
			return { ...state, loading: true, error: '' };
		case 'FETCH_SUCCESS':
			return {
				...state,
				loading: false,
				order: action.payload,
				error: '',
			};
		case 'FETCH_FAIL':
			return { ...state, loading: false, error: action.payload };
		default:
			return state;
	}
}
function OrderScreen() {
	// order/:id
	const { query } = useRouter();
	const orderId = query.id;
	const justPlaced = query.placed === '1';

	const [{ loading, error, order }, dispatch] = useReducer(reducer, {
		loading: true,
		order: {},
		error: '',
	});
	useEffect(() => {
		const fetchOrder = async () => {
			try {
				dispatch({ type: 'FETCH_REQUEST' });
				const { data } = await axios.get(`/api/orders/${orderId}`);
				dispatch({ type: 'FETCH_SUCCESS', payload: data });
			} catch (err) {
				dispatch({ type: 'FETCH_FAIL', payload: err.response?.data?.message || err.message });
			}
		};
		if (orderId && (!order._id || order._id !== orderId)) {
			fetchOrder();
		}
	}, [order, orderId]);
	const {
		shippingAddress,
		paymentMethod,
		orderItems,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
		isPaid,
		paidAt,
		isDelivered,
		deliveredAt,
	} = order;

	let oderTitle;
	if (orderItems) {
		oderTitle = `"${orderItems[0].name}" ${
			orderItems.length > 1 ? `and ${orderItems.length - 1}  other` : ''
		}`;
	} else {
		oderTitle = orderId;
	}

	return (
		<Layout title={`Your order of ${oderTitle}`}>
			<div className="container">
				{justPlaced && !loading && !error && (
					<div className={Styles.placed}>
						<span className={Styles.placedIcon} aria-hidden="true">
							✓
						</span>
						<div>
							<strong>Thank you! Your order has been placed.</strong>
							<p>Your invoice is ready. Download a PDF copy for your records.</p>
						</div>
						<InvoiceButton order={order} className={Styles.placedBtn} />
					</div>
				)}

				<div className={Styles.order_head}>
					<div>
						{order._id && <p className="eyebrow">Invoice {invoiceNumber(order)}</p>}
						<h2 className={Styles.oder_page_title}>{`Your order of ${oderTitle}`}</h2>
					</div>
					{!loading && !error && order._id && <InvoiceButton order={order} />}
				</div>
				{loading ? (
					<div>Loading...</div>
				) : error ? (
					<div className="alert-error">{error}</div>
				) : (
					<>
					<section className={`${Styles.action_block} ${Styles.stepper_card}`} aria-label="Order status">
						<ol className={Styles.stepper}>
							{[
								{ label: 'Order placed', done: true, note: fmtDate(order.createdAt) },
								{
									label: 'Payment',
									done: isPaid,
									note: isPaid ? `Paid on ${fmtDate(paidAt)}` : 'Awaiting payment',
								},
								{
									label: 'Packed & shipped',
									done: isDelivered,
									note: isDelivered ? 'Shipped' : isPaid ? 'Preparing your books' : 'After payment',
								},
								{
									label: 'Delivered',
									done: isDelivered,
									note: isDelivered ? fmtDate(deliveredAt) : 'Pending',
								},
							].map((step, i, steps) => {
								const current = !step.done && (i === 0 || steps[i - 1].done);
								return (
									<li
										key={step.label}
										className={`${step.done ? Styles.done : ''} ${current ? Styles.current : ''}`}
										aria-current={current ? 'step' : undefined}
									>
										<span className={Styles.trackDot} aria-hidden="true">
											{step.done ? '✓' : i + 1}
										</span>
										<strong>{step.label}</strong>
										<span className={Styles.stepNote}>{step.note}</span>
									</li>
								);
							})}
						</ol>
					</section>

					<div className={Styles.oder_page}>
						<div className={Styles.oder_page_details}>
							<div className={Styles.info_grid}>
								<div className={Styles.action_block}>
									<h3>Shipping Address</h3>
									<p className={Styles.address}>
										<strong>{shippingAddress.fullName}</strong>
										<br />
										{shippingAddress.address}
										<br />
										{shippingAddress.city} {shippingAddress.postalCode}
										<br />
										{shippingAddress.country}
									</p>
									{isDelivered ? (
										<div className={Styles.status_success}>Delivered on {fmtDate(deliveredAt)}</div>
									) : (
										<div className={Styles.status_pending}>Not delivered yet</div>
									)}
								</div>

								<div className={Styles.action_block}>
									<h3>Payment Method</h3>
									<p className={Styles.address}>
										<strong>{paymentMethod}</strong>
									</p>
									{isPaid ? (
										<div className={Styles.status_success}>Paid on {fmtDate(paidAt)}</div>
									) : (
										<div className={Styles.status_error}>Not paid</div>
									)}
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
											{orderItems.map((item) => {
												const product = (
													<>
														<img src={item.image} alt={item.name} width={44} height={64} />
														<strong>{item.name}</strong>
													</>
												);
												return (
													<tr key={item._id}>
														<td>
															{item.slug ? (
																<Link href={`/books/${item.slug}`}>
																	<a className={Styles.product_name}>{product}</a>
																</Link>
															) : (
																<span className={Styles.product_name}>{product}</span>
															)}
														</td>
														<td>{item.quantity}</td>
														<td>{formatPrice(item.price)}</td>
														<td>{formatPrice(item.quantity * item.price)}</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<aside className={Styles.oder_page_summary}>
							<div className={`${Styles.action_block} ${Styles.summary_card}`}>
								<h3>Order Summary</h3>
								<ul>
									<li>
										<div className={Styles.order_summary_row}>
											<div>Items ({orderItems.reduce((a, i) => a + i.quantity, 0)})</div>
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
											<div>{shippingPrice ? formatPrice(shippingPrice) : <span className={Styles.free}>Free</span>}</div>
										</div>
									</li>
									<li>
										<div className={Styles.order_summary_row}>
											<div>Total</div>
											<div>{formatPrice(totalPrice)}</div>
										</div>
									</li>
								</ul>
							</div>

							<div className={`${Styles.action_block} ${Styles.invoice_card}`}>
								<span className={Styles.invoice_icon} aria-hidden="true">
									PDF
								</span>
								<div>
									<strong>Invoice {invoiceNumber(order)}</strong>
									<span>A4 PDF · ready to download or print</span>
								</div>
								<InvoiceButton order={order} />
							</div>
						</aside>
					</div>
					</>
				)}
			</div>
		</Layout>
	);
}

OrderScreen.auth = true;
export default OrderScreen;
