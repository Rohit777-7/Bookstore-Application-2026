/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertIcon, CheckIcon, CloseIcon } from './Icons';
import Styles from './Toast.module.scss';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);
	const counter = useRef(0);

	const dismiss = useCallback((id) => {
		setToasts((list) =>
			list.map((t) => (t.id === id ? { ...t, leaving: true } : t))
		);
		setTimeout(
			() => setToasts((list) => list.filter((t) => t.id !== id)),
			320
		);
	}, []);

	const toast = useCallback(
		(opts) => {
			counter.current += 1;
			const id = counter.current;
			setToasts((list) => [...list.slice(-2), { id, type: 'success', ...opts }]);
			setTimeout(() => dismiss(id), opts.duration || 3800);
		},
		[dismiss]
	);

	return (
		<ToastContext.Provider value={toast}>
			{children}
			<div className={Styles.region} role="status" aria-live="polite">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`${Styles.toast} ${Styles[t.type] || ''} ${
							t.leaving ? Styles.leaving : ''
						}`}
					>
						{t.image ? (
							<img className={Styles.thumb} src={t.image} alt="" />
						) : (
							<span className={Styles.icon}>
								{t.type === 'error' ? <AlertIcon /> : <CheckIcon />}
							</span>
						)}
						<div className={Styles.text}>
							<strong>{t.title}</strong>
							{t.message && <span>{t.message}</span>}
						</div>
						{t.action && (
							<Link href={t.action.href}>
								<a className={Styles.action} onClick={() => dismiss(t.id)}>
									{t.action.label}
								</a>
							</Link>
						)}
						<button
							className={Styles.close}
							onClick={() => dismiss(t.id)}
							aria-label="Dismiss notification"
							data-sound="none"
						>
							<CloseIcon size={16} />
						</button>
						<span className={Styles.timer} style={{ animationDuration: `${t.duration || 3800}ms` }} />
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export const useToast = () => useContext(ToastContext);
