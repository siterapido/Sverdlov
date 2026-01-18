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
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-fg-primary">
                        Dashboard
                    </h1>
                    <p className="text-sm text-fg-secondary mt-0.5">
                        Visão geral da organização
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <Card bordered className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Ações Rápidas</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                        <Button variant="ghost" size="sm">
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
                                            className="flex items-center gap-3 p-2 rounded-[4px] hover:bg-bg-hover transition-colors cursor-pointer"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-accent-light">
                                                <Calendar className="h-4 w-4 text-accent" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-fg-primary truncate">
                                                    {event.title}
                                                </p>
                                                <p className="text-xs text-fg-muted">
                                                    {event.date}
                                                </p>
                                            </div>
                                            <ArrowUpRight className="h-3.5 w-3.5 text-fg-muted" />
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
                                    <div className="flex items-center gap-2">
                                        <AvatarGroup max={3}>
                                            {recentMembers.map((member, i) => (
                                                <Avatar key={i} fallback={member.name} size="sm" />
                                            ))}
                                        </AvatarGroup>
                                        <Link href="/members">
                                            <Button variant="ghost" size="sm">
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
                                                className="flex items-center gap-3 p-2 rounded-[4px] hover:bg-bg-hover transition-colors cursor-pointer"
                                            >
                                                <Avatar fallback={member.name} size="sm" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-fg-primary">
                                                        {member.name}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={member.status === "active" ? "green" : "yellow"}
                                                    dot
                                                    dotColor={member.status === "active" ? "green" : "yellow"}
                                                >
                                                    {getStatusLabel(member.status)}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-fg-muted text-center py-4">Nenhum membro recente</p>
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
                                <div className="flex flex-col items-center justify-center h-32 text-fg-muted">
                                    <TrendingUp className="h-8 w-8 mb-2 opacity-30" />
                                    <p className="text-xs">Gráfico em breve</p>
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
            <div className="group relative rounded-[4px] p-3 border border-border-default hover:bg-bg-hover transition-colors cursor-pointer">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] bg-accent-light text-accent mb-2">
                    {icon}
                </div>
                <h3 className="text-sm font-medium text-fg-primary mb-0.5">
                    {label}
                </h3>
                <p className="text-xs text-fg-muted">
                    {description}
                </p>
                <ArrowUpRight className="absolute top-3 right-3 h-3.5 w-3.5 text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </Link>
    );
}
