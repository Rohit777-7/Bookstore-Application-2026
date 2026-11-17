import '../styles/globals.scss';
import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { StoreProvider } from '../utils/Store';
import { ToastProvider } from '../components/Toast';
import { QuickViewProvider } from '../components/QuickView';
import { playSound } from '../utils/sound';

// Click sounds: every <button>, `.button` or `[data-sound]` element.
// Opt out with data-sound="none"; choose a sound with data-sound="add" etc.
function useClickSounds() {
	useEffect(() => {
		const onClick = (e) => {
			const el = e.target.closest?.('[data-sound], button, .button');
			if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
			const name = el.dataset.sound || 'tap';
			if (name !== 'none') playSound(name);
		};
		document.addEventListener('click', onClick);
		return () => document.removeEventListener('click', onClick);
	}, []);
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
	useClickSounds();

	return (
		<SessionProvider session={session}>
			<StoreProvider>
				<ToastProvider>
					<QuickViewProvider>
						{Component.auth ? (
							<Auth>
								<Component {...pageProps} />
							</Auth>
						) : (
							<Component {...pageProps} />
						)}
					</QuickViewProvider>
				</ToastProvider>
			</StoreProvider>
		</SessionProvider>
	);
}

function Auth({ children }) {
	const router = useRouter();
	const { status } = useSession({
		required: true,
		onUnauthenticated() {
			router.push('/unauthorized?message=login required');
		},
	});
	if (status === 'loading') {
		return (
			<div className="page-loader" role="status" aria-label="Loading">
				<span />
			</div>
		);
	}

	return children;
}

export default MyApp;
