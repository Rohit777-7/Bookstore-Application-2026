// Minimal stroke icon set (24×24, currentColor).
const Svg = ({ children, size = 20, strokeWidth = 1.6, ...props }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={size}
		height={size}
		fill="none"
		stroke="currentColor"
		strokeWidth={strokeWidth}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
		{...props}
	>
		{children}
	</svg>
);

export const SearchIcon = (p) => (
	<Svg {...p}>
		<circle cx="11" cy="11" r="7" />
		<path d="m20 20-3.5-3.5" />
	</Svg>
);

export const HeartIcon = ({ filled, ...p }) => (
	<Svg {...p} fill={filled ? 'currentColor' : 'none'}>
		<path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4Z" />
	</Svg>
);

export const BagIcon = (p) => (
	<Svg {...p}>
		<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
		<path d="M9 10V7a3 3 0 0 1 6 0v3" />
	</Svg>
);

export const SunIcon = (p) => (
	<Svg {...p}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
	</Svg>
);

export const MoonIcon = (p) => (
	<Svg {...p}>
		<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
	</Svg>
);

export const SoundOnIcon = (p) => (
	<Svg {...p}>
		<path d="M4 10v4h3.5L12 18V6L7.5 10H4Z" />
		<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
	</Svg>
);

export const SoundOffIcon = (p) => (
	<Svg {...p}>
		<path d="M4 10v4h3.5L12 18V6L7.5 10H4Z" />
		<path d="m16 10 4 4M20 10l-4 4" />
	</Svg>
);

export const MenuIcon = (p) => (
	<Svg {...p}>
		<path d="M4 7h16M4 12h16M4 17h10" />
	</Svg>
);

export const CloseIcon = (p) => (
	<Svg {...p}>
		<path d="M6 6l12 12M18 6 6 18" />
	</Svg>
);

export const EyeIcon = (p) => (
	<Svg {...p}>
		<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
		<circle cx="12" cy="12" r="3" />
	</Svg>
);

export const ArrowRight = (p) => (
	<Svg {...p}>
		<path d="M5 12h14M13 6l6 6-6 6" />
	</Svg>
);

export const ArrowLeft = (p) => (
	<Svg {...p}>
		<path d="M19 12H5M11 6l-6 6 6 6" />
	</Svg>
);

export const ShareIcon = (p) => (
	<Svg {...p}>
		<circle cx="18" cy="5" r="2.5" />
		<circle cx="6" cy="12" r="2.5" />
		<circle cx="18" cy="19" r="2.5" />
		<path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
	</Svg>
);

export const TruckIcon = (p) => (
	<Svg {...p}>
		<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
		<circle cx="7" cy="18" r="1.8" />
		<circle cx="17.5" cy="18" r="1.8" />
	</Svg>
);

export const ShieldIcon = (p) => (
	<Svg {...p}>
		<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
		<path d="m9 12 2 2 4-4" />
	</Svg>
);

export const SparkleIcon = (p) => (
	<Svg {...p}>
		<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
	</Svg>
);

export const BookIcon = (p) => (
	<Svg {...p}>
		<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
		<path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
	</Svg>
);

export const TrashIcon = (p) => (
	<Svg {...p}>
		<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
	</Svg>
);

export const FlameIcon = (p) => (
	<Svg {...p}>
		<path d="M12 22c4 0 7-2.7 7-6.8 0-3.7-2.6-6.2-4.3-8.2-.4 2-1.5 3.3-2.7 3.8.3-3.3-1.3-6.3-4-7.8.3 3-1.7 5.2-3 7.2A8 8 0 0 0 5 15.2C5 19.3 8 22 12 22Z" />
	</Svg>
);

export const CheckIcon = (p) => (
	<Svg {...p}>
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	</Svg>
);

export const AlertIcon = (p) => (
	<Svg {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 8v5M12 16.5v.01" />
	</Svg>
);

export const DiceIcon = (p) => (
	<Svg {...p}>
		<rect x="3.5" y="3.5" width="17" height="17" rx="4" />
		<circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" />
		<circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" />
		<circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" />
		<circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" />
		<circle cx="12" cy="12" r="1.1" fill="currentColor" />
	</Svg>
);

export const TrendUpIcon = (p) => (
	<Svg {...p}>
		<path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
	</Svg>
);

export const ClockIcon = (p) => (
	<Svg {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3 2" />
	</Svg>
);

export const CalendarIcon = (p) => (
	<Svg {...p}>
		<rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
		<path d="M3.5 10h17M8 3v4M16 3v4" />
	</Svg>
);

export const TrophyIcon = (p) => (
	<Svg {...p}>
		<path d="M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3M8 21h8M9 21v-4h6v4" />
	</Svg>
);

export const QuoteIcon = (p) => (
	<Svg {...p}>
		<path d="M9 7H5.5A1.5 1.5 0 0 0 4 8.5V12h5V7ZM9 12c0 3-1.5 5-4 5.5M20 7h-3.5A1.5 1.5 0 0 0 15 8.5V12h5V7ZM20 12c0 3-1.5 5-4 5.5" />
	</Svg>
);
