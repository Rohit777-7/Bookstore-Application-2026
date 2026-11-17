import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
	{
		name: { type: String, require: true },
		author: { type: String, require: true },
		description: { type: String, require: true },
		image: { type: String, require: true },
		slug: { type: String, require: true, unique: true },
		category: { type: String, require: true },
		price: { type: Number, require: true },
		// Optional "was" price, used to show a discount badge
		originalPrice: { type: Number },
		rating: { type: Number, require: true, default: 0 },
		numReviews: { type: Number, require: true, default: 0 },
		// Number so stock can be decremented atomically when orders are placed
		// (older data stored it as a string; /api/orders handles both).
		countInStock: { type: Number, require: true, default: 0, min: 0 },
		// Merchandising tags: 'trending' | 'bestseller' | 'new' | 'editors-pick'
		tags: { type: [String], default: [] },
		pages: { type: Number },
		publishedYear: { type: Number },
		isbn: { type: String },
		// Weekly chart: readers this week vs last week (0 last week = new entry)
		weeklySales: { type: Number, default: 0 },
		lastWeekSales: { type: Number, default: 0 },
		// When the title landed in the store (drives "New arrivals")
		arrivedAt: { type: Date },
		// Future date = coming soon / pre-order
		releaseDate: { type: Date },
	},
	{
		timestamps: true,
	}
);

const Product = mongoose.models.Product || mongoose.model('Product', Schema);

export default Product;
