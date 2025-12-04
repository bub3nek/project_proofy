import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const defaultEmail = process.env.ADMIN_EMAIL || 'admin@proofy.local';
const defaultPassword = process.env.ADMIN_PASSWORD || 'proofy123';
const resolvedSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'project-proofy-secret';

if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = resolvedSecret;
}

// Automatically set NEXTAUTH_URL on Vercel if not explicitly defined
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export function validateAdminCredentials(email: string, password: string) {
    return email === defaultEmail && password === defaultPassword;
}

export const authOptions: NextAuthOptions = {
    secret: resolvedSecret,
    debug: true, // Enable NextAuth debugging
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/admin/login',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log('[Auth] Authorizing request for:', credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log('[Auth] Missing credentials');
                    return null;
                }

                const isValid = validateAdminCredentials(credentials.email, credentials.password);

                if (!isValid) {
                    console.log('[Auth] Invalid credentials');
                    return null;
                }

                console.log('[Auth] Credentials valid, logging in as admin');
                return {
                    id: 'admin',
                    name: 'Admin',
                    email: credentials.email,
                    role: 'admin',
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = 'admin';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
            }

            return session;
        },
    },
};

console.log('[Auth] Configured with:', {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    HAS_SECRET: !!process.env.NEXTAUTH_SECRET,
    ADMIN_EMAIL_SET: !!process.env.ADMIN_EMAIL,
});
