import { useCallback, useRef } from 'react';
import Cover from './Cover';
import Styles from './Book3D.module.scss';

// A CSS 3D hardcover: front cover, spine, page block and back board.
// `width` drives everything; height is 1.5× and depth scales with it.
// `interactive` lets the reader spin the book with the pointer.
export default function Book3D({
	src,
	title,
	author,
	width = 160,
	depth,
	turn = -26,
	interactive = false,
	eager = false,
	className = '',
}) {
	const ref = useRef(null);
	const d = depth ?? Math.round(width * 0.17);

	const onPointerMove = useCallback(
		(e) => {
			if (!interactive || !ref.current) return;
			const r = ref.current.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width - 0.5;
			const y = (e.clientY - r.top) / r.height - 0.5;
			ref.current.style.setProperty('--turn', `${turn + x * 50}deg`);
			ref.current.style.setProperty('--tilt', `${-y * 18}deg`);
		},
		[interactive, turn]
	);

	const onPointerLeave = useCallback(() => {
		if (!interactive || !ref.current) return;
		ref.current.style.removeProperty('--turn');
		ref.current.style.removeProperty('--tilt');
	}, [interactive]);

	return (
		<div
			ref={ref}
			className={`${Styles.scene} ${interactive ? Styles.interactive : ''} ${className}`}
			style={{
				'--w': `${width}px`,
				'--h': `${Math.round(width * 1.5)}px`,
				'--d': `${d}px`,
				'--turn-base': `${turn}deg`,
			}}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
		>
			<div className={Styles.book}>
				<div className={Styles.front}>
					<Cover src={src} title={title} author={author} eager={eager} />
					<span className={Styles.gloss} aria-hidden="true" />
				</div>
				<span className={Styles.spine} aria-hidden="true" />
				<span className={Styles.pages} aria-hidden="true" />
				<span className={Styles.top} aria-hidden="true" />
				<span className={Styles.back} aria-hidden="true" />
			</div>
			<span className={Styles.shadow} aria-hidden="true" />
		</div>
	);
}
