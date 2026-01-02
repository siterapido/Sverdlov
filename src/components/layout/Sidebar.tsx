"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronsLeft,
    Menu,
    Home,
    Users,
    DollarSign,
    Settings,
    Plus,
    Search,
    Calendar,
    MessageSquare,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    isMobile: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ isOpen, isCollapsed, isMobile, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();

    const navSections = [
        {
            title: "Gestão",
            items: [
                { name: "Início", href: "/dashboard", icon: Home },
                { name: "Membros", href: "/members", icon: Users },
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
                { name: "Chat", href: "/chat", icon: MessageSquare },
            ],
        },
    ];

    return (
        <>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-border-subtle bg-sidebar-bg font-sans",
                    isCollapsed ? "w-16" : "w-64",
                    !isOpen && "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className={cn(
                        "flex items-center p-4",
                        isCollapsed ? "justify-center px-0" : "justify-between"
                    )}>
                        {!isCollapsed && (
                            <div className="flex items-center gap-2 font-medium text-fg-primary overflow-hidden whitespace-nowrap">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-[10px] text-white">
                                    S
                                </div>
                                <span className="text-sm">Sverdlov</span>
                            </div>
                        )}
                        <button
                            onClick={toggleSidebar}
                            className={cn(
                                "rounded-sm p-1 text-fg-secondary hover:bg-bg-hover transition-transform duration-300",
                                isCollapsed && "rotate-180"
                            )}
                        >
                            {isMobile ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <ChevronsLeft className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-3 py-2 space-y-1">
                        <div className={cn(
                            "flex items-center gap-2 rounded-sm px-2 py-1 text-sm text-fg-secondary hover:bg-bg-hover cursor-pointer overflow-hidden whitespace-nowrap",
                            isCollapsed && "justify-center px-0"
                        )}>
                            <Search className="h-4 w-4 shrink-0" />
                            {!isCollapsed && (
                                <>
                                    <span>Buscar</span>
                                    <span className="ml-auto text-xs opacity-60">⌘K</span>
                                </>
                            )}
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 rounded-sm px-2 py-1 text-sm text-fg-secondary hover:bg-bg-hover cursor-pointer overflow-hidden whitespace-nowrap",
                            isCollapsed && "justify-center px-0"
                        )}>
                            <Plus className="h-4 w-4 shrink-0" />
                            {!isCollapsed && <span>Nova Página</span>}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-none">
                        {navSections.map((section, idx) => (
                            <div key={section.title} className={cn(idx > 0 && "mt-6")}>
                                {!isCollapsed ? (
                                    <div className="mb-2 px-2 text-xs font-medium text-fg-secondary uppercase tracking-wider overflow-hidden whitespace-nowrap">
                                        {section.title}
                                    </div>
                                ) : (
                                    <div className="mb-2 border-t border-border-subtle/50 mx-2" />
                                )}
                                <ul className="space-y-0.5">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors overflow-hidden whitespace-nowrap",
                                                        isCollapsed && "justify-center px-0",
                                                        isActive
                                                            ? "bg-bg-hover text-fg-primary font-medium"
                                                            : "text-fg-secondary hover:bg-bg-hover hover:text-fg-primary"
                                                    )}
                                                    title={isCollapsed ? item.name : undefined}
                                                >
                                                    <item.icon className="h-4 w-4 shrink-0" />
                                                    {!isCollapsed && item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}

                        {/* Favorites Section (Placeholder) */}
                        {!isCollapsed && (
                            <>
                                <div className="mt-8 mb-2 px-2 text-xs font-medium text-fg-secondary uppercase tracking-wider overflow-hidden whitespace-nowrap">
                                    Favoritos
                                </div>
                                <div className="px-2 text-xs text-fg-secondary italic opacity-70 overflow-hidden whitespace-nowrap">
                                    Nenhum favorito
                                </div>
                            </>
                        )}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-border-subtle p-2">
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-fg-secondary hover:bg-bg-hover hover:text-fg-primary overflow-hidden whitespace-nowrap",
                                isCollapsed && "justify-center px-0"
                            )}
                            title={isCollapsed ? "Configurações" : undefined}
                        >
                            <Settings className="h-4 w-4 shrink-0" />
                            {!isCollapsed && "Configurações"}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 md:hidden backdrop-blur-[1px]"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
}
