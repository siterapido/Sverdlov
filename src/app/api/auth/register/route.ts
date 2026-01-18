import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fullName, email, password, role = 'member', territoryScope } = body;

        // Validate input
        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: 'Nome, email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Usuário já existe' },
                { status: 409 }
            );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const [newUser] = await db.insert(users).values({
            fullName,
            email,
            passwordHash,
            role,
            territoryScope,
        }).returning();

        // Generate JWT token
        const token = await signToken({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role as any,
            territoryScope: newUser.territoryScope || undefined,
        });

        // Set cookie
        const response = NextResponse.json({
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Erro no registro:', error);
        return NextResponse.json(
            { error: 'Erro ao criar usuário' },
            { status: 500 }
        );
    }
}
