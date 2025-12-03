import { getServerSession } from 'next-auth';

import { authOptions } from './auth-options';

export async function getAdminSession() {
    return getServerSession(authOptions);
}

export async function isAdmin() {
    const session = await getAdminSession();
    return !!session?.user;
}

export async function requireAdminSession() {
    const session = await getAdminSession();
    if (!session?.user) {
        throw new Error('Admin session required');
    }
    return session;
}
