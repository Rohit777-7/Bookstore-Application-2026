import dynamic from 'next/dynamic';
import Link from 'next/link';

import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import ShelfEnd from '../components/ShelfEnd';
import { HeartIcon } from '../components/Icons';
import useWishlist from '../hooks/useWishlist';

// Wishlist lives in localStorage, so render client-side only.
function Wishlist() {
	const { wishlist } = useWishlist();

	return (
		<Layout title="Wishlist">
			<section className="page-hero">
				<div className="container">
					<p className="eyebrow">Saved for later</p>
					<h1>
						Your <em>wishlist</em>
					</h1>
					<p>
						{wishlist.length
							? `${wishlist.length} book${wishlist.length === 1 ? '' : 's'} you have fallen for.`
							: 'Tap the heart on any book to keep it here.'}
					</p>
				</div>
			</section>
			<div className="container">
				{wishlist.length === 0 ? (
					<div className="empty-state">
						<span className="empty-state__icon">
							<HeartIcon size={28} />
						</span>
						<h3>Nothing saved yet</h3>
						<p>Browse the library and save the books you love.</p>
						<Link href="/books">
							<a className="button">Explore books</a>
						</Link>
					</div>
				) : (
					<div className="book_listing">
						{wishlist.map((product, i) => (
							<ProductItem product={product} key={product.slug} index={i} />
						))}
						<ShelfEnd books={wishlist} title="Room for one more?" />
					</div>
				)}
			</div>
		</Layout>
	);
}

export default dynamic(() => Promise.resolve(Wishlist), { ssr: false });
