import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import Header from './Header';
import useReveal from '../hooks/useReveal';

// Session-only: the site always opens in dark mode on a new visit (see _document.js)
const THEME_KEY = 'bs-theme';

export default function Layout({ title, children }) {
	const [theme, setTheme] = useState('dark');
	useReveal();

	// _document sets data-theme before first paint; sync React state with it.
	useEffect(() => {
		setTheme(document.documentElement.dataset.theme || 'dark');
	}, []);

	const toggleTheme = () => {
		const next = theme === 'dark' ? 'light' : 'dark';
		const root = document.documentElement;
		root.classList.add('theme-transition');
		root.dataset.theme = next;
		setTheme(next);
		try {
			sessionStorage.setItem(THEME_KEY, next);
		} catch {
			/* storage unavailable */
		}
		setTimeout(() => root.classList.remove('theme-transition'), 600);
	};

	return (
		<>
			<Head>
				<title>{title ? `${title} | Book Store` : 'Book Store — Curated Editions'}</title>
				<meta
					name="description"
					content="A curated online bookstore of timeless classics, modern bestsellers and life-changing ideas."
				/>
			</Head>
			<div className="main-wrapper">
				<a href="#main" className="skip-link">
					Skip to content
				</a>
				<Header theme={theme} onToggleTheme={toggleTheme} />
				<main id="main" className="main">
					{children}
				</main>
				<Footer />
			</div>
		</>
	);
}

function Footer() {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer__grid">
					<div className="footer__brand">
						<p className="footer__logo">
							Book <em>Store</em>
						</p>
						<p className="footer__tagline">
							A small, carefully chosen library of stories worth keeping — from timeless
							classics to tomorrow&apos;s favourites.
						</p>
					</div>
					<div>
						<p className="footer__heading">Shop</p>
						<ul>
							<li>
								<Link href="/books">
									<a>All books</a>
								</Link>
							</li>
							<li>
								<Link href="/trending">
									<a>Trending</a>
								</Link>
							</li>
							<li>
								<Link href="/new-arrivals">
									<a>New arrivals</a>
								</Link>
							</li>
							<li>
								<Link href="/books?sort=rating">
									<a>Top rated</a>
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<p className="footer__heading">Your account</p>
						<ul>
							<li>
								<Link href="/wishlist">
									<a>Wishlist</a>
								</Link>
							</li>
							<li>
								<Link href="/cart">
									<a>Shopping bag</a>
								</Link>
							</li>
							<li>
								<Link href="/order-history">
									<a>Orders</a>
								</Link>
							</li>
							<li>
								<Link href="/profile">
									<a>Profile</a>
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<p className="footer__heading">Shortcuts</p>
						<ul className="footer__kbd">
							<li>
								<kbd>Ctrl</kbd> + <kbd>K</kbd> Search
							</li>
							<li>
								<kbd>Esc</kbd> Close dialogs
							</li>
						</ul>
					</div>
				</div>
				<div className="footer__bottom">
					<span>© {new Date().getFullYear()} Book Store</span>
					<span>Built with Reactjs and MongoDB by Rohit Yadav</span>
				</div>
			</div>
		</footer>
	);
}
