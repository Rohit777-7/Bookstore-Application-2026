import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';

// Shared with API routes so they can read the session directly on the server
// (see utils/auth.js) instead of making an HTTP call to NEXTAUTH_URL.
export const authOptions = {
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user?._id) token._id = user._id;
			if (user?.isAdmin) token.isAdmin = user.isAdmin;
			return token;
		},
		async session({ session, token }) {
			if (token._id) session.user.id = token._id;
			if (token.isAdmin) session.user.isAdmin = token.isAdmin;
			return session;
		},
	},
	providers: [
		CredentialsProvider({
			async authorize(credentials) {
				await db.connect();
				const user = await User.findOne({
					email: credentials.email,
				});
				await db.disconnect();
				if (
					user &&
					bcryptjs.compareSync(credentials.password, user.password)
				) {
					return {
						_id: user._id,
						name: user.name,
						email: user.email,
						image: 'blank',
						isAdmin: user.isAdmin,
					};
				}
				throw new Error('Invalid credentials');
			},
		}),
	],
};

export default NextAuth(authOptions);
