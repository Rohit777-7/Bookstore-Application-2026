import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

/**
 * Read the signed-in user's session inside an API route.
 *
 * Unlike `getSession({ req })` from next-auth/react — which makes the server
 * send an HTTP request to itself at NEXTAUTH_URL (and fails with "signin
 * required" if that URL is wrong or unreachable, e.g. on Vercel) — this decodes
 * the session cookie directly on the server.
 */
export function getServerSession(req, res) {
	return unstable_getServerSession(req, res, authOptions);
}
