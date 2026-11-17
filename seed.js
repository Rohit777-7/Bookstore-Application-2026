import mongoose from 'mongoose';
import dotenv from 'dotenv';
import db from './utils/db.js';
import data from './utils/data.js';
import Product from './models/Product.js';
import Review from './models/Review.js';

dotenv.config();

const seedData = async () => {
	try {
		await db.connect();
		await Product.deleteMany({}); // Clear existing products
		await Product.insertMany(data.products);

		// Reviews are stored by slug and kept across reseeds — fold them back
		// into each book's rating and review count.
		const stats = await Review.aggregate([
			{ $group: { _id: '$productSlug', sum: { $sum: '$rating' }, count: { $sum: 1 } } },
		]);
		for (const { _id: slug, sum, count } of stats) {
			const product = await Product.findOne({ slug });
			if (!product) continue;
			const total = product.rating * product.numReviews + sum;
			product.numReviews += count;
			product.rating = Math.round((total / product.numReviews) * 100) / 100;
			await product.save();
		}

		console.log(
			`Data seeded successfully: ${data.products.length} books` +
				(stats.length ? `, ${stats.length} reviewed titles re-applied` : '')
		);
		await db.disconnect();
		await mongoose.disconnect();
		process.exit(0);
	} catch (error) {
		console.error('Error seeding data:', error);
		process.exit(1);
	}
};

seedData();
