import Styles from './StarRating.module.scss';

export default function StarRating({ value = 0, count, size = 14 }) {
	const pct = Math.max(0, Math.min(100, (value / 5) * 100));
	return (
		<span
			className={Styles.rating}
			style={{ '--size': `${size}px` }}
			aria-label={`Rated ${value} out of 5${count ? ` from ${count} reviews` : ''}`}
		>
			<span className={Styles.stars} aria-hidden="true">
				<span className={Styles.base}>★★★★★</span>
				<span className={Styles.fill} style={{ width: `${pct}%` }}>
					★★★★★
				</span>
			</span>
			<span className={Styles.value} aria-hidden="true">
				{Number(value).toFixed(1)}
			</span>
			{count !== undefined && (
				<span className={Styles.count} aria-hidden="true">
					({count})
				</span>
			)}
		</span>
	);
}
