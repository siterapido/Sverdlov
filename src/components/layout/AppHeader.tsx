"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
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
import { ThemeToggle } from "./ThemeProvider";

interface AppHeaderProps {
    toggleSidebar: () => void;
    isMobile: boolean;
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, { label: string; icon?: React.ReactNode }> = {
    dashboard: { label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
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
        <header
            className={cn(
                "sticky top-0 z-30",
                "flex h-16 items-center justify-between gap-4 px-8",
                "bg-white",
                "border-b border-border"
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
                <nav className="hidden md:flex items-center gap-0 text-[13px]">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.path}>
                            {index > 0 && (
                                <span className="mx-2 text-zinc-300">/</span>
                            )}
                            <a
                                href={crumb.path}
                                className={cn(
                                    "px-1 py-1 transition-all",
                                    crumb.isLast
                                        ? "text-primary font-black uppercase tracking-tight"
                                        : "text-muted font-bold hover:text-foreground"
                                )}
                            >
                                {crumb.label}
                            </a>
                        </React.Fragment>
                    ))}
                </nav>

                {/* Mobile: Page title */}
                {isMobile && breadcrumbs.length > 0 && (
                    <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {breadcrumbs[breadcrumbs.length - 1]?.label}
                    </h1>
                )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="hidden md:block relative">
                    {searchOpen ? (
                        <div className="relative w-64">
                            <SearchInput
                                placeholder="Buscar..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onClear={() => setSearchValue("")}
                                inputSize="default"
                                autoFocus
                                onBlur={() => {
                                    if (!searchValue) setSearchOpen(false);
                                }}
                            />
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchOpen(true)}
                            leftIcon={<Search className="h-4 w-4" />}
                            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                            Buscar
                            <kbd className="ml-2 hidden lg:inline-flex h-5 items-center rounded border border-zinc-200 bg-zinc-50 px-1.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
                                ⌘K
                            </kbd>
                        </Button>
                    )}
                </div>

                {/* Mobile search button */}
                {isMobile && (
                    <IconButton
                        icon={<Search className="h-4 w-4" />}
                        aria-label="Search"
                        variant="ghost"
                    />
                )}

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <div className="relative">
                    <IconButton
                        icon={<Bell className="h-4 w-4" />}
                        aria-label="Notifications"
                        variant="ghost"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                    />
                    {/* Notification dot */}
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-600 shadow-sm" />

                    {/* Notification dropdown */}
                    {notificationsOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setNotificationsOpen(false)}
                            />
                            <div
                                className={cn(
                                    "absolute right-0 top-full mt-2 z-50",
                                    "w-80 rounded-sm border border-border",
                                    "bg-white shadow-2xl"
                                )}
                            >
                                <div className="px-5 py-4 border-b border-border">
                                    <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900">Notificações</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
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
                                    />
                                </div>
                                <div className="px-3 py-2 border-t border-border">
                                    <Button variant="ghost" size="sm" className="w-full text-muted font-bold uppercase text-[10px] tracking-widest">
                                        Ver todas
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Avatar (mobile only) */}
                {isMobile && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-zinc-100 text-zinc-900 text-xs font-black border border-border">
                        UP
                    </div>
                )}
            </div>
        </header>
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
        <div
            className={cn(
                "flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-zinc-50",
                unread && "bg-zinc-50"
            )}
        >
            <div className="shrink-0 mt-1.5">
                {unread && (
                    <span className="block h-2 w-2 rounded-full bg-primary" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium text-zinc-900", unread && "font-bold")}>{title}</p>
                <p className="text-xs text-zinc-500 truncate">{description}</p>
                <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-tight">{time}</p>
            </div>
        </div>
    );
}
