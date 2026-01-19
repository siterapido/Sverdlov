"use client";

import {
    Users,
    TrendingUp,
    DollarSign,
    Target,
    Building2,
    ArrowUpRight,
    UserPlus,
    FileText,
    Calendar
} from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { StatCard, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter, AnimatedCurrency } from "@/components/ui/animated-counter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import Link from "next/link";

interface DashboardClientProps {
    data: {
        stats: {
            totalMembers: number;
            newLeadsThisMonth: number;
            memberTrend: { value: number; isPositive: boolean };
            monthlyRevenue: number;
            revenueTrend: { value: number; isPositive: boolean };
            activeNuclei: number;
            conversionRate: number;
        };
        recentMembers: Array<{
            id: string;
            name: string;
            status: string;
        }>;
    };
}

export function DashboardClient({ data }: DashboardClientProps) {
    const { stats, recentMembers } = data;

    // Hardcoded for now as placeholders in the client
    const upcomingEvents = [
        { title: "Reunião Núcleo Centro", date: "Hoje, 19h", type: "meeting" },
        { title: "Formação Política", date: "Amanhã, 14h", type: "training" },
        { title: "Assembleia Municipal", date: "Sab, 10h", type: "assembly" },
    ];

    return (
        <PageTransition>
            <div className="max-w-6xl">
                {/* Header */}
                <div className="mb-10 border-b border-border pb-6">
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 leading-none">
                        Dashboard
                    </h1>
                    <p className="text-muted font-medium mt-2">
                        Visão geral da organização em tempo real
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 mb-10 border border-border divide-x divide-y md:divide-y-0 divide-border">
                    <StatCard
                        title="Membros Ativos"
                        value={<AnimatedCounter value={stats.totalMembers} />}
                        icon={<Users className="h-4 w-4" />}
                        className="border-0"
                    />

                    <StatCard
                        title="Novos (Mês)"
                        value={<AnimatedCounter value={stats.newLeadsThisMonth} />}
                        subtitle="Novas filiações"
                        icon={<TrendingUp className="h-4 w-4" />}
                        trend={stats.memberTrend}
                        className="border-0"
                    />

                    <StatCard
                        title="Taxa Conversão"
                        value={`${stats.conversionRate}%`}
                        icon={<Target className="h-4 w-4" />}
                        className="border-0"
                    />

                    <StatCard
                        title="Receita Mensal"
                        value={<AnimatedCurrency value={stats.monthlyRevenue} />}
                        icon={<DollarSign className="h-4 w-4" />}
                        trend={stats.revenueTrend}
                        className="border-0"
                    />

                    <StatCard
                        title="Núcleos"
                        value={<AnimatedCounter value={stats.activeNuclei} />}
                        icon={<Building2 className="h-4 w-4" />}
                        className="border-0"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <Card bordered className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Ações Rápidas</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <ActionCard
                                        href="/members?action=new"
                                        icon={<UserPlus className="h-4 w-4" />}
                                        label="Novo Membro"
                                        description="Cadastrar filiado"
                                    />
                                    <ActionCard
                                        href="/filie-se"
                                        icon={<FileText className="h-4 w-4" />}
                                        label="Formulário"
                                        description="Ver página pública"
                                    />
                                    <ActionCard
                                        href="/members"
                                        icon={<Users className="h-4 w-4" />}
                                        label="Membros"
                                        description="Gerenciar filiados"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Events */}
                    <div>
                        <Card bordered className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Próximos Eventos</span>
                                    <Link href="/calendar">
                                        <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-zinc-900 font-bold uppercase text-[10px] tracking-widest">
                                            Ver todos
                                        </Button>
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                    <div className="space-y-1">
                                        {upcomingEvents.map((event, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-4 p-4 hover:bg-surface-hover transition-all cursor-pointer border-b border-zinc-50 last:border-0 dark:border-zinc-900"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-none bg-primary text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-zinc-900 truncate">
                                                        {event.title}
                                                    </p>
                                                    <p className="text-[11px] font-medium text-muted uppercase tracking-wider">
                                                        {event.date}
                                                    </p>
                                                </div>
                                                <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Members */}
                    <div className="lg:col-span-2">
                        <Card bordered>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Membros Recentes</span>
                                    <div className="flex items-center gap-3">
                                        <Link href="/members">
                                            <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-zinc-900 font-bold uppercase text-[10px] tracking-widest">
                                                Ver todos
                                            </Button>
                                        </Link>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                                    {recentMembers.length > 0 ? (
                                        recentMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-4 p-4 hover:bg-surface-hover transition-all cursor-pointer group"
                                            >
                                                <Avatar fallback={member.name} size="md" className="bg-zinc-100 text-zinc-900 rounded-none border border-border group-hover:border-primary transition-colors" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-zinc-900">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-[11px] font-medium text-muted uppercase tracking-wider mt-0.5">
                                                        Filiado Recente
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={member.status === "active" ? "green" : "yellow"}
                                                    className="rounded-none font-black uppercase text-[9px] px-2 py-0.5"
                                                >
                                                    {getStatusLabel(member.status)}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-zinc-500 text-center py-10 font-medium">Nenhum membro recente</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Chart Placeholder */}
                    <div>
                        <Card bordered className="h-full">
                            <CardHeader>
                                <CardTitle>Atividade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center h-48 text-zinc-300 dark:text-zinc-700">
                                    <TrendingUp className="h-10 w-10 mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Gráfico em breve</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageTransition>
    );

    function getStatusLabel(status: string) {
        const labels: Record<string, string> = {
            active: "Ativo",
            interested: "Interessado",
            in_formation: "Em Formação",
            inactive: "Inativo"
        };
        return labels[status] || status;
    }
}

// === Action Card Component ===
function ActionCard({
    href,
    icon,
    label,
    description,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
}) {
    return (
        <Link href={href}>
            <div className="group relative p-6 border border-border bg-white hover:border-primary transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,82,255,0.1)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-none bg-zinc-50 text-muted mb-4 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                    {icon}
                </div>
                <h3 className="text-sm font-black text-zinc-900 mb-1 uppercase tracking-tight">
                    {label}
                </h3>
                <p className="text-[11px] font-medium text-muted leading-relaxed">
                    {description}
                </p>
                <ArrowUpRight className="absolute top-6 right-6 h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
        </Link>
    );
}
