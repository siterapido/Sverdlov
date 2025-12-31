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
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: "Início", href: "/dashboard", icon: Home },
        { name: "Membros", href: "/members", icon: Users },
        { name: "Financeiro", href: "/finance", icon: DollarSign },
        { name: "Calendário", href: "/calendar", icon: Calendar },
        { name: "Chat", href: "/chat", icon: MessageSquare },
    ];

    return (
        <>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-border-subtle bg-sidebar-bg transition-transform duration-300 ease-in-out",
                    !isOpen && "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2 font-medium text-fg-primary">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] text-white">
                                S
                            </div>
                            <span className="text-sm">Sverdlov</span>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="rounded-sm p-1 text-fg-secondary hover:bg-bg-hover"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-3 py-2">
                        <div className="mb-2 flex items-center gap-2 rounded-sm px-2 py-1 text-sm text-fg-secondary hover:bg-bg-hover cursor-pointer">
                            <Search className="h-4 w-4" />
                            <span>Buscar</span>
                            <span className="ml-auto text-xs opacity-60">⌘K</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-sm px-2 py-1 text-sm text-fg-secondary hover:bg-bg-hover cursor-pointer">
                            <Plus className="h-4 w-4" />
                            <span>Nova Página</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-2 py-2">
                        <div className="mb-2 px-2 text-xs font-medium text-fg-secondary">
                            Principal
                        </div>
                        <ul className="space-y-0.5">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                                                isActive
                                                    ? "bg-bg-hover text-fg-primary font-medium"
                                                    : "text-fg-secondary hover:bg-bg-hover hover:text-fg-primary"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Favorites Section (Placeholder) */}
                        <div className="mt-6 mb-2 px-2 text-xs font-medium text-fg-secondary">
                            Favoritos
                        </div>
                        <div className="px-4 text-xs text-fg-secondary italic">
                            Nenhum favorito
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-border-subtle p-2">
                        <Link
                            href="/settings"
                            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-fg-secondary hover:bg-bg-hover hover:text-fg-primary"
                        >
                            <Settings className="h-4 w-4" />
                            Configurações
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
}
