import dotenv from 'dotenv';
import path from 'path';

// Carrega especificamente o .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Imports dinâmicos serão usados dentro da função para garantir carregamento do dotenv
import { count, desc } from "drizzle-orm";

async function testConnection() {
    console.log("🚀 Testando conexão com o banco de dados...");

    // Importa db e schema DEPOIS de carregar o dotenv
    const { db } = await import("./index");
    const { members } = await import("./schema");

    try {
        const result = await db.select({ value: count() }).from(members);
        console.log("✅ Conexão estabelecida com sucesso!");
        console.log(`📊 Total de membros no banco: ${result[0].value}`);

        console.log("\n🔍 Testando query de membros recentes...");
        const recentMembers = await db
            .select()
            .from(members)
            .orderBy(desc(members.createdAt))
            .limit(5);

        console.log(`✅ Query executada com sucesso! ${recentMembers.length} membros encontrados.`);
        if (recentMembers.length > 0) {
            console.log("\n📋 Primeiros membros:");
            recentMembers.forEach((m: any, i: number) => {
                console.log(`  ${i + 1}. ${m.socialName || m.fullName} (${m.status})`);
            });
        }
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:");
        console.error(error);
        process.exit(1);
    }
}

testConnection();
