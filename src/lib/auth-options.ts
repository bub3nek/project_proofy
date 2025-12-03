import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const defaultEmail = process.env.ADMIN_EMAIL || 'admin@proofy.local';
const defaultPassword = process.env.ADMIN_PASSWORD || 'proofy123';
const resolvedSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'project-proofy-secret';

if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = resolvedSecret;
}

export function validateAdminCredentials(email: string, password: string) {
    return email === defaultEmail && password === defaultPassword;
}

export const authOptions: NextAuthOptions = {
    secret: resolvedSecret,
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
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const isValid = validateAdminCredentials(credentials.email, credentials.password);

                if (!isValid) {
                    return null;
                }

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
