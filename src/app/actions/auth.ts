'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { auditLogout } from '@/lib/audit';

export async function logout() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    // Audit logout before deleting token
    if (token) {
        try {
            const user = await verifyToken(token);
            if (user?.id) {
                await auditLogout(user.id);
            }
        } catch {
            // Continue with logout even if audit fails
        }
    }

    cookieStore.delete('auth_token');
    redirect('/');
}
