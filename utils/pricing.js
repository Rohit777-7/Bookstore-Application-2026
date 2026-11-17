// Single source of truth for order pricing — used by the checkout page (display)
// and by /api/orders (the amounts that actually get saved).

export const TAX_RATE = 0.15;
export const FREE_SHIPPING_OVER = 200; // items total must be > this for free shipping
export const SHIPPING_FEE = 15;
export const MAX_QTY_PER_ITEM = 50;
export const PAYMENT_METHODS = ['Stripe', 'CashOnDelivery'];

export const round2 = (n) => Math.round(n * 100 + Number.EPSILON) / 100;

/** lines: [{ price, quantity }] → { itemsPrice, shippingPrice, taxPrice, totalPrice } */
export function priceOrder(lines) {
	const itemsPrice = round2(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
	const shippingPrice = itemsPrice > FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
	const taxPrice = round2(itemsPrice * TAX_RATE);
	const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
	return { itemsPrice, shippingPrice, taxPrice, totalPrice };
}

/**
 * Validates what the browser asked for and reduces it to { slug → quantity }.
 * Prices, names and images sent by the browser are ignored on purpose.
 * Throws an Error with `.status` for invalid input.
 */
export function normalizeRequestedItems(orderItems) {
	const fail = (message) => Object.assign(new Error(message), { status: 422 });

	if (!Array.isArray(orderItems) || orderItems.length === 0) throw fail('Your bag is empty');
	if (orderItems.length > 100) throw fail('Too many items in one order');

	const wanted = new Map();
	for (const item of orderItems) {
		const slug = typeof item?.slug === 'string' ? item.slug.trim() : '';
		const quantity = Number(item?.quantity);
		if (!slug) throw fail('Each item must identify a book');
		if (!Number.isInteger(quantity) || quantity < 1) throw fail(`Invalid quantity for "${slug}"`);
		wanted.set(slug, (wanted.get(slug) || 0) + quantity); // merge duplicates
	}
	for (const [slug, quantity] of wanted) {
		if (quantity > MAX_QTY_PER_ITEM) throw fail(`You can order at most ${MAX_QTY_PER_ITEM} copies of "${slug}"`);
	}
	return wanted;
}
