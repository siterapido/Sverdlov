import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { members } from '../src/lib/db/schema/members';
import { eq, isNull, or } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const BRAZILIAN_STATES = [
    { uf: "AC", name: "Acre" },
    { uf: "AL", name: "Alagoas" },
    { uf: "AP", name: "Amapá" },
    { uf: "AM", name: "Amazonas" },
    { uf: "BA", name: "Bahia" },
    { uf: "CE", name: "Ceará" },
    { uf: "DF", name: "Distrito Federal" },
    { uf: "ES", name: "Espírito Santo" },
    { uf: "GO", name: "Goiás" },
    { uf: "MA", name: "Maranhão" },
    { uf: "MT", name: "Mato Grosso" },
    { uf: "MS", name: "Mato Grosso do Sul" },
    { uf: "MG", name: "Minas Gerais" },
    { uf: "PA", name: "Pará" },
    { uf: "PB", name: "Paraíba" },
    { uf: "PR", name: "Paraná" },
    { uf: "PE", name: "Pernambuco" },
    { uf: "PI", name: "Piauí" },
    { uf: "RJ", name: "Rio de Janeiro" },
    { uf: "RN", name: "Rio Grande do Norte" },
    { uf: "RS", name: "Rio Grande do Sul" },
    { uf: "RO", name: "Rondônia" },
    { uf: "RR", name: "Roraima" },
    { uf: "SC", name: "Santa Catarina" },
    { uf: "SP", name: "São Paulo" },
    { uf: "SE", name: "Sergipe" },
    { uf: "TO", name: "Tocantins" },
];

async function updateMembersLocation() {
    console.log('🔄 Atualizando informações de localização dos membros...\n');

    try {
        // Buscar membros sem estado ou cidade
        const membersWithoutLocation = await db
            .select()
            .from(members)
            .where(or(
                isNull(members.state),
                eq(members.state, '')
            ));

        console.log(`📊 Total de membros sem estado: ${membersWithoutLocation.length}`);

        if (membersWithoutLocation.length === 0) {
            console.log('✅ Todos os membros já possuem estado cadastrado!');
            process.exit(0);
        }

        // Para membros sem localização, vamos marcar como SP por padrão
        // (ou você pode ajustar conforme necessário)
        const defaultState = 'SP';
        const defaultCity = 'São Paulo';

        console.log(`\n📝 Atualizando ${membersWithoutLocation.length} membros para:`);
        console.log(`   Estado: ${defaultState}`);
        console.log(`   Cidade: ${defaultCity}`);

        for (const member of membersWithoutLocation) {
            await db
                .update(members)
                .set({
                    state: defaultState,
                    city: defaultCity,
                    updatedAt: new Date(),
                })
                .where(eq(members.id, member.id));

            console.log(`   ✓ ${member.fullName} (${member.email || 'sem email'})`);
        }

        console.log('\n✅ Atualização concluída com sucesso!');

        // Mostrar estatísticas
        const allMembers = await db.select().from(members);
        const stateStats: Record<string, number> = {};
        
        for (const member of allMembers) {
            const state = member.state || 'SEM ESTADO';
            stateStats[state] = (stateStats[state] || 0) + 1;
        }

        console.log('\n📊 Distribuição por estado:');
        Object.entries(stateStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([state, count]) => {
                const stateInfo = BRAZILIAN_STATES.find(s => s.uf === state);
                const label = stateInfo ? `${stateInfo.name} (${state})` : state;
                console.log(`   ${label}: ${count} membros`);
            });

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao atualizar membros:', error);
        process.exit(1);
    }
}

async function showMembersStats() {
    console.log('📊 Estatísticas dos membros\n');

    try {
        const allMembers = await db.select().from(members);
        console.log(`Total de membros: ${allMembers.length}`);

        // Por estado
        const stateStats: Record<string, number> = {};
        const cityStats: Record<string, number> = {};
        const statusStats: Record<string, number> = {};

        for (const member of allMembers) {
            const state = member.state || 'SEM ESTADO';
            const city = member.city || 'SEM CIDADE';
            const status = member.status || 'unknown';

            stateStats[state] = (stateStats[state] || 0) + 1;
            cityStats[city] = (cityStats[city] || 0) + 1;
            statusStats[status] = (statusStats[status] || 0) + 1;
        }

        console.log('\n📍 Por estado:');
        Object.entries(stateStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([state, count]) => {
                const stateInfo = BRAZILIAN_STATES.find(s => s.uf === state);
                const label = stateInfo ? `${stateInfo.name} (${state})` : state;
                console.log(`   ${label}: ${count}`);
            });

        console.log('\n📍 Por cidade:');
        Object.entries(cityStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([city, count]) => {
                console.log(`   ${city}: ${count}`);
            });

        console.log('\n📊 Por status:');
        Object.entries(statusStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([status, count]) => {
                console.log(`   ${status}: ${count}`);
            });

        // Membros sem estado
        const withoutState = allMembers.filter(m => !m.state || m.state === '');
        if (withoutState.length > 0) {
            console.log(`\n⚠️  Membros sem estado: ${withoutState.length}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'stats';

if (command === 'update') {
    updateMembersLocation();
} else {
    showMembersStats();
}
