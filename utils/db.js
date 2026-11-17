import mongoose from 'mongoose';

// One shared connection per server instance, cached on `global` so it survives
// Next.js hot reloads in development and warm invocations on Vercel.
const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

async function connect() {
	if (cached.conn && mongoose.connection.readyState === 1) {
		return cached.conn;
	}

	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error(
			'MONGODB_URI is not set. Add it to .env locally, or to Project Settings → Environment Variables on Vercel.'
		);
	}

	if (!cached.promise) {
		cached.promise = mongoose
			.connect(uri, { serverSelectionTimeoutMS: 10000 })
			.catch((err) => {
				cached.promise = null; // allow a retry on the next request
				console.error(
					'MongoDB connection failed. Check MONGODB_URI and that MongoDB Atlas → Network Access allows this server (0.0.0.0/0 for Vercel).',
					err.message
				);
				throw err;
			});
	}

	cached.conn = await cached.promise;
	return cached.conn;
}

// Intentionally a no-op: closing the shared connection after a request breaks
// other requests still using it (Vercel runs many requests per instance).
// Scripts that need to exit (seed.js) call mongoose.disconnect() directly.
async function disconnect() {}

// Make a lean Mongo document safe for getServerSideProps props:
// ObjectIds become strings, Dates become ISO strings, undefined is dropped.
function convertDoctoObj(doc) {
	return JSON.parse(JSON.stringify(doc));
}

const db = { connect, disconnect, convertDoctoObj };
export default db;
