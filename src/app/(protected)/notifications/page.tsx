"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { EmptyData } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
} from "@/app/actions/notifications";
import type { NotificationType } from "@/lib/db/schema";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    RefreshCw,
    Filter,
    Info,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Calendar,
    DollarSign,
    Users,
    Settings,
    ExternalLink,
} from "lucide-react";

interface NotificationData {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    actionUrl: string | null;
    actionLabel: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    readAt: Date | null;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    task: <Check className="h-5 w-5 text-primary" />,
    schedule: <Calendar className="h-5 w-5 text-purple-500" />,
    finance: <DollarSign className="h-5 w-5 text-emerald-500" />,
    member: <Users className="h-5 w-5 text-blue-500" />,
    system: <Settings className="h-5 w-5 text-zinc-500" />,
};

const typeLabels: Record<NotificationType, string> = {
    info: "Informativo",
    success: "Sucesso",
    warning: "Aviso",
    error: "Erro",
    task: "Tarefa",
    schedule: "Escala",
    finance: "Financeiro",
    member: "Membro",
    system: "Sistema",
};

const typeColors: Record<NotificationType, string> = {
    info: "bg-blue-100 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
    task: "bg-primary/10 text-primary",
    schedule: "bg-purple-100 text-purple-700",
    finance: "bg-emerald-100 text-emerald-700",
    member: "bg-blue-100 text-blue-700",
    system: "bg-zinc-100 text-zinc-700",
};

const filterOptions: SelectOption[] = [
    { value: "", label: "Todas as notificacoes" },
    { value: "unread", label: "Nao lidas" },
    { value: "read", label: "Lidas" },
];

const typeFilterOptions: SelectOption[] = [
    { value: "", label: "Todos os tipos" },
    { value: "info", label: "Informativo" },
    { value: "success", label: "Sucesso" },
    { value: "warning", label: "Aviso" },
    { value: "error", label: "Erro" },
    { value: "task", label: "Tarefa" },
    { value: "schedule", label: "Escala" },
    { value: "finance", label: "Financeiro" },
    { value: "member", label: "Membro" },
    { value: "system", label: "Sistema" },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 20;

    // Get userId from a cookie or context - for now we'll need to get it from the layout
    // This is a simplified version - in production you'd use a proper auth context
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get userId from cookie or auth context
        const getUserId = async () => {
            try {
                const response = await fetch("/api/auth/me");
                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.id);
                }
            } catch (error) {
                console.error("Failed to get user:", error);
            }
        };
        getUserId();
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const result = await getNotifications(userId, {
                unreadOnly: filter === "unread",
                limit: pageSize,
                offset: (page - 1) * pageSize,
                type: typeFilter as NotificationType | undefined,
            });
            setNotifications(result.notifications);
            setUnreadCount(result.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, filter, typeFilter, page]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;
        try {
            await markAllAsRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
            await deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const handleDeleteRead = async () => {
        if (!userId) return;
        try {
            await deleteReadNotifications(userId);
            setNotifications(prev => prev.filter(n => !n.read));
        } catch (error) {
            console.error("Failed to delete read notifications:", error);
        }
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

    // Filter notifications based on read status
    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.read;
        if (filter === "read") return n.read;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">
                        Notificacoes
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {unreadCount > 0
                            ? `Voce tem ${unreadCount} notificacao${unreadCount > 1 ? "oes" : ""} nao lida${unreadCount > 1 ? "s" : ""}`
                            : "Todas as notificacoes foram lidas"
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchNotifications}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                    >
                        Atualizar
                    </Button>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            leftIcon={<CheckCheck className="h-4 w-4" />}
                        >
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-500">Filtrar:</span>
                        </div>
                        <Select
                            options={filterOptions}
                            value={filter}
                            onChange={(v) => {
                                setFilter(v as string);
                                setPage(1);
                            }}
                            placeholder="Status"
                            selectSize="sm"
                            className="w-48"
                        />
                        <Select
                            options={typeFilterOptions}
                            value={typeFilter}
                            onChange={(v) => {
                                setTypeFilter(v as string);
                                setPage(1);
                            }}
                            placeholder="Tipo"
                            selectSize="sm"
                            className="w-48"
                        />
                        {notifications.some(n => n.read) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDeleteRead}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                                leftIcon={<Trash2 className="h-4 w-4" />}
                            >
                                Excluir lidas
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-zinc-500">
                            Carregando notificacoes...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="py-12">
                            <EmptyData
                                title="Nenhuma notificacao"
                                description={
                                    filter === "unread"
                                        ? "Voce nao tem notificacoes nao lidas"
                                        : "Voce nao tem notificacoes"
                                }
                            />
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-4 p-4 transition-colors",
                                        "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                        !notification.read && "bg-primary/5"
                                    )}
                                >
                                    {/* Icon */}
                                    <div className="shrink-0 mt-0.5">
                                        {typeIcons[notification.type]}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={cn(
                                                        "text-sm text-zinc-900 dark:text-zinc-100",
                                                        !notification.read && "font-semibold"
                                                    )}>
                                                        {notification.title}
                                                    </h3>
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 font-medium",
                                                        typeColors[notification.type]
                                                    )}>
                                                        {typeLabels[notification.type]}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs text-zinc-400">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                    {notification.actionUrl && (
                                                        <a
                                                            href={notification.actionUrl}
                                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            {notification.actionLabel || "Ver detalhes"}
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        title="Marcar como lida"
                                                    >
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleDelete(notification.id)}
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.read && (
                                        <div className="shrink-0 mt-2">
                                            <span className="block h-2 w-2 rounded-full bg-primary" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {filteredNotifications.length >= pageSize && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Anterior
                    </Button>
                    <span className="flex items-center px-3 text-sm text-zinc-500">
                        Pagina {page}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={filteredNotifications.length < pageSize}
                    >
                        Proxima
                    </Button>
                </div>
            )}
        </div>
    );
}
