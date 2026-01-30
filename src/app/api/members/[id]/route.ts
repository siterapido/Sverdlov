import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { getAuthUser, hasRole } from '@/lib/auth/rbac';
import { eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// PATCH - Update member
export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const user = await getAuthUser(request);
        const { id } = await context.params;

        if (!user || !hasRole(user, ['national_admin', 'state_leader', 'municipal_leader'])) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await request.json();
        const {
            fullName,
            socialName,
            cpf,
            voterTitle,
            dateOfBirth,
            gender,
            phone,
            email,
            state,
            city,
            zone,
            neighborhood,
            status,
            militancyLevel,
        } = body;

        const [updatedMember] = await db
            .update(members)
            .set({
                fullName,
                socialName,
                cpf,
                voterTitle,
                dateOfBirth,
                gender: gender || null,
                phone,
                email,
                state,
                city,
                zone: zone || null,
                neighborhood,
                status,
                militancyLevel,
                updatedAt: new Date(),
            })
            .where(eq(members.id, id))
            .returning();

        if (!updatedMember) {
            return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ member: updatedMember });
    } catch (error) {
        console.error('Erro ao atualizar membro:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar membro' },
            { status: 500 }
        );
    }
}

// DELETE - Remove member
export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const user = await getAuthUser(request);
        const { id } = await context.params;

        if (!user || !hasRole(user, ['national_admin'])) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        await db.delete(members).where(eq(members.id, id));

        return NextResponse.json({ message: 'Membro excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir membro:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir membro' },
            { status: 500 }
        );
    }
}
