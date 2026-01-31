"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bell, Check, Trash2, X, Info, CheckCircle, AlertTriangle, AlertCircle, Calendar, DollarSign, Users, Settings } from "lucide-react";
import { IconButton, Button } from "@/components/ui/button";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/app/actions/notifications";
import type { NotificationType } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationData {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    actionUrl: string | null;
    actionLabel: string | null;
    createdAt: Date;
}

interface NotificationBellProps {
    userId: string;
    className?: string;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
    info: <Info className="h-4 w-4 text-blue-500" />,
    success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    task: <Check className="h-4 w-4 text-primary" />,
    schedule: <Calendar className="h-4 w-4 text-purple-500" />,
    finance: <DollarSign className="h-4 w-4 text-emerald-500" />,
    member: <Users className="h-4 w-4 text-blue-500" />,
    system: <Settings className="h-4 w-4 text-zinc-500" />,
};

export function NotificationBell({ userId, className }: NotificationBellProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = React.useCallback(async () => {
        try {
            setLoading(true);
            const result = await getNotifications(userId, { limit: 10 });
            setNotifications(result.notifications);
            setUnreadCount(result.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Initial fetch and polling
    React.useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Fetch when opened
    React.useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Handle click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await deleteNotification(notificationId);
            const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const handleNotificationClick = (notification: NotificationData) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };

    const formatTime = (date: Date) => {
        return formatDistanceToNow(new Date(date), {
            addSuffix: true,
            locale: ptBR,
        });
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Bell Button */}
            <IconButton
                icon={<Bell className="h-4 w-4" />}
                aria-label="Notificações"
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
            />

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
                                Notificações
                            </h3>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    Marcar todas como lidas
                                </Button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                    Carregando...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Bell className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Nenhuma notificação
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "group flex gap-3 px-4 py-3 cursor-pointer transition-colors",
                                                "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                                !notification.read && "bg-primary/5"
                                            )}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            {/* Icon */}
                                            <div className="shrink-0 mt-0.5">
                                                {typeIcons[notification.type]}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={cn(
                                                        "text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1",
                                                        !notification.read && "font-semibold"
                                                    )}>
                                                        {notification.title}
                                                    </p>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.read && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkAsRead(notification.id);
                                                                }}
                                                                className="p-1 text-zinc-400 hover:text-emerald-500 transition-colors"
                                                                title="Marcar como lida"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(notification.id);
                                                            }}
                                                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                                                    {notification.message}
                                                </p>

                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                    {notification.actionLabel && (
                                                        <span className="text-[10px] font-medium text-primary">
                                                            {notification.actionLabel} →
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Unread indicator */}
                                            {!notification.read && (
                                                <div className="shrink-0">
                                                    <span className="block h-2 w-2 rounded-full bg-primary" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-700">
                                <a
                                    href="/notifications"
                                    className="block w-full py-2 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors uppercase tracking-wider"
                                >
                                    Ver todas as notificações
                                </a>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default NotificationBell;
