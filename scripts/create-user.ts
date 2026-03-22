import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../src/lib/db/schema/users';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function createDevUser() {
    const email = 'dev@sverdlov.com.br';
    const password = '@sverdlovUP2026';
    const fullName = 'Usuário Dev';
    const role = 'ADMIN';

    console.log('🔐 Criando usuário developer...');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await db.insert(users).values({
            fullName,
            email,
            passwordHash: hashedPassword,
            role,
        }).onConflictDoNothing({ target: users.email }).returning();

        if (user) {
            console.log('✅ Usuário criado com sucesso!');
            console.log(`   Email: ${email}`);
            console.log(`   Nome: ${fullName}`);
            console.log(`   Role: ${role}`);
            console.log(`   Senha: ${password}`);
        } else {
            console.log('ℹ️  Usuário já existe no banco de dados.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        process.exit(1);
    }
}

createDevUser();
