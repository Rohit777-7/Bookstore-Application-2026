// Generates a branded PDF invoice for an order, entirely in the browser.
// jsPDF is loaded on demand so it never weighs down normal page loads.
//
// Note: the built-in PDF fonts can't draw the ₹ sign, so amounts use "Rs.".

const INK = [18, 15, 11];
const GOLD = [196, 158, 88];
const GOLD_LIGHT = [243, 220, 166];
const MUTED = [118, 106, 88];
const PAPER = [250, 246, 238];
const LINE = [226, 216, 196];
const GREEN = [47, 122, 85];
const WINE = [142, 44, 59];

const rs = (n) =>
	'Rs. ' +
	Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) =>
	d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

export const invoiceNumber = (order) => `INV-${String(order._id).slice(-8).toUpperCase()}`;

export async function downloadInvoice(order, customer = {}) {
	const [{ jsPDF }, tableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
	// The plugin's export shape differs between bundlers / module systems
	const autoTable =
		[tableModule.autoTable, tableModule.default, tableModule.default?.autoTable, tableModule.default?.default].find(
			(fn) => typeof fn === 'function'
		);

	const doc = new jsPDF({ unit: 'pt', format: 'a4' });
	const W = doc.internal.pageSize.getWidth();
	const H = doc.internal.pageSize.getHeight();
	const M = 48; // page margin
	const invNo = invoiceNumber(order);
	const addr = order.shippingAddress || {};

	doc.setProperties({
		title: `Invoice ${invNo}`,
		subject: 'Book Store order invoice',
		author: 'Book Store',
		creator: 'Book Store',
	});

	/* ── Header band ─────────────────────────────────────── */
	doc.setFillColor(...INK);
	doc.rect(0, 0, W, 128, 'F');
	doc.setDrawColor(...GOLD);
	doc.setLineWidth(1.2);
	doc.line(0, 128, W, 128);

	doc.setFont('times', 'bold');
	doc.setFontSize(26);
	doc.setTextColor(...GOLD);
	doc.setCharSpace(4);
	doc.text('BOOK STORE', M, 62);
	doc.setCharSpace(2.4);
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(7.5);
	doc.setTextColor(...GOLD_LIGHT);
	doc.text('CURATED EDITIONS', M, 80);
	doc.setCharSpace(0);

	doc.setFont('times', 'italic');
	doc.setFontSize(34);
	doc.setTextColor(255, 255, 255);
	doc.text('Invoice', W - M, 62, { align: 'right' });
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(9);
	doc.setTextColor(...GOLD_LIGHT);
	doc.text(`No. ${invNo}`, W - M, 82, { align: 'right' });
	doc.text(`Issued ${fmtDate(order.createdAt)}`, W - M, 96, { align: 'right' });

	/* ── Billing / shipping / payment ───────────────────── */
	let y = 168;
	const colW = (W - M * 2 - 40) / 3;
	const block = (x, label, lines) => {
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(7.5);
		doc.setTextColor(...GOLD);
		doc.setCharSpace(1.5);
		doc.text(label, x, y);
		doc.setCharSpace(0);
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(10);
		doc.setTextColor(...INK);
		let ly = y + 18;
		lines.filter(Boolean).forEach((line, i) => {
			if (i === 0) doc.setFont('helvetica', 'bold');
			doc.splitTextToSize(String(line), colW).forEach((part) => {
				doc.text(part, x, ly);
				ly += 14;
			});
			if (i === 0) doc.setFont('helvetica', 'normal');
		});
		return ly;
	};

	const endY = Math.max(
		block(M, 'BILLED TO', [customer.name || addr.fullName, customer.email]),
		block(M + colW + 20, 'SHIP TO', [
			addr.fullName,
			addr.address,
			[addr.city, addr.postalCode].filter(Boolean).join(' '),
			addr.country,
		]),
		block(M + (colW + 20) * 2, 'PAYMENT', [
			order.paymentMethod,
			order.isPaid ? `Paid on ${fmtDate(order.paidAt)}` : 'Awaiting payment',
			order.isDelivered ? `Delivered on ${fmtDate(order.deliveredAt)}` : 'Not yet delivered',
		])
	);

	/* ── Items table ─────────────────────────────────────── */
	const items = order.orderItems || [];
	autoTable(doc, {
		startY: endY + 22,
		margin: { left: M, right: M },
		head: [['#', 'Title', 'Qty', 'Unit price', 'Amount']],
		body: items.map((item, i) => [
			String(i + 1).padStart(2, '0'),
			item.name,
			String(item.quantity),
			rs(item.price),
			rs(item.price * item.quantity),
		]),
		theme: 'plain',
		styles: { font: 'helvetica', fontSize: 10, textColor: INK, cellPadding: { top: 9, bottom: 9, left: 8, right: 8 } },
		headStyles: { fillColor: INK, textColor: GOLD, fontStyle: 'bold', fontSize: 8, cellPadding: 9 },
		alternateRowStyles: { fillColor: PAPER },
		columnStyles: {
			0: { cellWidth: 32, textColor: MUTED },
			2: { cellWidth: 44, halign: 'center' },
			3: { cellWidth: 92, halign: 'right' },
			4: { cellWidth: 98, halign: 'right', fontStyle: 'bold' },
		},
		didParseCell: (data) => {
			if (data.section === 'head' && data.column.index >= 2) {
				data.cell.styles.halign = data.column.index === 2 ? 'center' : 'right';
			}
		},
	});

	/* ── Totals ──────────────────────────────────────────── */
	y = doc.lastAutoTable.finalY + 26;
	if (y + 190 > H - 70) {
		doc.addPage();
		y = M + 20;
	}

	const labelX = W - M - 220;
	const row = (label, value, opts = {}) => {
		doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
		doc.setFontSize(opts.size || 10);
		doc.setTextColor(...(opts.color || MUTED));
		doc.text(label, labelX, y);
		doc.setTextColor(...(opts.valueColor || INK));
		doc.text(value, W - M, y, { align: 'right' });
		y += opts.gap || 18;
	};

	const itemCount = items.reduce((a, i) => a + i.quantity, 0);
	row(`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`, rs(order.itemsPrice));
	row('Shipping', order.shippingPrice ? rs(order.shippingPrice) : 'Free');
	row('Tax (15%)', rs(order.taxPrice), { gap: 14 });

	doc.setDrawColor(...GOLD);
	doc.setLineWidth(1);
	doc.line(labelX, y, W - M, y);
	y += 26;
	doc.setFont('times', 'bold');
	doc.setFontSize(13);
	doc.setTextColor(...INK);
	doc.text('Total', labelX, y);
	doc.setFontSize(20);
	doc.text(rs(order.totalPrice), W - M, y, { align: 'right' });

	// Status stamp on the left of the totals
	const stampY = y - 40;
	const paid = Boolean(order.isPaid);
	const stampColor = paid ? GREEN : WINE;
	const stampText = paid ? 'PAID' : 'PAYMENT DUE';
	doc.setDrawColor(...stampColor);
	doc.setTextColor(...stampColor);
	doc.setLineWidth(2);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(paid ? 26 : 16);
	doc.setCharSpace(3);
	const stampW = doc.getTextWidth(stampText) + 26;
	doc.roundedRect(M, stampY - 26, stampW, 40, 6, 6, 'S');
	doc.text(stampText, M + 13, stampY + 2);
	doc.setCharSpace(0);

	/* ── Thank-you note ──────────────────────────────────── */
	y += 60;
	doc.setDrawColor(...LINE);
	doc.setLineWidth(0.6);
	doc.line(M, y, W - M, y);
	y += 30;
	doc.setFont('times', 'italic');
	doc.setFontSize(15);
	doc.setTextColor(...INK);
	doc.text('Thank you for reading with us.', W / 2, y, { align: 'center' });
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(9);
	doc.setTextColor(...MUTED);
	doc.text('We hope these pages bring you many happy hours.', W / 2, y + 16, { align: 'center' });

	/* ── Footer on every page ────────────────────────────── */
	const pages = doc.getNumberOfPages();
	for (let p = 1; p <= pages; p++) {
		doc.setPage(p);
		doc.setFillColor(...PAPER);
		doc.rect(0, H - 44, W, 44, 'F');
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(8);
		doc.setTextColor(...MUTED);
		doc.text(`Order ID ${order._id}  ·  This is a computer-generated invoice.`, M, H - 18);
		doc.text(`Page ${p} of ${pages}`, W - M, H - 18, { align: 'right' });
	}

	doc.save(`BookStore-${invNo}.pdf`);
}
