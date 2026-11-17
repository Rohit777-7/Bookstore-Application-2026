import { useCallback, useContext } from 'react';
import { Store } from '../utils/Store';
import { useToast } from '../components/Toast';
import { playSound } from '../utils/sound';

export default function useWishlist() {
	const { state, dispatch } = useContext(Store);
	const toast = useToast();
	const { wishlist } = state;

	const isWished = useCallback(
		(slug) => wishlist.some((p) => p.slug === slug),
		[wishlist]
	);

	const toggle = useCallback(
		(product) => {
			const wished = wishlist.some((p) => p.slug === product.slug);
			dispatch({ type: 'WISHLIST_TOGGLE', payload: product });
			playSound(wished ? 'unwish' : 'wish');
			toast({
				type: wished ? 'info' : 'success',
				title: wished ? 'Removed from wishlist' : 'Saved to wishlist',
				message: product.name,
				image: product.image,
				action: wished ? undefined : { href: '/wishlist', label: 'View' },
			});
		},
		[wishlist, dispatch, toast]
	);

	return { wishlist, isWished, toggle };
}
