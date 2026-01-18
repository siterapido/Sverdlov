import { db } from "./index";
import { members } from "./schema";
import { count } from "drizzle-orm";

async function testConnection() {
    console.log("🚀 Testando conexão com o banco de dados...");
    try {
        const result = await db.select({ value: count() }).from(members);
        console.log("✅ Conexão estabelecida com sucesso!");
        console.log(`📊 Total de membros no banco: ${result[0].value}`);
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:");
        console.error(error);
        process.exit(1);
    }
}

testConnection();
