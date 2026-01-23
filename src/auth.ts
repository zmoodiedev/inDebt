import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getOrCreateHouseholdForUser } from '@/lib/household';

// Get allowed emails from environment variable (comma-separated)
const getAllowedEmails = (): string[] => {
  const emails = process.env.ALLOWED_EMAILS || '';
  return emails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = getAllowedEmails();

      // If no allowlist is configured, deny all (fail-safe)
      if (allowedEmails.length === 0) {
        console.error('No ALLOWED_EMAILS configured. Denying access.');
        return false;
      }

      const userEmail = user.email?.toLowerCase();

      if (!userEmail) {
        return false;
      }

      const isAllowed = allowedEmails.includes(userEmail);

      if (!isAllowed) {
        console.log(`Access denied for email: ${userEmail}`);
        return false;
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      const extendedToken = token as { householdId?: string; email?: string };

      // Store email in token for later use
      if (user?.email) {
        extendedToken.email = user.email;
      }

      // Resolve household on sign-in, or if householdId is missing from token
      const shouldResolveHousehold =
        (trigger === 'signIn' && user) ||
        (!extendedToken.householdId && token.sub && extendedToken.email);

      if (shouldResolveHousehold && token.sub) {
        const email = user?.email || extendedToken.email;
        if (email) {
          try {
            const householdId = await getOrCreateHouseholdForUser(token.sub, email);
            extendedToken.householdId = householdId;
          } catch (error) {
            console.error('Failed to resolve household:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id and householdId to session
      const extendedUser = session.user as { id?: string; householdId?: string };
      const extendedToken = token as { sub?: string; householdId?: string };
      if (extendedToken.sub) {
        extendedUser.id = extendedToken.sub;
      }
      if (extendedToken.householdId) {
        extendedUser.householdId = extendedToken.householdId;
      }
      return session;
    },
  },
});
