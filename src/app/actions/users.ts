'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { hashPassword } from '@/lib/auth/password';
import { eq, sql } from 'drizzle-orm';
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

async function canAccessAdmin() {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { allowed: false, user: null };

    // Allow ADMIN and coordinator roles to manage users
    if (hasRole(currentUser, ['ADMIN', 'STATE_COORD', 'CITY_COORD'])) {
        return { allowed: true, user: currentUser };
    }

    // Bootstrap mode: if no ADMIN users exist, allow any authenticated user
    const adminCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.role, 'ADMIN'));

    if (adminCount[0].count === 0) return { allowed: true, user: currentUser };

    return { allowed: false, user: currentUser };
}

export async function getUsers() {
    try {
        const { allowed } = await canAccessAdmin();
        if (!allowed) {
            throw new Error('Unauthorized');
        }
        const result = await db.select().from(users).orderBy(users.createdAt);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Unauthorized" };
    }
}

export type CreateUserData = {
    fullName: string;
    email: string;
    password: string;
    role: "ADMIN" | "STATE_COORD" | "CITY_COORD" | "ZONE_COORD" | "LOCAL_COORD";
    scopeState?: string;
    scopeCity?: string;
    scopeZone?: string;
};

export async function createUser(data: CreateUserData) {
    const { allowed } = await canAccessAdmin();
    if (!allowed) {
        throw new Error('Unauthorized');
    }

    // Check if email exists
    const existing = await db.select().from(users).where(eq(users.email, data.email));
    if (existing.length > 0) {
        throw new Error('Email already exists');
    }

    if (!data.password || data.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }

    const hashedPassword = await hashPassword(data.password);

    await db.insert(users).values({
        fullName: data.fullName,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        scopeState: data.scopeState || null,
        scopeCity: data.scopeCity || null,
        scopeZone: data.scopeZone || null,
    });

    revalidatePath('/admin');
    return { success: true };
}

export async function deleteUser(userId: string) {
    const { allowed } = await canAccessAdmin();
    if (!allowed) {
        throw new Error('Unauthorized');
    }
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath('/admin');
    return { success: true };
}
