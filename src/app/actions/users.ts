"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq, desc } from "drizzle-orm";

export async function getUsers() {
    try {
        const result = await db
            .select({
                id: users.id,
                fullName: users.fullName,
                role: users.role,
                territoryScope: users.territoryScope,
            })
            .from(users)
            .orderBy(desc(users.createdAt));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Falha ao carregar usuários" };
    }
}
