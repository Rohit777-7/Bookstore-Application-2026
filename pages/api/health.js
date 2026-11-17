// GET /api/health — deployment diagnostics.
// Reports whether configuration looks right and whether MongoDB is reachable,
// WITHOUT revealing any secret values, hostnames or error messages.
import { createHash } from 'crypto';
import db from '../../utils/db';
import Product from '../../models/Product';

function hintFor(err) {
	const text = `${err?.name} ${err?.code} ${err?.codeName} ${err?.message}`;
	if (/MONGODB_URI is not set/.test(text)) return 'MONGODB_URI is missing in this environment.';
	if (/ServerSelection|timed out|ECONNREFUSED|ETIMEDOUT/i.test(text))
		return 'Cannot reach the cluster. In MongoDB Atlas → Network Access, allow 0.0.0.0/0 (Vercel has no fixed IP).';
	if (/bad auth|Authentication failed|AuthenticationFailed|code 8000|\b18\b/i.test(text))
		return 'Wrong database username or password inside MONGODB_URI.';
	if (/ENOTFOUND|querySrv|EREFUSED/i.test(text)) return 'Cluster hostname in MONGODB_URI is wrong or mistyped.';
	if (/MongoParseError|Invalid scheme|URI/i.test(text)) return 'MONGODB_URI is malformed (check for spaces, quotes or a cut-off value).';
	return 'Unknown database error — check Vercel → Logs.';
}

export default async function handler(req, res) {
	const uri = process.env.MONGODB_URI || '';
	const authUrl = process.env.NEXTAUTH_URL;

	const config = {
		MONGODB_URI: !uri
			? 'missing'
			: /\s|["']/.test(uri)
			? 'contains spaces or quotes'
			: /^mongodb(\+srv)?:\/\//.test(uri)
			? 'ok'
			: 'does not start with mongodb:// or mongodb+srv://',
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'ok' : 'missing',
		NEXTAUTH_URL: !authUrl ? 'not set (fine on Vercel)' : /^https?:\/\/\S+$/.test(authUrl) ? 'ok' : 'invalid',
	};

	// One-way fingerprint of the cluster host, so two environments can be compared
	// ("is Vercel using the same cluster as my .env?") without revealing it.
	const host = (uri.split('@')[1] || '').split(/[/?]/)[0];
	config.MONGODB_HOST_FINGERPRINT = host
		? createHash('sha256').update(host.toLowerCase()).digest('hex').slice(0, 12)
		: null;

	let database;
	try {
		await db.connect();
		database = { status: 'connected', books: await Product.estimatedDocumentCount() };
	} catch (err) {
		database = {
			status: 'error',
			type: err?.name || 'Error',
			code: err?.code || err?.cause?.code || null,
			hint: hintFor(err),
		};
	}

	res.setHeader('Cache-Control', 'no-store');
	res.status(database.status === 'connected' ? 200 : 503).json({ config, database });
}
