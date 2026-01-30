import { db } from "./index";
import { members, finances, nuclei, users } from "./schema";
import { sql } from "drizzle-orm";
import { subDays, subMonths } from "date-fns";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("🌱 Populando banco de dados com dados de teste...");

    try {
        // 1. Limpar dados existentes (opcional, mas bom para reprodutibilidade)
        // await db.delete(finances);
        // await db.delete(members);
        // await db.delete(nuclei);
        // await db.delete(users);

        // 2. Criar um usuário administrador se não existir
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const [adminUser] = await db.insert(users).values({
            fullName: "Administrador do Sistema",
            email: "admin@sverdlov.com",
            passwordHash: hashedPassword,
            role: "national_admin",
        }).onConflictDoNothing({ target: users.email }).returning();

        const userId = adminUser?.id;

        // 3. Criar Núcleos
        const nucleiData = [
            { name: "Núcleo Centro", type: "territorial" as const, state: "SP", city: "São Paulo", status: "active" as const },
            { name: "Núcleo Bixiga", type: "territorial" as const, state: "SP", city: "São Paulo", status: "active" as const },
            { name: "Núcleo Educação", type: "thematic" as const, state: "SP", city: "São Paulo", status: "in_formation" as const },
        ];

        const createdNuclei = await db.insert(nuclei).values(nucleiData).returning();

        // 4. Criar Membros
        const membersData = [
            {
                fullName: "João Silva",
                socialName: "João",
                cpf: "111.111.111-11",
                dateOfBirth: "1990-01-01",
                phone: "(11) 99999-9999",
                email: "joao@email.com",
                state: "SP",
                city: "São Paulo",
                neighborhood: "Centro",
                status: "active" as const,
                nucleusId: createdNuclei[0].id,
                createdAt: subMonths(new Date(), 2),
            },
            {
                fullName: "Maria Santos",
                socialName: "Maria",
                cpf: "222.222.222-22",
                dateOfBirth: "1995-05-15",
                phone: "(11) 88888-8888",
                email: "maria@email.com",
                state: "SP",
                city: "São Paulo",
                neighborhood: "Bixiga",
                status: "active" as const,
                nucleusId: createdNuclei[1].id,
                createdAt: subMonths(new Date(), 1),
            },
            {
                fullName: "Pedro Alves",
                socialName: "Pedro",
                cpf: "333.333.333-33",
                dateOfBirth: "1988-10-20",
                phone: "(11) 77777-7777",
                email: "pedro@email.com",
                state: "SP",
                city: "São Paulo",
                neighborhood: "Liberdade",
                status: "interested" as const,
                createdAt: subDays(new Date(), 5),
            },
            {
                fullName: "Ana Costa",
                socialName: "Ana",
                cpf: "444.444.444-44",
                dateOfBirth: "1992-03-30",
                phone: "(11) 66666-6666",
                email: "ana@email.com",
                state: "SP",
                city: "São Paulo",
                neighborhood: "Centro",
                status: "active" as const,
                nucleusId: createdNuclei[0].id,
                createdAt: subDays(new Date(), 2),
            },
        ];

        const createdMembers = await db.insert(members).values(membersData).returning();

        // 5. Criar Finanças (Contribuições)
        const financesData = [
            // Mês atual
            {
                memberId: createdMembers[0].id,
                amount: "50.00",
                paymentDate: new Date(),
                paymentMethod: "pix",
                status: "completed" as const,
            },
            {
                memberId: createdMembers[1].id,
                amount: "100.00",
                paymentDate: subDays(new Date(), 1),
                paymentMethod: "cartao",
                status: "completed" as const,
            },
            // Mês passado
            {
                memberId: createdMembers[0].id,
                amount: "50.00",
                paymentDate: subMonths(new Date(), 1),
                paymentMethod: "pix",
                status: "completed" as const,
            },
            {
                memberId: createdMembers[1].id,
                amount: "80.00",
                paymentDate: subDays(subMonths(new Date(), 1), 5),
                paymentMethod: "pix",
                status: "completed" as const,
            },
        ];

        await db.insert(finances).values(financesData);

        console.log("✅ Seed concluído com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao popular banco de dados:");
        console.error(error);
        process.exit(1);
    }
}

seed();
