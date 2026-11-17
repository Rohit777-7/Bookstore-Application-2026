import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { useToast } from './Toast';
import { downloadInvoice, invoiceNumber } from '../utils/invoice';
import { playSound } from '../utils/sound';

const DownloadIcon = ({ size = 18 }) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
	</svg>
);

// Downloads the order's PDF invoice. `variant="link"` renders a compact text button.
export default function InvoiceButton({ order, variant = 'button', className = '' }) {
	const { data: session } = useSession();
	const toast = useToast();
	const [busy, setBusy] = useState(false);

	const onClick = async () => {
		setBusy(true);
		try {
			await downloadInvoice(order, { name: session?.user?.name, email: session?.user?.email });
			playSound('add');
			toast({ title: 'Invoice downloaded', message: `${invoiceNumber(order)}.pdf` });
		} catch (err) {
			console.error(err);
			playSound('error');
			toast({ type: 'error', title: 'Could not create PDF', message: 'Please try again.' });
		} finally {
			setBusy(false);
		}
	};

	const classes =
		variant === 'link' ? `invoice-link ${className}` : `button button--ghost ${className}`;

	return (
		<button
			type="button"
			className={classes}
			onClick={onClick}
			disabled={busy || !order?._id}
			data-sound="none"
			aria-label={`Download invoice ${order?._id ? invoiceNumber(order) : ''} as PDF`}
		>
			<DownloadIcon size={variant === 'link' ? 15 : 18} />
			{busy ? 'Preparing…' : variant === 'link' ? 'PDF' : 'Download invoice (PDF)'}
		</button>
	);
}
