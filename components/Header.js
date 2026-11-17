import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';

import { Store } from '../utils/Store';
import { isSoundOn, onSoundChange, playSound, setSoundOn } from '../utils/sound';
import { DropdownMenu, MenuButton, Menu, MenuItem } from './DropdownMenu';
import SearchOverlay from './SearchOverlay';
import SurpriseMe, { SURPRISE_EVENT } from './SurpriseMe';
import {
	BagIcon,
	CloseIcon,
	DiceIcon,
	HeartIcon,
	MenuIcon,
	MoonIcon,
	SearchIcon,
	SoundOffIcon,
	SoundOnIcon,
	SunIcon,
} from './Icons';
import Styles from './Header.module.scss';

const NAV = [
	{ href: '/', label: 'Home' },
	{ href: '/books', label: 'Shop' },
	{ href: '/trending', label: 'Trending' },
	{ href: '/new-arrivals', label: 'New Arrivals' },
];

export default function Header({ theme, onToggleTheme }) {
	const { status, data: session } = useSession();
	const router = useRouter();
	const { state } = useContext(Store);
	const [cartCount, setCartCount] = useState(0);
	const [wishCount, setWishCount] = useState(0);
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [surpriseOpen, setSurpriseOpen] = useState(false);
	const [sound, setSound] = useState(true);
	const [bump, setBump] = useState(false);

	// Counts are set after mount so SSR (empty cookie/localStorage) never mismatches.
	const prevCart = useRef(null);
	useEffect(() => {
		const count = state.cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);
		let timer;
		if (prevCart.current !== null && count > prevCart.current) {
			setBump(true);
			timer = setTimeout(() => setBump(false), 600);
		}
		prevCart.current = count;
		setCartCount(count);
		return () => clearTimeout(timer);
	}, [state.cart.cartItems]);

	useEffect(() => setWishCount(state.wishlist.length), [state.wishlist]);

	useEffect(() => {
		setSound(isSoundOn());
		return onSoundChange(setSound);
	}, []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// Ctrl/Cmd + K opens search
	useEffect(() => {
		const onKey = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				playSound('open');
				setSearchOpen(true);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	useEffect(() => setMenuOpen(false), [router.asPath]);

	// "Surprise me" can be opened from anywhere via openSurprise()
	useEffect(() => {
		const open = () => setSurpriseOpen(true);
		window.addEventListener(SURPRISE_EVENT, open);
		return () => window.removeEventListener(SURPRISE_EVENT, open);
	}, []);

	const isActive = (href) =>
		href === '/books' ? router.pathname.startsWith('/books') : router.pathname === href;

	const toggleSound = () => {
		const next = !sound;
		setSoundOn(next);
		if (next) playSound('toggle');
	};

	return (
		<>
			<header className={`${Styles.header} ${scrolled ? Styles.scrolled : ''}`}>
				<div className={`container ${Styles.inner}`}>
					<Link href="/">
						<a className={Styles.logo} aria-label="Book Store home" data-sound="tap">
							<span className={Styles.mark} aria-hidden="true">
								<svg viewBox="0 0 32 32" width="30" height="30">
									<path d="M16 7c-3-2.4-7-3-11-2v19c4-1 8-.4 11 2 3-2.4 7-3 11-2V5c-4-1-8-.4-11 2Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
									<path d="M16 7v19" stroke="currentColor" strokeWidth="1.4" />
								</svg>
							</span>
							<span className={Styles.wordmark}>
								<span className={Styles.wordmarkTitle}>
									Book <em>Store</em>
								</span>
								<small>Curated editions</small>
							</span>
						</a>
					</Link>

					<nav className={`${Styles.nav} ${menuOpen ? Styles.navOpen : ''}`} aria-label="Main menu">
						<ul>
							{NAV.map((item) => (
								<li key={item.href}>
									<Link href={item.href}>
										<a className={isActive(item.href) ? Styles.active : ''} data-sound="tap">
											{item.label}
										</a>
									</Link>
								</li>
							))}
							<li className={Styles.mobileOnly}>
								<button type="button" onClick={() => setSurpriseOpen(true)} data-sound="open">
									Surprise me
								</button>
							</li>
							<li className={Styles.mobileOnly}>
								{session?.user ? (
									<Link href="/profile">
										<a data-sound="tap">My account</a>
									</Link>
								) : (
									<Link href="/login">
										<a data-sound="tap">Sign in</a>
									</Link>
								)}
							</li>
						</ul>
					</nav>

					<div className={Styles.actions}>
						<button
							className={Styles.iconBtn}
							onClick={() => setSearchOpen(true)}
							aria-label="Search (Ctrl+K)"
							title="Search  (Ctrl + K)"
							data-sound="open"
						>
							<SearchIcon />
						</button>
						<button
							className={`${Styles.iconBtn} ${Styles.dice}`}
							onClick={() => setSurpriseOpen(true)}
							aria-label="Surprise me with a random book"
							title="Surprise me"
							data-sound="open"
						>
							<DiceIcon />
						</button>
						<button
							className={`${Styles.iconBtn} ${Styles.soundBtn}`}
							onClick={toggleSound}
							aria-label={sound ? 'Mute interface sounds' : 'Turn on interface sounds'}
							aria-pressed={sound}
							title={sound ? 'Sound on' : 'Sound off'}
							data-sound="none"
						>
							{sound ? <SoundOnIcon /> : <SoundOffIcon />}
						</button>
						<button
							className={Styles.iconBtn}
							onClick={onToggleTheme}
							aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
							title="Toggle theme"
							data-sound="toggle"
						>
							<span className={Styles.themeIcon} key={theme}>
								{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
							</span>
						</button>
						<Link href="/wishlist">
							<a className={`${Styles.iconBtn} ${router.pathname === '/wishlist' ? Styles.iconActive : ''}`} aria-label={`Wishlist, ${wishCount} items`} data-sound="tap">
								<HeartIcon />
								{wishCount > 0 && <span className={Styles.count}>{wishCount}</span>}
							</a>
						</Link>
						<Link href="/cart">
							<a className={`${Styles.iconBtn} ${router.pathname === '/cart' ? Styles.iconActive : ''} ${bump ? Styles.bump : ''}`} aria-label={`Cart, ${cartCount} items`} data-sound="tap">
								<BagIcon />
								{cartCount > 0 && <span className={Styles.count}>{cartCount}</span>}
							</a>
						</Link>

						<div className={Styles.account}>
							{status === 'loading' ? (
								<span className={Styles.loading} aria-label="Loading" />
							) : session?.user ? (
								<DropdownMenu>
									<MenuButton className={Styles.userBtn}>
										<span className={Styles.avatar} aria-hidden="true">
											{session.user.name?.[0]?.toUpperCase()}
										</span>
										<span className={Styles.userName}>{session.user.name}</span>
									</MenuButton>
									<Menu>
										<MenuItem>
											<Link href="/profile">
												<a>Profile</a>
											</Link>
										</MenuItem>
										<MenuItem>
											<Link href="/order-history">
												<a>Orders</a>
											</Link>
										</MenuItem>
										<MenuItem>
											<Link href="/wishlist">
												<a>Wishlist</a>
											</Link>
										</MenuItem>
										<MenuItem>
											<button onClick={() => signOut({ callbackUrl: '/' })}>Logout</button>
										</MenuItem>
									</Menu>
								</DropdownMenu>
							) : (
								<Link href="/login">
									<a className={`button button--sm ${Styles.login}`}>Sign in</a>
								</Link>
							)}
						</div>

						<button
							className={`${Styles.iconBtn} ${Styles.burger}`}
							onClick={() => setMenuOpen((o) => !o)}
							aria-label={menuOpen ? 'Close menu' : 'Open menu'}
							aria-expanded={menuOpen}
						>
							{menuOpen ? <CloseIcon /> : <MenuIcon />}
						</button>
					</div>
				</div>
			</header>
			{searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
			{surpriseOpen && <SurpriseMe onClose={() => setSurpriseOpen(false)} />}
		</>
	);
}
