import { useCallback, useRef } from 'react';

// Pointer-driven 3D tilt. Writes CSS custom properties on the element:
//   --rx / --ry : rotation in degrees
//   --mx / --my : pointer position in % (for a moving glare highlight)
// The actual transform lives in CSS so it can be disabled for reduced motion.
export default function useTilt(max = 8) {
	const ref = useRef(null);

	const onPointerMove = useCallback(
		(e) => {
			if (e.pointerType !== 'mouse') return;
			const el = ref.current;
			if (!el) return;
			const r = el.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width;
			const y = (e.clientY - r.top) / r.height;
			el.style.setProperty('--ry', `${((x - 0.5) * max * 2).toFixed(2)}deg`);
			el.style.setProperty('--rx', `${((0.5 - y) * max * 2).toFixed(2)}deg`);
			el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
			el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
		},
		[max]
	);

	const onPointerLeave = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		el.style.setProperty('--rx', '0deg');
		el.style.setProperty('--ry', '0deg');
	}, []);

	return { ref, onPointerMove, onPointerLeave };
}
