"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronsLeft,
    Home,
    Users,
    DollarSign,
    Settings,
    Plus,
    Search,
    Calendar,
    MessageSquare,
    X,
    ClipboardList,
    LogOut,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    isMobile: boolean;
    toggleSidebar: () => void;
}

// === Quick Action Button ===
function QuickAction({
    icon,
    label,
    shortcut,
}: {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
}) {
    return (
        <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-[13px] font-medium text-muted hover:bg-surface-hover hover:text-foreground transition-all active:scale-[0.98]"
        >
            <div className="text-muted">
                {icon}
            </div>
            <span className="flex-1 text-left">{label}</span>
            {shortcut && (
                <kbd className="hidden md:inline-flex items-center rounded-sm bg-zinc-50 px-1.5 py-0.5 text-[10px] font-bold text-muted border border-border dark:bg-zinc-900">
                    {shortcut}
                </kbd>
            )}
        </button>
    );
}

export function Sidebar({ isOpen, isCollapsed, isMobile, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        "Gestão": true,
        "Execução": true,
        "Comunicação": true,
    });

    const navSections = [
        {
            title: "Gestão",
            items: [
                { name: "Início", href: "/dashboard", icon: Home },
                { name: "Membros", href: "/members", icon: Users },
                { name: "Escalas", href: "/escalas", icon: ClipboardList },
            ],
        },
        {
            title: "Execução",
            items: [
                { name: "Financeiro", href: "/finance", icon: DollarSign },
                { name: "Calendário", href: "/calendar", icon: Calendar },
            ],
        },
        {
            title: "Comunicação",
            items: [
                { name: "Chat", href: "/chat", icon: MessageSquare, badge: 3 },
            ],
        },
    ];

    const toggleSection = (title: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    if (!isOpen && isMobile) return null;

    return (
        <>
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen",
                    "bg-surface",
                    "border-r border-border",
                    "transition-all duration-200 ease-out",
                    isCollapsed ? "w-[60px]" : "w-64",
                    !isOpen && !isMobile && "-translate-x-full",
                    isMobile && "shadow-2xl"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header / Logo */}
                    <div className={cn(
                        "flex items-center h-16 px-4 border-b border-border",
                        isCollapsed ? "justify-center" : "justify-between"
                    )}>
                        {!isCollapsed && (
                            <Link href="/dashboard" className="flex items-center gap-2.5 group">
                                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-primary-foreground font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-transform group-hover:-translate-y-0.5 active:translate-y-0">
                                    S
                                </div>
                                <div className="overflow-hidden">
                                    <span className="text-foreground font-black text-base tracking-tighter uppercase leading-none">
                                        Sverdlov
                                    </span>
                                </div>
                            </Link>
                        )}
                        <button
                            onClick={toggleSidebar}
                            className={cn(
                                "rounded-sm p-2 text-muted hover:bg-surface-hover hover:text-foreground transition-all",
                                isCollapsed && "mx-auto"
                            )}
                        >
                            {isMobile ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <ChevronsLeft className={cn(
                                    "h-5 w-5 transition-transform duration-300",
                                    isCollapsed && "rotate-180"
                                )} />
                            )}
                        </button>
                    </div>

                    {/* Quick Actions */}
                    {!isCollapsed && (
                        <div className="px-3 py-4 space-y-1">
                            <QuickAction
                                icon={<Search className="h-4 w-4" />}
                                label="Buscar"
                                shortcut="⌘K"
                            />
                            <QuickAction
                                icon={<Plus className="h-4 w-4" />}
                                label="Nova Ação"
                            />
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2">
                        {navSections.map((section) => (
                            <div key={section.title} className="mb-6">
                                {!isCollapsed ? (
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="flex items-center gap-1 w-full px-2 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-[0.2em] transition-colors"
                                    >
                                        <ChevronRight className={cn(
                                            "h-3 w-3 transition-transform",
                                            expandedSections[section.title] && "rotate-90"
                                        )} />
                                        {section.title}
                                    </button>
                                ) : (
                                    <div className="mx-2 my-4 border-t border-border" />
                                )}

                                {(expandedSections[section.title] || isCollapsed) && (
                                    <ul className="space-y-0.5 mt-2">
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                            return (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-3 rounded-sm px-3 py-2 text-[13px] transition-all",
                                                            isCollapsed && "justify-center px-2",
                                                            isActive
                                                                ? "bg-primary text-primary-foreground font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                                                                : "text-muted hover:bg-surface-hover hover:text-foreground"
                                                        )}
                                                        title={isCollapsed ? item.name : undefined}
                                                    >
                                                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-muted")} />

                                                        {!isCollapsed && (
                                                            <>
                                                                <span className="flex-1">{item.name}</span>
                                                                {"badge" in item && typeof item.badge === "number" && item.badge > 0 && (
                                                                    <span className={cn(
                                                                        "flex h-4 min-w-4 items-center justify-center rounded-sm text-[9px] font-black px-1 shadow-sm",
                                                                        isActive ? "bg-white text-primary" : "bg-primary text-white"
                                                                    )}>
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Footer / User Section */}
                    <div className="border-t border-border p-4 bg-surface">
                        {/* Settings */}
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-sm px-3 py-2 text-[13px] transition-all text-muted hover:bg-surface-hover hover:text-foreground",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? "Configurações" : undefined}
                        >
                            <Settings className="h-4 w-4" />
                            {!isCollapsed && "Configurações"}
                        </Link>

                        {/* User Profile */}
                        <div
                            className={cn(
                                "mt-2 flex items-center gap-3 rounded-sm px-3 py-2 cursor-pointer transition-all hover:bg-surface-hover",
                                isCollapsed && "justify-center px-2"
                            )}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-zinc-100 text-zinc-900 text-xs font-black border border-border dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                                UP
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[13px] font-bold text-foreground truncate">
                                            Usuário
                                        </p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-3 w-3 text-muted transition-transform",
                                        showUserMenu && "rotate-180"
                                    )} />
                                </>
                            )}
                        </div>

                        {/* User Menu Dropdown */}
                        {showUserMenu && !isCollapsed && (
                            <div className="mt-2 rounded-sm bg-surface border border-border shadow-xl overflow-hidden">
                                <button className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-muted hover:bg-surface-hover hover:text-danger transition-colors">
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
}
