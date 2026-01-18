import { getDashboardStats } from "./dashboard";

async function testAction() {
    console.log("🧪 Testando Server Action: getDashboardStats...");
    try {
        const data = await getDashboardStats();
        console.log("✅ Action executada com sucesso!");
        console.log("📊 Dados retornados:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("❌ Erro ao executar Action:");
        console.error(error);
    }
}

testAction();
