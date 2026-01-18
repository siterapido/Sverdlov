"use client";

import { motion } from "framer-motion";
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

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15,
        },
    },
} as const;

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
            <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-fg-primary">
                        Dashboard
                    </h1>
                    <p className="text-fg-secondary mt-1">
                        Visão geral da organização • Atualizado agora
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Membros Ativos"
                            value={<AnimatedCounter value={stats.totalMembers} />}
                            icon={<Users className="h-5 w-5 text-white" />}
                            variant="primary"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Novos (Mês)"
                            value={<AnimatedCounter value={stats.newLeadsThisMonth} />}
                            subtitle="Novas filiações"
                            icon={<TrendingUp className="h-5 w-5 text-white" />}
                            trend={stats.memberTrend}
                            variant="secondary"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Taxa de Conversão"
                            value={`${stats.conversionRate}%`}
                            icon={<Target className="h-5 w-5 text-white" />}
                            variant="accent"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Receita Mensal"
                            value={<AnimatedCurrency value={stats.monthlyRevenue} />}
                            icon={<DollarSign className="h-5 w-5" />}
                            trend={stats.revenueTrend}
                            variant="default"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Núcleos Ativos"
                            value={<AnimatedCounter value={stats.activeNuclei} />}
                            icon={<Building2 className="h-5 w-5" />}
                            variant="default"
                        />
                    </motion.div>
                </motion.div>

                {/* Main Content Grid */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Quick Actions */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card hover={false} className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Ações Rápidas</span>
                                    <Badge variant="secondary">Atalhos</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <ActionCard
                                        href="/members?action=new"
                                        icon={<UserPlus className="h-5 w-5" />}
                                        label="Novo Membro"
                                        description="Cadastrar filiado"
                                        color="primary"
                                    />
                                    <ActionCard
                                        href="/filie-se"
                                        icon={<FileText className="h-5 w-5" />}
                                        label="Formulário"
                                        description="Ver página pública"
                                        color="secondary"
                                    />
                                    <ActionCard
                                        href="/members"
                                        icon={<Users className="h-5 w-5" />}
                                        label="Membros"
                                        description="Gerenciar filiados"
                                        color="accent"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Upcoming Events */}
                    <motion.div variants={itemVariants}>
                        <Card hover={false} className="h-full">
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
                                <div className="space-y-3">
                                    {upcomingEvents.map((event, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-hover transition-colors cursor-pointer"
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                                                <Calendar className="h-5 w-5 text-primary-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-fg-primary truncate">
                                                    {event.title}
                                                </p>
                                                <p className="text-xs text-fg-secondary">
                                                    {event.date}
                                                </p>
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-fg-tertiary" />
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Members */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card hover={false}>
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
                                <div className="space-y-2">
                                    {recentMembers.length > 0 ? (
                                        recentMembers.map((member, index) => (
                                            <motion.div
                                                key={member.id}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
                                                whileHover={{ x: 4 }}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Avatar fallback={member.name} size="sm" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-fg-primary">
                                                        {member.name}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={member.status === "active" ? "success" : "warning"}
                                                    dot
                                                    dotColor={member.status === "active" ? "success" : "warning"}
                                                >
                                                    {getStatusLabel(member.status)}
                                                </Badge>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-fg-secondary text-center py-4">Nenhum membro recente</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Activity Chart Placeholder */}
                    <motion.div variants={itemVariants}>
                        <Card hover={false} className="h-full">
                            <CardHeader>
                                <CardTitle>Atividade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center h-40 text-fg-tertiary">
                                    <TrendingUp className="h-10 w-10 mb-2 opacity-30" />
                                    <p className="text-sm">Gráfico em breve</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
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
    color,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    color: "primary" | "secondary" | "accent";
}) {
    const colorClasses = {
        primary: "from-primary-500 to-primary-600",
        secondary: "from-secondary-500 to-secondary-600",
        accent: "from-accent-500 to-accent-600",
    };

    return (
        <Link href={href}>
            <motion.div
                className="group relative overflow-hidden rounded-xl p-4 bg-bg-tertiary hover:bg-bg-hover transition-all cursor-pointer border border-border-subtle"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white mb-3 shadow-lg`}>
                    {icon}
                </div>
                <h3 className="text-sm font-semibold text-fg-primary mb-1">
                    {label}
                </h3>
                <p className="text-xs text-fg-secondary">
                    {description}
                </p>
                <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-fg-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
        </Link>
    );
}
