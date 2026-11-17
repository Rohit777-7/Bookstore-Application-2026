import Link from 'next/link';
import Layout from '../components/Layout';
import Book3D from '../components/Book3D';

export default function NoRouteFound() {
	return (
		<Layout title="Page not found">
			<div className="container page t-align-center">
				<div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 40px' }}>
					<Book3D title="Chapter 404: The Missing Page" author="Book Store" width={170} turn={-30} interactive />
				</div>
				<p className="eyebrow" style={{ justifyContent: 'center' }}>
					Lost between the pages
				</p>
				<h2 style={{ fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 500, margin: '14px 0' }}>404</h2>
				<p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
					This page seems to have been torn out of the book.
				</p>
				<Link href="/">
					<a className="button">Back to the homepage</a>
				</Link>
			</div>
		</Layout>
	);
}
