"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyData } from "@/components/ui/empty-state";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Plus,
    Pencil,
    Trash2,
    LogIn,
    LogOut,
    FileUp,
    FileDown,
    Eye,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    User,
    DollarSign,
    Calendar,
    MapPin,
} from "lucide-react";

interface AuditLogEntry {
    id: string;
    action: string;
    tableName: string;
    changedFields: Record<string, { old: unknown; new: unknown }> | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    user: {
        id: string;
        fullName: string;
        email: string;
    } | null;
}

interface MemberActivityTabProps {
    memberId: string;
    className?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
    CREATE: <Plus className="h-4 w-4" />,
    UPDATE: <Pencil className="h-4 w-4" />,
    DELETE: <Trash2 className="h-4 w-4" />,
    LOGIN: <LogIn className="h-4 w-4" />,
    LOGOUT: <LogOut className="h-4 w-4" />,
    EXPORT: <FileDown className="h-4 w-4" />,
    IMPORT: <FileUp className="h-4 w-4" />,
    VIEW: <Eye className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
    CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
    DELETE: "bg-red-100 text-red-700 border-red-200",
    LOGIN: "bg-purple-100 text-purple-700 border-purple-200",
    LOGOUT: "bg-zinc-100 text-zinc-700 border-zinc-200",
    EXPORT: "bg-amber-100 text-amber-700 border-amber-200",
    IMPORT: "bg-cyan-100 text-cyan-700 border-cyan-200",
    VIEW: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const actionLabels: Record<string, string> = {
    CREATE: "Cadastrado",
    UPDATE: "Atualizado",
    DELETE: "Removido",
    LOGIN: "Login",
    LOGOUT: "Logout",
    EXPORT: "Exportado",
    IMPORT: "Importado",
    VIEW: "Visualizado",
};

const fieldLabels: Record<string, string> = {
    fullName: "Nome completo",
    socialName: "Nome social",
    email: "Email",
    phone: "Telefone",
    status: "Status",
    militancyLevel: "Nivel de militancia",
    nucleusId: "Nucleo",
    state: "Estado",
    city: "Cidade",
    zone: "Zona",
    planId: "Plano",
    financialStatus: "Situacao financeira",
    notes: "Observacoes",
    politicalResponsibleId: "Responsavel politico",
};

const statusLabels: Record<string, string> = {
    interested: "Interessado",
    in_formation: "Em formacao",
    active: "Ativo",
    inactive: "Inativo",
};

const militancyLabels: Record<string, string> = {
    supporter: "Apoiador",
    militant: "Militante",
    leader: "Dirigente",
};

export function MemberActivityTab({ memberId, className }: MemberActivityTabProps) {
    const [activities, setActivities] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchActivities();
    }, [memberId]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/members/${memberId}/activity`);
            if (response.ok) {
                const data = await response.json();
                setActivities(data.activities || []);
            }
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = (id: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const formatValue = (field: string, value: unknown): string => {
        if (value === null || value === undefined) return "-";

        if (field === "status" && typeof value === "string") {
            return statusLabels[value] || value;
        }
        if (field === "militancyLevel" && typeof value === "string") {
            return militancyLabels[value] || value;
        }
        if (field.includes("Date") && value) {
            try {
                return format(new Date(value as string), "dd/MM/yyyy", { locale: ptBR });
            } catch {
                return String(value);
            }
        }

        return String(value);
    };

    const formatTime = (date: Date) => {
        const d = new Date(date);
        const now = new Date();
        const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
        } else {
            return format(d, "dd/MM/yyyy 'as' HH:mm", { locale: ptBR });
        }
    };

    const getActivityDescription = (activity: AuditLogEntry): string => {
        const { action, changedFields, metadata } = activity;

        if (action === "CREATE") {
            return "Membro cadastrado no sistema";
        }

        if (action === "UPDATE" && changedFields) {
            const fields = Object.keys(changedFields);
            if (fields.includes("status")) {
                const newStatus = changedFields.status?.new;
                return `Status alterado para ${statusLabels[newStatus as string] || newStatus}`;
            }
            if (fields.includes("nucleusId")) {
                return "Vinculado a um nucleo";
            }
            if (fields.includes("planId")) {
                return "Plano de contribuicao alterado";
            }
            return `${fields.length} campo${fields.length > 1 ? "s" : ""} atualizado${fields.length > 1 ? "s" : ""}`;
        }

        if (action === "DELETE") {
            return "Membro removido do sistema";
        }

        return actionLabels[action] || action;
    };

    if (loading) {
        return (
            <div className={cn("py-8 text-center text-sm text-zinc-500", className)}>
                Carregando historico...
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className={cn("py-8", className)}>
                <EmptyData
                    title="Nenhuma atividade"
                    description="Nao ha registros de atividade para este membro"
                />
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                    Historico de Atividades
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchActivities}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                    Atualizar
                </Button>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />

                {/* Activities */}
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const isExpanded = expandedItems.has(activity.id);
                        const hasDetails = activity.changedFields && Object.keys(activity.changedFields).length > 0;

                        return (
                            <div key={activity.id} className="relative pl-10">
                                {/* Timeline dot */}
                                <div
                                    className={cn(
                                        "absolute left-2 top-2 h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                        actionColors[activity.action]
                                    )}
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                </div>

                                {/* Activity card */}
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Action badge and description */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium",
                                                        actionColors[activity.action]
                                                    )}
                                                >
                                                    {actionIcons[activity.action]}
                                                    {actionLabels[activity.action]}
                                                </span>
                                            </div>

                                            <p className="text-sm text-zinc-900 dark:text-zinc-100">
                                                {getActivityDescription(activity)}
                                            </p>

                                            {/* Meta info */}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                                                <span>{formatTime(activity.createdAt)}</span>
                                                {activity.user && (
                                                    <>
                                                        <span>-</span>
                                                        <span>por {activity.user.fullName}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expand button */}
                                        {hasDetails && (
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => toggleExpanded(activity.id)}
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Expanded details */}
                                    {isExpanded && hasDetails && (
                                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-3">
                                                Alteracoes
                                            </h4>
                                            <div className="space-y-2">
                                                {Object.entries(activity.changedFields!).map(
                                                    ([field, change]) => (
                                                        <div
                                                            key={field}
                                                            className="flex items-start gap-2 text-sm"
                                                        >
                                                            <span className="font-medium text-zinc-600 dark:text-zinc-400 w-32 shrink-0">
                                                                {fieldLabels[field] || field}:
                                                            </span>
                                                            <span className="text-red-500 line-through">
                                                                {formatValue(field, change.old)}
                                                            </span>
                                                            <span className="text-zinc-400">→</span>
                                                            <span className="text-emerald-600 font-medium">
                                                                {formatValue(field, change.new)}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default MemberActivityTab;
