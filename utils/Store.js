import { createContext, useEffect, useReducer } from 'react';
import Cookies from 'js-cookie';

export const Store = createContext();

const WISHLIST_KEY = 'bs-wishlist';

const initialState = {
	cart: Cookies.get('cart')
		? JSON.parse(Cookies.get('cart'))
		: { cartItems: [], shippingAddress: {}, paymentMethod: '' },
	wishlist: [],
};

function saveWishlist(list) {
	try {
		localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
	} catch {
		/* storage unavailable */
	}
}

function reducer(state, action) {
	switch (action.type) {
		case 'CART_ADD_ITEM': {
			const newItem = action.payload;
			const existItem = state.cart.cartItems.find(
				(item) => item.slug === newItem.slug
			);
			const cartItems = existItem
				? state.cart.cartItems.map((item) =>
						item.name === existItem.name ? newItem : item
				  )
				: [...state.cart.cartItems, newItem];
			Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
			return { ...state, cart: { ...state.cart, cartItems } };
		}
		case 'CART_REMOVE_ITEM': {
			const item = action.payload;
			const cartItems = state.cart.cartItems.filter(
				(product) => product.slug !== item
			);
			Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
			return { ...state, cart: { ...state.cart, cartItems } };
		}
		case 'CART_CLEAR_ITEMS': {
			return { ...state, cart: { ...state.cart, cartItems: [] } };
		}
		case 'SAVE_SHIPPING_ADDRESS':
			return {
				...state,
				cart: {
					...state.cart,
					shippingAddress: {
						...state.cart.shippingAddress,
						...action.payload,
					},
				},
			};
		case 'SAVE_PAYMENT_METHOD':
			return {
				...state,
				cart: {
					...state.cart,
					paymentMethod: action.payload,
				},
			};
		case 'WISHLIST_SET':
			return { ...state, wishlist: action.payload };
		case 'WISHLIST_TOGGLE': {
			const product = action.payload;
			const exists = state.wishlist.some((p) => p.slug === product.slug);
			const wishlist = exists
				? state.wishlist.filter((p) => p.slug !== product.slug)
				: [product, ...state.wishlist];
			saveWishlist(wishlist);
			return { ...state, wishlist };
		}
		default:
			throw Error('Invalid action type: ' + action.type);
	}
}

export function StoreProvider({ children }) {
	const [state, dispatch] = useReducer(reducer, initialState);

	// The wishlist lives in localStorage, so it can only be read in the browser.
	useEffect(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY));
			if (Array.isArray(saved)) {
				dispatch({ type: 'WISHLIST_SET', payload: saved });
			}
		} catch {
			/* ignore corrupt storage */
		}
	}, []);

	const value = { state, dispatch };

	return <Store.Provider value={value}>{children}</Store.Provider>;
}
