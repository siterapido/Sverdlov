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
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
            {icon}
            <span className="flex-1 text-left">{label}</span>
            {shortcut && (
                <kbd className="hidden md:inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
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
                    "bg-zinc-50 dark:bg-zinc-950",
                    "border-r border-zinc-200 dark:border-zinc-800",
                    "transition-all duration-200 ease-out",
                    isCollapsed ? "w-[60px]" : "w-60",
                    !isOpen && !isMobile && "-translate-x-full",
                    isMobile && "shadow-xl"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header / Logo */}
                    <div className={cn(
                        "flex items-center h-14 px-3 border-b border-zinc-200 dark:border-zinc-800",
                        isCollapsed ? "justify-center" : "justify-between"
                    )}>
                        {!isCollapsed && (
                            <Link href="/dashboard" className="flex items-center gap-2 group">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white font-bold text-sm dark:bg-white dark:text-zinc-950">
                                    S
                                </div>
                                <div className="overflow-hidden">
                                    <span className="text-zinc-900 font-semibold text-sm tracking-tight dark:text-zinc-100">
                                        Sverdlov
                                    </span>
                                </div>
                            </Link>
                        )}
                        <button
                            onClick={toggleSidebar}
                            className={cn(
                                "rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900",
                                "transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                            )}
                        >
                            {isMobile ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <ChevronsLeft className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isCollapsed && "rotate-180"
                                )} />
                            )}
                        </button>
                    </div>

                    {/* Quick Actions */}
                    {!isCollapsed && (
                        <div className="px-3 py-3 space-y-1">
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
                            <div key={section.title} className="mb-4">
                                {!isCollapsed ? (
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="flex items-center gap-1 w-full px-2 py-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 uppercase tracking-wider transition-colors dark:text-zinc-500 dark:hover:text-zinc-300"
                                    >
                                        <ChevronRight className={cn(
                                            "h-3 w-3 transition-transform",
                                            expandedSections[section.title] && "rotate-90"
                                        )} />
                                        {section.title}
                                    </button>
                                ) : (
                                    <div className="mx-2 my-2 border-t border-zinc-200 dark:border-zinc-800" />
                                )}

                                {(expandedSections[section.title] || isCollapsed) && (
                                    <ul className="space-y-0.5 mt-1">
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                            return (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                                                            isCollapsed && "justify-center px-2",
                                                            isActive
                                                                ? "bg-white text-zinc-900 shadow-sm font-medium dark:bg-zinc-800 dark:text-white"
                                                                : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                                                        )}
                                                        title={isCollapsed ? item.name : undefined}
                                                    >
                                                        <item.icon className="h-4 w-4 shrink-0" />

                                                        {!isCollapsed && (
                                                            <>
                                                                <span className="flex-1">{item.name}</span>
                                                                {"badge" in item && typeof item.badge === "number" && item.badge > 0 && (
                                                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white px-1.5 shadow-sm">
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
                    <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                        {/* Settings */}
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                                "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
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
                                "mt-1 flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer transition-colors",
                                "hover:bg-zinc-200/50 dark:hover:bg-zinc-800",
                                isCollapsed && "justify-center px-2"
                            )}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white text-xs font-bold dark:bg-white dark:text-zinc-950">
                                UP
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-100">
                                            Usuário
                                        </p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-3 w-3 text-zinc-400 transition-transform",
                                        showUserMenu && "rotate-180"
                                    )} />
                                </>
                            )}
                        </div>

                        {/* User Menu Dropdown */}
                        {showUserMenu && !isCollapsed && (
                            <div className="mt-2 rounded-md bg-white border border-zinc-200 shadow-lg overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
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
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
}
