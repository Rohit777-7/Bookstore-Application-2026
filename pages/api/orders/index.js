import { getServerSession } from '../../../utils/auth';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import db from '../../../utils/db';
import {
	PAYMENT_METHODS,
	normalizeRequestedItems,
	priceOrder,
} from '../../../utils/pricing';

// Stock may be stored as a number (15) or, in older data, a string ("15").
// This expression reads either form as a number inside MongoDB.
const STOCK = { $convert: { input: '$countInStock', to: 'double', onError: 0, onNull: 0 } };

// Atomically take `qty` copies — only succeeds if enough are in stock right now,
// so two shoppers can never both buy the last copy.
async function takeStock(productId, qty) {
	const result = await Product.updateOne(
		{ _id: productId, $expr: { $gte: [STOCK, qty] } },
		[{ $set: { countInStock: { $subtract: [STOCK, qty] } } }],
		{ timestamps: false }
	);
	return result.modifiedCount === 1;
}

async function returnStock(productId, qty) {
	await Product.updateOne(
		{ _id: productId },
		[{ $set: { countInStock: { $add: [STOCK, qty] } } }],
		{ timestamps: false }
	);
}

const ADDRESS_FIELDS = ['fullName', 'address', 'city', 'postalCode', 'country'];

function cleanAddress(input) {
	const out = {};
	for (const field of ADDRESS_FIELDS) {
		const value = typeof input?.[field] === 'string' ? input[field].trim().slice(0, 200) : '';
		if (!value) return null;
		out[field] = value;
	}
	return out;
}

const handler = async (req, res) => {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		return res.status(405).json({ message: 'Method not allowed' });
	}

	const session = await getServerSession(req, res);
	if (!session?.user?.id) {
		return res.status(401).json({ message: 'signin required' });
	}

	// 1. Validate the request. Only book slugs + quantities are trusted;
	//    any prices or totals sent by the browser are ignored.
	let wanted;
	try {
		wanted = normalizeRequestedItems(req.body?.orderItems);
	} catch (err) {
		return res.status(err.status || 422).json({ message: err.message });
	}
	const { paymentMethod } = req.body || {};
	if (!PAYMENT_METHODS.includes(paymentMethod)) {
		return res.status(422).json({ message: 'Please choose a valid payment method' });
	}
	const shippingAddress = cleanAddress(req.body?.shippingAddress);
	if (!shippingAddress) {
		return res.status(422).json({ message: 'Please complete your shipping address' });
	}

	await db.connect();

	// 2. Look up the real books and prices.
	const products = await Product.find({ slug: { $in: [...wanted.keys()] } }).lean();
	const bySlug = new Map(products.map((p) => [p.slug, p]));

	const missing = [...wanted.keys()].filter((slug) => !bySlug.has(slug));
	if (missing.length) {
		return res.status(409).json({
			message: 'Some books in your bag are no longer available. Please remove them and try again.',
			unavailable: missing,
		});
	}

	// Friendly up-front stock check (the atomic update below is the real guard)
	const short = [...wanted]
		.map(([slug, quantity]) => ({ product: bySlug.get(slug), quantity }))
		.filter(({ product, quantity }) => Number(product.countInStock) < quantity);
	if (short.length) {
		const { product } = short[0];
		const left = Math.max(0, Number(product.countInStock) || 0);
		return res.status(409).json({
			message: left
				? `Only ${left} ${left === 1 ? 'copy' : 'copies'} of "${product.name}" left. Please update your bag.`
				: `"${product.name}" is out of stock. Please remove it from your bag.`,
			outOfStock: short.map(({ product: p }) => ({ slug: p.slug, available: left })),
		});
	}

	const lines = [...wanted].map(([slug, quantity]) => {
		const p = bySlug.get(slug);
		return { productId: p._id, name: p.name, slug, image: p.image, price: p.price, quantity };
	});
	const totals = priceOrder(lines);

	// 3. Reserve stock, item by item. If anything fails, put back what we took.
	const taken = [];
	const rollback = () => Promise.all(taken.map((l) => returnStock(l.productId, l.quantity)));

	for (const line of lines) {
		if (await takeStock(line.productId, line.quantity)) {
			taken.push(line);
		} else {
			await rollback();
			return res.status(409).json({
				message: `Sorry, "${line.name}" just sold out. Please update your bag and try again.`,
			});
		}
	}

	// 4. Save the order with server-calculated amounts.
	try {
		const order = await Order.create({
			user: session.user.id,
			orderItems: lines.map(({ name, slug, image, price, quantity }) => ({ name, slug, image, price, quantity })),
			shippingAddress,
			paymentMethod,
			...totals,
		});
		return res.status(201).json(order);
	} catch (err) {
		await rollback();
		console.error('Order creation failed:', err);
		return res.status(500).json({ message: 'Could not place your order. You have not been charged.' });
	}
};

export default handler;
