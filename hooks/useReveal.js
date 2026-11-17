import { useEffect, useRef } from 'react';

// Fades `.reveal` elements in as they scroll into view.
// Runs after every render so newly mounted items (filters, rails) are picked up.
export default function useReveal() {
	const observer = useRef(null);

	useEffect(() => {
		if (typeof IntersectionObserver === 'undefined') return;
		document.documentElement.classList.add('reveal-ready');
		observer.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.current?.unobserve(entry.target);
					}
				});
			},
			{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
		);
		return () => observer.current?.disconnect();
	}, []);

	useEffect(() => {
		const io = observer.current;
		if (!io) return;
		document
			.querySelectorAll('.reveal:not(.is-visible)')
			.forEach((el) => io.observe(el));
	});
}
