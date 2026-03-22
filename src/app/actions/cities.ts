'use server';

import { db } from '@/lib/db';
import { cities } from '@/lib/db/schema/cities';
import { eq, and, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function getCities(state?: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        const whereClause = state ? eq(cities.state, state) : undefined;
        const result = await db
            .select()
            .from(cities)
            .where(whereClause)
            .orderBy(asc(cities.state), asc(cities.name));

        return { success: true, data: result };
    } catch (error) {
        console.error('Error fetching cities:', error);
        return { success: false, error: 'Erro ao carregar cidades' };
    }
}

export async function createCity(data: { name: string; state: string }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        // Check if city already exists in this state
        const existing = await db
            .select()
            .from(cities)
            .where(and(eq(cities.name, data.name), eq(cities.state, data.state)));

        if (existing.length > 0) {
            return { success: false, error: 'Esta cidade já está cadastrada neste estado' };
        }

        await db.insert(cities).values({
            name: data.name,
            state: data.state,
        });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error creating city:', error);
        return { success: false, error: 'Erro ao cadastrar cidade' };
    }
}

export async function deleteCity(cityId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        await db.delete(cities).where(eq(cities.id, cityId));

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error deleting city:', error);
        return { success: false, error: 'Erro ao excluir cidade' };
    }
}
