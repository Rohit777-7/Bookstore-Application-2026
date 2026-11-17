/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import Styles from './Cover.module.scss';

// Deterministic hue from the title, so fallback covers stay consistent.
const hueOf = (text = '') =>
	[...text].reduce((acc, ch) => (acc + ch.charCodeAt(0) * 7) % 360, 0);

// Book cover image with a typographic fallback when the image is missing
// or fails to load (e.g. a cover not available from Open Library).
export default function Cover({ src, title, author, className = '', eager = false }) {
	const [failed, setFailed] = useState(!src);
	const imgRef = useRef(null);

	useEffect(() => {
		setFailed(!src);
	}, [src]);

	// The image may have failed before React hydrated and attached onError.
	useEffect(() => {
		const img = imgRef.current;
		if (img && img.complete && img.naturalWidth < 10) setFailed(true);
	}, [src]);

	if (failed) {
		return (
			<div
				className={`${Styles.fallback} ${className}`}
				style={{ '--hue': hueOf(title) }}
				role="img"
				aria-label={title}
			>
				<span className={Styles.ornament} aria-hidden="true">
					✦
				</span>
				<strong>{title}</strong>
				{author && <span className={Styles.author}>{author}</span>}
			</div>
		);
	}

	return (
		<img
			ref={imgRef}
			className={`${Styles.img} ${className}`}
			src={src}
			alt={title}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			draggable="false"
			onError={() => setFailed(true)}
			onLoad={(e) => {
				if (e.currentTarget.naturalWidth < 10) setFailed(true);
			}}
		/>
	);
}
