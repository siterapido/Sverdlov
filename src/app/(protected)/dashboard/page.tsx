import { PageTransition } from '@/components/ui/page-transition';

export default function DashboardPage() {
    // Mock data - will be replaced with real data from API
    const stats = {
        totalMembers: 0,
        newLeadsThisMonth: 0,
        conversionRate: 0,
        monthlyRevenue: 0,
        activeNuclei: 0,
    };

    return (
        <PageTransition>
            <div className="container mx-auto py-12 px-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-fg-primary">Dashboard</h1>
                    <p className="text-fg-secondary">Visão geral da organização</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Membros Ativos"
                        value={stats.totalMembers}
                        icon="👥"
                    />
                    <StatCard
                        title="Novos Interessados"
                        value={stats.newLeadsThisMonth}
                        subtitle="Este mês"
                        icon="📈"
                    />
                    <StatCard
                        title="Taxa de Conversão"
                        value={`${stats.conversionRate}%`}
                        icon="🎯"
                    />
                    <StatCard
                        title="Receita Mensal"
                        value={`R$ ${stats.monthlyRevenue.toFixed(2)}`}
                        icon="💰"
                    />
                    <StatCard
                        title="Núcleos Ativos"
                        value={stats.activeNuclei}
                        icon="🏛️"
                    />
                </div>

                <div className="mt-8 notion-card p-6">
                    <h2 className="text-xl font-semibold mb-4 text-fg-primary">Ações Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ActionButton href="/members" label="Cadastrar Membro" />
                        <ActionButton href="/filie-se" label="Ver Formulário Público" />
                        <ActionButton href="/members" label="Gerenciar Membros" />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

function StatCard({ title, value, subtitle, icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
}) {
    return (
        <div className="notion-card p-4 hover:bg-bg-hover transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
            </div>
            <h3 className="text-sm font-medium text-fg-secondary mb-1">{title}</h3>
            <p className="text-2xl font-semibold text-fg-primary">{value}</p>
            {subtitle && <p className="text-xs text-fg-secondary mt-1">{subtitle}</p>}
        </div>
    );
}

function ActionButton({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            className="block p-3 text-center rounded-sm border border-border-subtle hover:bg-bg-hover text-sm font-medium text-fg-primary transition-colors"
        >
            {label}
        </a>
    );
}
