import { useEffect, useState } from 'react';

// Live countdown to an ISO date / Date. Returns null until mounted so the
// server render and first client render match (no hydration warnings).
export default function useCountdown(target) {
	const [left, setLeft] = useState(null);

	useEffect(() => {
		if (!target) return undefined; // nothing to count down to — no timer
		const end = new Date(target).getTime();
		const tick = () => setLeft(Math.max(0, end - Date.now()));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [target]);

	if (left === null) return null;
	const s = Math.floor(left / 1000);
	return {
		days: Math.floor(s / 86400),
		hours: Math.floor((s % 86400) / 3600),
		minutes: Math.floor((s % 3600) / 60),
		seconds: s % 60,
		done: left === 0,
	};
}
