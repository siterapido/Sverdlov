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
                "flex h-11 items-center justify-between gap-4 px-4",
                "bg-bg-primary",
                "border-b border-border-default"
            )}
        >
            {/* Left Side */}
            <div className="flex items-center gap-3">
                {/* Mobile menu toggle */}
                {isMobile && (
                    <IconButton
                        icon={<Menu className="h-4 w-4" />}
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
                                <ChevronRight className="h-3 w-3 text-fg-muted" />
                            )}
                            <a
                                href={crumb.path}
                                className={cn(
                                    "flex items-center gap-1.5 px-1.5 py-0.5 rounded-[4px] transition-colors",
                                    crumb.isLast
                                        ? "text-fg-primary font-medium"
                                        : "text-fg-secondary hover:text-fg-primary hover:bg-bg-hover"
                                )}
                            >
                                {crumb.icon}
                                {crumb.label}
                            </a>
                        </React.Fragment>
                    ))}
                </nav>

                {/* Mobile: Page title */}
                {isMobile && breadcrumbs.length > 0 && (
                    <h1 className="text-sm font-medium text-fg-primary">
                        {breadcrumbs[breadcrumbs.length - 1]?.label}
                    </h1>
                )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1">
                {/* Search */}
                <div className="hidden md:block relative">
                    {searchOpen ? (
                        <div className="relative w-64">
                            <SearchInput
                                placeholder="Buscar..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onClear={() => setSearchValue("")}
                                inputSize="sm"
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
                            leftIcon={<Search className="h-3.5 w-3.5" />}
                            className="text-fg-secondary"
                        >
                            Buscar
                            <kbd className="ml-2 hidden lg:inline-flex h-5 items-center rounded-[3px] border border-border-default bg-bg-secondary px-1.5 text-[10px] font-medium text-fg-muted">
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
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger" />

                    {/* Notification dropdown */}
                    {notificationsOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setNotificationsOpen(false)}
                            />
                            <div
                                className={cn(
                                    "absolute right-0 top-full mt-1 z-50",
                                    "w-80 rounded-lg border border-border-default",
                                    "bg-bg-primary shadow-popup"
                                )}
                            >
                                <div className="px-3 py-2 border-b border-border-default">
                                    <h3 className="font-medium text-sm text-fg-primary">Notificações</h3>
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
                                    />
                                </div>
                                <div className="px-3 py-2 border-t border-border-default">
                                    <Button variant="ghost" size="sm" className="w-full text-fg-secondary">
                                        Ver todas
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Avatar (mobile only) */}
                {isMobile && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-accent-light text-accent text-xs font-medium">
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
                "flex gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-bg-hover",
                unread && "bg-accent-light/30"
            )}
        >
            <div className="shrink-0 mt-1.5">
                {unread && (
                    <span className="block h-2 w-2 rounded-full bg-accent" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg-primary truncate">{title}</p>
                <p className="text-xs text-fg-secondary truncate">{description}</p>
                <p className="text-[10px] text-fg-muted mt-0.5">{time}</p>
            </div>
        </div>
    );
}
