import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import StarRating from './StarRating';
import { useToast } from './Toast';
import { CheckIcon, QuoteIcon } from './Icons';
import { formatDate } from '../utils/catalog';
import { playSound } from '../utils/sound';
import Styles from './Reviews.module.scss';

const LABELS = ['', 'Not for me', 'It was okay', 'Liked it', 'Really liked it', 'Loved it!'];

function StarPicker({ value, onChange }) {
	const [hover, setHover] = useState(0);
	const shown = hover || value;
	return (
		<div className={Styles.picker}>
			<div className={Styles.stars} role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
				{[1, 2, 3, 4, 5].map((n) => (
					<button
						key={n}
						type="button"
						role="radio"
						aria-checked={value === n}
						aria-label={`${n} star${n > 1 ? 's' : ''}`}
						className={`${Styles.star} ${n <= shown ? Styles.on : ''}`}
						onMouseEnter={() => setHover(n)}
						onClick={() => onChange(n)}
						data-sound="toggle"
					>
						★
					</button>
				))}
			</div>
			<span className={Styles.pickerLabel}>{LABELS[shown] || 'Tap to rate'}</span>
		</div>
	);
}

export default function Reviews({ book, onRatingChange }) {
	const { data: session, status } = useSession();
	const toast = useToast();
	const [data, setData] = useState(null);
	const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);

	const load = useCallback(async () => {
		try {
			const res = await fetch(`/api/reviews/${book.slug}`);
			if (!res.ok) throw new Error();
			const json = await res.json();
			setData(json);
			if (json.mine) {
				setForm({ rating: json.mine.rating, title: json.mine.title || '', comment: json.mine.comment });
			}
		} catch {
			setData({ reviews: [], summary: { count: 0, average: 0, distribution: [] }, mine: null });
		}
	}, [book.slug]);

	useEffect(() => {
		setData(null);
		setEditing(false);
		setForm({ rating: 0, title: '', comment: '' });
		load();
	}, [load]);

	const submit = async (e) => {
		e.preventDefault();
		if (!form.rating) {
			playSound('error');
			toast({ type: 'error', title: 'Pick a rating', message: 'Choose between 1 and 5 stars.' });
			return;
		}
		setSaving(true);
		try {
			const res = await fetch(`/api/reviews/${book.slug}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.message);
			playSound('add');
			toast({ title: json.message, message: 'Thanks for sharing your thoughts!' });
			onRatingChange?.(json.rating, json.numReviews);
			setEditing(false);
			await load();
		} catch (err) {
			playSound('error');
			toast({ type: 'error', title: 'Could not save review', message: err.message || 'Please try again.' });
		} finally {
			setSaving(false);
		}
	};

	const summary = data?.summary;
	const showForm = session?.user && (!data?.mine || editing);

	return (
		<section className={Styles.section} id="reviews">
			<div className={`${Styles.head} reveal`}>
				<p className="eyebrow">Reader reviews</p>
				<h2 className="section-title">
					What readers <em>say</em>
				</h2>
			</div>

			<div className={Styles.layout}>
				<aside className={`${Styles.summary} reveal`}>
					<strong className={Styles.big}>{Number(book.rating).toFixed(1)}</strong>
					<StarRating value={book.rating} size={18} />
					<p className={Styles.based}>Based on {book.numReviews.toLocaleString('en-IN')} ratings</p>

					{summary?.count > 0 && (
						<div className={Styles.dist}>
							<p className={Styles.distTitle}>
								{summary.count} written review{summary.count === 1 ? '' : 's'} on Book Store
							</p>
							{summary.distribution.map(({ star, count }) => (
								<div key={star} className={Styles.distRow}>
									<span>{star}★</span>
									<span className={Styles.bar}>
										<span style={{ width: `${(count / summary.count) * 100}%` }} />
									</span>
									<span>{count}</span>
								</div>
							))}
						</div>
					)}

					{status !== 'loading' && !session?.user && (
						<Link href={`/login?redirect=/books/${book.slug}%23reviews`}>
							<a className="button button--ghost">Sign in to write a review</a>
						</Link>
					)}
					{session?.user && data?.mine && !editing && (
						<button className="button button--ghost" onClick={() => setEditing(true)}>
							Edit your review
						</button>
					)}
				</aside>

				<div className={Styles.main}>
					{showForm && (
						<form className={`${Styles.form} reveal`} onSubmit={submit}>
							<h3>{data?.mine ? 'Update your review' : 'Write a review'}</h3>
							<StarPicker value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
							<label className="sr-only" htmlFor="review-title">
								Title
							</label>
							<input
								id="review-title"
								placeholder="Sum it up in a few words (optional)"
								maxLength={100}
								value={form.title}
								onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
							/>
							<label className="sr-only" htmlFor="review-comment">
								Review
							</label>
							<textarea
								id="review-comment"
								placeholder="What did you love? Who would you recommend it to?"
								rows={4}
								minLength={10}
								maxLength={1000}
								required
								value={form.comment}
								onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
							/>
							<div className={Styles.formFoot}>
								<span>{form.comment.length}/1000</span>
								<div>
									{editing && (
										<button type="button" className={Styles.cancel} onClick={() => setEditing(false)}>
											Cancel
										</button>
									)}
									<button className="button" type="submit" disabled={saving} data-sound="none">
										{saving ? 'Saving…' : data?.mine ? 'Update review' : 'Post review'}
									</button>
								</div>
							</div>
						</form>
					)}

					{data === null ? (
						<div className={Styles.skeleton} aria-label="Loading reviews" />
					) : data.reviews.length === 0 ? (
						<div className={Styles.empty}>
							<QuoteIcon size={28} />
							<p>No written reviews yet. Be the first to share what you thought.</p>
						</div>
					) : (
						<ul className={Styles.list}>
							{data.reviews.map((r, i) => (
								<li key={r._id} className={`${Styles.review} reveal`} style={{ '--i': i % 6 }}>
									<div className={Styles.reviewHead}>
										<span className={Styles.avatar} aria-hidden="true">
											{r.name?.[0]?.toUpperCase() || 'R'}
										</span>
										<div>
											<strong>
												{r.name}
												{r.mine && <span className={Styles.you}>You</span>}
											</strong>
											<span className={Styles.meta}>
												{formatDate(r.updatedAt, { day: 'numeric', month: 'short', year: 'numeric' })}
												{r.verified && (
													<span className={Styles.verified}>
														<CheckIcon size={12} /> Verified purchase
													</span>
												)}
											</span>
										</div>
										<StarRating value={r.rating} size={13} />
									</div>
									{r.title && <h4>{r.title}</h4>}
									<p>{r.comment}</p>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</section>
	);
}
