// /api/orders/:id
import { getSession } from 'next-auth/react';
import mongoose from 'mongoose';
import db from '../../../utils/db';
import Order from '../../../models/Order';

const handler = async (req, res) => {
	const session = await getSession({ req });
	if (!session) {
		return res.status(401).send({ message: 'signin required' });
	}
	if (!mongoose.isValidObjectId(req.query.id)) {
		return res.status(404).send({ message: 'Order not found' });
	}

	await db.connect();
	const order = await Order.findById(req.query.id);
	await db.disconnect();

	if (!order) {
		return res.status(404).send({ message: 'Order not found' });
	}
	// Orders (and their invoices) are private: only the buyer or an admin may see them
	if (String(order.user) !== String(session.user.id) && !session.user.isAdmin) {
		return res.status(403).send({ message: 'You do not have access to this order' });
	}
	res.send(order);
};

export default handler;
