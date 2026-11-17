import mongoose from 'mongoose';

// Reviews are keyed by product *slug* (not _id) so they survive a reseed,
// which recreates every product with a new _id.
const Schema = new mongoose.Schema(
	{
		productSlug: { type: String, required: true, index: true },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		name: { type: String, required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		title: { type: String, maxlength: 100, default: '' },
		comment: { type: String, required: true, maxlength: 1000 },
		// true when the reviewer has an order containing this book
		verified: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
);

// One review per reader per book (re-submitting updates it)
Schema.index({ productSlug: 1, user: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model('Review', Schema);

export default Review;
