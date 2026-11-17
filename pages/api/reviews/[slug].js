import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import Review from '../../../models/Review';
import db from '../../../utils/db';

const round2 = (n) => Math.round(n * 100) / 100;

function summarize(reviews) {
	const distribution = [5, 4, 3, 2, 1].map((star) => ({
		star,
		count: reviews.filter((r) => r.rating === star).length,
	}));
	const count = reviews.length;
	const average = count ? round2(reviews.reduce((a, r) => a + r.rating, 0) / count) : 0;
	return { count, average, distribution };
}

const handler = async (req, res) => {
	const { slug } = req.query;
	await db.connect();

	if (req.method === 'GET') {
		const reviews = await Review.find({ productSlug: slug }).sort({ updatedAt: -1 }).limit(100).lean();
		const session = await getSession({ req });
		const mine = session?.user?.id
			? reviews.find((r) => String(r.user) === String(session.user.id)) || null
			: null;
		return res.status(200).json({
			reviews: reviews.map(({ user, ...r }) => ({ ...r, mine: mine ? String(user) === String(mine.user) : false })),
			summary: summarize(reviews),
			mine,
		});
	}

	if (req.method === 'POST') {
		const session = await getSession({ req });
		if (!session?.user?.id) {
			return res.status(401).json({ message: 'Please sign in to write a review' });
		}

		const rating = Number(req.body?.rating);
		const title = String(req.body?.title || '').trim().slice(0, 100);
		const comment = String(req.body?.comment || '').trim();
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			return res.status(422).json({ message: 'Rating must be between 1 and 5 stars' });
		}
		if (comment.length < 10 || comment.length > 1000) {
			return res.status(422).json({ message: 'Review must be between 10 and 1000 characters' });
		}

		const product = await Product.findOne({ slug });
		if (!product) {
			return res.status(404).json({ message: 'Book not found' });
		}

		const verified = Boolean(
			await Order.exists({ user: session.user.id, 'orderItems.name': product.name })
		);

		const existing = await Review.findOne({ productSlug: slug, user: session.user.id });
		const n = product.numReviews || 0;
		const total = (product.rating || 0) * n;

		if (existing) {
			// Swap the old rating for the new one in the running average
			product.rating = n ? round2((total - existing.rating + rating) / n) : rating;
			existing.set({ rating, title, comment, verified, name: session.user.name });
			await existing.save();
		} else {
			await Review.create({
				productSlug: slug,
				user: session.user.id,
				name: session.user.name || 'Reader',
				rating,
				title,
				comment,
				verified,
			});
			product.numReviews = n + 1;
			product.rating = round2((total + rating) / (n + 1));
		}
		await product.save();

		return res.status(existing ? 200 : 201).json({
			message: existing ? 'Review updated' : 'Review posted',
			rating: product.rating,
			numReviews: product.numReviews,
		});
	}

	res.setHeader('Allow', 'GET, POST');
	return res.status(405).json({ message: 'Method not allowed' });
};

export default handler;
