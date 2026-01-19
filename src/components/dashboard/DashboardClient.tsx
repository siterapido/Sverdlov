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
            <div className="max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Dashboard
                    </h1>
                    <p className="text-zinc-500 mt-1 dark:text-zinc-400">
                        Visão geral da organização em tempo real
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        title="Membros Ativos"
                        value={<AnimatedCounter value={stats.totalMembers} />}
                        icon={<Users className="h-4 w-4" />}
                        variant="blue"
                    />

                    <StatCard
                        title="Novos (Mês)"
                        value={<AnimatedCounter value={stats.newLeadsThisMonth} />}
                        subtitle="Novas filiações"
                        icon={<TrendingUp className="h-4 w-4" />}
                        trend={stats.memberTrend}
                        variant="green"
                    />

                    <StatCard
                        title="Taxa Conversão"
                        value={`${stats.conversionRate}%`}
                        icon={<Target className="h-4 w-4" />}
                        variant="yellow"
                    />

                    <StatCard
                        title="Receita Mensal"
                        value={<AnimatedCurrency value={stats.monthlyRevenue} />}
                        icon={<DollarSign className="h-4 w-4" />}
                        trend={stats.revenueTrend}
                    />

                    <StatCard
                        title="Núcleos"
                        value={<AnimatedCounter value={stats.activeNuclei} />}
                        icon={<Building2 className="h-4 w-4" />}
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
                                        <Button variant="ghost" size="sm" className="h-8">
                                            Ver todos
                                        </Button>
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {upcomingEvents.map((event, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:bg-zinc-800 dark:hover:border-zinc-700"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                                                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-zinc-900 truncate dark:text-zinc-50">
                                                    {event.title}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {event.date}
                                                </p>
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
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
                                        <AvatarGroup max={3}>
                                            {recentMembers.map((member, i) => (
                                                <Avatar key={i} fallback={member.name} size="sm" />
                                            ))}
                                        </AvatarGroup>
                                        <Link href="/members">
                                            <Button variant="ghost" size="sm" className="h-8">
                                                Ver todos
                                            </Button>
                                        </Link>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    {recentMembers.length > 0 ? (
                                        recentMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:bg-zinc-800 dark:hover:border-zinc-700"
                                            >
                                                <Avatar fallback={member.name} size="md" className="bg-zinc-200 text-zinc-600" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                                                        Cadastrado recentemente
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={member.status === "active" ? "green" : "yellow"}
                                                    dot
                                                    dotColor={member.status === "active" ? "green" : "yellow"}
                                                    className="shadow-none border-0"
                                                >
                                                    {getStatusLabel(member.status)}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-zinc-500 text-center py-6">Nenhum membro recente</p>
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
            <div className="group relative rounded-lg p-5 border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 text-zinc-900 mb-3 group-hover:bg-zinc-900 group-hover:text-white transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                    {icon}
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1 dark:text-zinc-50">
                    {label}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {description}
                </p>
                <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
        </Link>
    );
}
