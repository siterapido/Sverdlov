"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    Menu,
    Bell,
    Search,
    ChevronRight,
    Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBadge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeProvider";

interface AppHeaderProps {
    toggleSidebar: () => void;
    isMobile: boolean;
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, { label: string; icon?: React.ReactNode }> = {
    dashboard: { label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    members: { label: "Membros" },
    escalas: { label: "Escalas" },
    finance: { label: "Financeiro" },
    calendar: { label: "Calendário" },
    chat: { label: "Chat" },
    settings: { label: "Configurações" },
};

export function AppHeader({ toggleSidebar, isMobile }: AppHeaderProps) {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Generate breadcrumbs from pathname
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
        const path = "/" + pathSegments.slice(0, index + 1).join("/");
        const config = breadcrumbMap[segment] || { label: segment };
        return {
            label: config.label,
            path,
            icon: config.icon,
            isLast: index === pathSegments.length - 1,
        };
    });

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
                "sticky top-0 z-30",
                "flex h-16 items-center justify-between gap-4 px-4 md:px-6",
                "bg-bg-primary/80 backdrop-blur-xl",
                "border-b border-border-subtle"
            )}
        >
            {/* Left Side */}
            <div className="flex items-center gap-4">
                {/* Mobile menu toggle */}
                {isMobile && (
                    <IconButton
                        icon={<Menu className="h-5 w-5" />}
                        aria-label="Toggle menu"
                        variant="ghost"
                        onClick={toggleSidebar}
                    />
                )}

                {/* Breadcrumbs */}
                <nav className="hidden md:flex items-center gap-1 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.path}>
                            {index > 0 && (
                                <ChevronRight className="h-4 w-4 text-fg-tertiary" />
                            )}
                            <motion.a
                                href={crumb.path}
                                className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                                    crumb.isLast
                                        ? "text-fg-primary font-medium"
                                        : "text-fg-secondary hover:text-fg-primary hover:bg-bg-hover"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {crumb.icon}
                                {crumb.label}
                            </motion.a>
                        </React.Fragment>
                    ))}
                </nav>

                {/* Mobile: Page title */}
                {isMobile && breadcrumbs.length > 0 && (
                    <h1 className="text-lg font-semibold text-fg-primary">
                        {breadcrumbs[breadcrumbs.length - 1]?.label}
                    </h1>
                )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="hidden md:block relative">
                    {searchOpen ? (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="relative"
                        >
                            <SearchInput
                                placeholder="Buscar..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onClear={() => setSearchValue("")}
                                inputSize="sm"
                                className="pr-8"
                                autoFocus
                                onBlur={() => {
                                    if (!searchValue) setSearchOpen(false);
                                }}
                            />
                        </motion.div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchOpen(true)}
                            leftIcon={<Search className="h-4 w-4" />}
                            className="text-fg-secondary"
                        >
                            Buscar
                            <kbd className="ml-2 hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border-subtle bg-bg-tertiary px-1.5 text-[10px] font-medium text-fg-tertiary">
                                ⌘K
                            </kbd>
                        </Button>
                    )}
                </div>

                {/* Mobile search button */}
                {isMobile && (
                    <IconButton
                        icon={<Search className="h-5 w-5" />}
                        aria-label="Search"
                        variant="ghost"
                    />
                )}

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <div className="relative">
                    <IconButton
                        icon={<Bell className="h-5 w-5" />}
                        aria-label="Notifications"
                        variant="ghost"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                    />
                    <NotificationBadge count={3} />

                    {/* Notification dropdown */}
                    {notificationsOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setNotificationsOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                className={cn(
                                    "absolute right-0 top-full mt-2 z-50",
                                    "w-80 rounded-xl border border-border-subtle",
                                    "bg-bg-secondary shadow-xl overflow-hidden"
                                )}
                            >
                                <div className="p-4 border-b border-border-subtle">
                                    <h3 className="font-semibold text-fg-primary">Notificações</h3>
                                    <p className="text-xs text-fg-secondary">3 novas notificações</p>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    <NotificationItem
                                        title="Novo membro cadastrado"
                                        description="João Silva foi adicionado ao sistema"
                                        time="Há 5 minutos"
                                        unread
                                    />
                                    <NotificationItem
                                        title="Contribuição recebida"
                                        description="R$ 50,00 de Maria Santos"
                                        time="Há 1 hora"
                                        unread
                                    />
                                    <NotificationItem
                                        title="Reunião agendada"
                                        description="Amanhã às 19h - Núcleo Centro"
                                        time="Há 2 horas"
                                        unread
                                    />
                                </div>
                                <div className="p-3 border-t border-border-subtle">
                                    <Button variant="ghost" size="sm" className="w-full">
                                        Ver todas as notificações
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* User Avatar (mobile only - desktop shows in sidebar) */}
                {isMobile && (
                    <Avatar
                        size="sm"
                        fallback="UP"
                        status="online"
                    />
                )}
            </div>
        </motion.header>
    );
}

// === Notification Item ===
function NotificationItem({
    title,
    description,
    time,
    unread = false,
}: {
    title: string;
    description: string;
    time: string;
    unread?: boolean;
}) {
    return (
        <motion.div
            className={cn(
                "flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-bg-hover",
                unread && "bg-primary-500/5"
            )}
            whileHover={{ x: 4 }}
        >
            <div className="shrink-0 mt-1">
                {unread && (
                    <span className="block h-2 w-2 rounded-full bg-primary-500" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg-primary truncate">{title}</p>
                <p className="text-xs text-fg-secondary truncate">{description}</p>
                <p className="text-[10px] text-fg-tertiary mt-1">{time}</p>
            </div>
        </motion.div>
    );
}
