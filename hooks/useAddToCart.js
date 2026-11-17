import { useCallback, useContext } from 'react';
import { Store } from '../utils/Store';
import { useToast } from '../components/Toast';
import { playSound } from '../utils/sound';
import { formatDate, isComingSoon } from '../utils/catalog';

// One place for "add to cart" so every button behaves the same:
// live stock check → cart update → chime + toast.
export default function useAddToCart() {
	const { state, dispatch } = useContext(Store);
	const toast = useToast();

	return useCallback(
		async (product, { quantity, quiet = false } = {}) => {
			const inCart = state.cart.cartItems.find(
				(item) => item.slug === product.slug
			);
			const nextQty = quantity ?? (inCart ? inCart.quantity + 1 : 1);

			let book = null;
			try {
				const res = await fetch(`/api/product/${product._id}`);
				if (res.ok) book = (await res.json()).book;
			} catch {
				/* network error handled below */
			}

			if (!book) {
				playSound('error');
				toast({
					type: 'error',
					title: 'Unavailable',
					message: `${product.name} is no longer in our catalogue.`,
				});
				return false;
			}

			if (Number(book.countInStock) < Number(nextQty)) {
				playSound('error');
				toast({
					type: 'error',
					title: 'Out of stock',
					message: `Sorry, only ${book.countInStock} of “${product.name}” left.`,
				});
				return false;
			}

			dispatch({
				type: 'CART_ADD_ITEM',
				payload: { ...product, countInStock: book.countInStock, quantity: nextQty },
			});

			if (!quiet) {
				playSound('add');
				const pre = isComingSoon(product);
				toast({
					title: pre ? 'Pre-ordered' : 'Added to your bag',
					message: pre
						? `${product.name} · ships ${formatDate(product.releaseDate)}`
						: product.name,
					image: product.image,
					action: { href: '/cart', label: 'View bag' },
				});
			}
			return true;
		},
		[state.cart.cartItems, dispatch, toast]
	);
}
