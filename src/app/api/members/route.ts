import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { getAuthUser, hasRole } from '@/lib/auth/rbac';
import { eq } from 'drizzle-orm';

// GET - List members
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // For now, return all members (will add territory filtering later)
        const allMembers = await db.query.members.findMany({
            orderBy: (members, { desc }) => [desc(members.createdAt)],
        });

        return NextResponse.json({ members: allMembers });
    } catch (error) {
        console.error('Erro ao buscar membros:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar membros' },
            { status: 500 }
        );
    }
}

// POST - Create member
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);

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
            status = 'interested',
            militancyLevel = 'supporter',
        } = body;

        // Validate required fields
        if (!fullName || !cpf || !dateOfBirth || !phone || !email || !state || !city || !neighborhood) {
            return NextResponse.json(
                { error: 'Campos obrigatórios faltando' },
                { status: 400 }
            );
        }

        // Check if CPF already exists
        const existingMember = await db.query.members.findFirst({
            where: eq(members.cpf, cpf),
        });

        if (existingMember) {
            return NextResponse.json(
                { error: 'CPF já cadastrado' },
                { status: 409 }
            );
        }

        // Create member
        const [newMember] = await db.insert(members).values({
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
            politicalResponsibleId: user.userId,
        }).returning();

        return NextResponse.json({ member: newMember }, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar membro:', error);
        return NextResponse.json(
            { error: 'Erro ao criar membro' },
            { status: 500 }
        );
    }
}
