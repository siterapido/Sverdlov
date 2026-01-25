'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { hashPassword } from '@/lib/auth/password';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { hasRole } from '@/lib/auth/rbac';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function getUsers() {
    const currentUser = await getCurrentUser();
    if (!hasRole(currentUser, ['ADMIN'])) {
        throw new Error('Unauthorized');
    }
    return await db.select().from(users).orderBy(users.createdAt);
}

export type CreateUserData = {
    fullName: string;
    email: string;
    role: "ADMIN" | "STATE_COORD" | "CITY_COORD" | "ZONE_COORD" | "LOCAL_COORD";
    scopeState?: string;
    scopeCity?: string;
    scopeZone?: string;
    scopeNucleusId?: string;
};

export async function createUser(data: CreateUserData) {
    const currentUser = await getCurrentUser();
    if (!hasRole(currentUser, ['ADMIN'])) {
        throw new Error('Unauthorized');
    }

    // Check if email exists
    const existing = await db.select().from(users).where(eq(users.email, data.email));
    if (existing.length > 0) {
        throw new Error('Email already exists');
    }

    const hashedPassword = await hashPassword('12345678'); // Default password

    await db.insert(users).values({
        fullName: data.fullName,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        scopeState: data.scopeState || null,
        scopeCity: data.scopeCity || null,
        scopeZone: data.scopeZone || null,
        scopeNucleusId: data.scopeNucleusId || null,
    });

    revalidatePath('/admin');
    return { success: true };
}

export async function deleteUser(userId: string) {
    const currentUser = await getCurrentUser();
    if (!hasRole(currentUser, ['ADMIN'])) {
        throw new Error('Unauthorized');
    }
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath('/admin');
    return { success: true };
}
