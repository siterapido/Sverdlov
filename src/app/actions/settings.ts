'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) throw new Error('Unauthorized');
    return await verifyToken(token);
}

export async function getUserSettings() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.userId) throw new Error('Unauthorized');

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, currentUser.userId))
            .limit(1);

        if (!user.length) throw new Error('User not found');

        const userData = user[0];
        return {
            success: true,
            data: {
                id: userData.id,
                fullName: userData.fullName,
                email: userData.email,
                profilePhoto: userData.profilePhoto,
                theme: userData.theme,
                language: userData.language,
                notificationsEnabled: userData.notificationsEnabled,
            },
        };
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return { success: false, error: 'Failed to fetch settings' };
    }
}

type UpdateProfileData = {
    fullName?: string;
    email?: string;
    profilePhoto?: string;
};

export async function updateUserProfile(data: UpdateProfileData) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.userId) throw new Error('Unauthorized');

        // Check if email is already taken
        if (data.email) {
            const existing = await db
                .select()
                .from(users)
                .where(eq(users.email, data.email));

            if (existing.length > 0 && existing[0].id !== currentUser.userId) {
                return { success: false, error: 'Email already in use' };
            }
        }

        await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, currentUser.userId));

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function updatePassword(
    currentPassword: string,
    newPassword: string
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.userId) throw new Error('Unauthorized');

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, currentUser.userId))
            .limit(1);

        if (!user.length) throw new Error('User not found');

        // Verify current password
        const isValid = await verifyPassword(
            currentPassword,
            user[0].passwordHash
        );
        if (!isValid) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        await db
            .update(users)
            .set({
                passwordHash: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, currentUser.userId));

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating password:', error);
        return { success: false, error: 'Failed to update password' };
    }
}

type UpdatePreferencesData = {
    theme?: 'light' | 'dark' | 'system';
    language?: 'pt' | 'es' | 'en';
    notificationsEnabled?: boolean;
};

export async function updateUserPreferences(data: UpdatePreferencesData) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.userId) throw new Error('Unauthorized');

        await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, currentUser.userId));

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating preferences:', error);
        return { success: false, error: 'Failed to update preferences' };
    }
}
