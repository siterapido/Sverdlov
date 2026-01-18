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
                    "bg-sidebar-bg",
                    "border-r border-sidebar-border",
                    "transition-all duration-200 ease-out",
                    isCollapsed ? "w-[60px]" : "w-60",
                    !isOpen && !isMobile && "-translate-x-full",
                    isMobile && "shadow-lg"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header / Logo */}
                    <div className={cn(
                        "flex items-center h-12 px-3 border-b border-sidebar-border",
                        isCollapsed ? "justify-center" : "justify-between"
                    )}>
                        {!isCollapsed && (
                            <Link href="/dashboard" className="flex items-center gap-2 group">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-fg-primary text-bg-primary font-semibold text-xs">
                                    S
                                </div>
                                <div className="overflow-hidden">
                                    <span className="text-fg-primary font-medium text-sm">
                                        Sverdlov
                                    </span>
                                </div>
                            </Link>
                        )}
                        <button
                            onClick={toggleSidebar}
                            className={cn(
                                "rounded-[4px] p-1 text-fg-muted hover:bg-sidebar-hover hover:text-fg-primary",
                                "transition-colors"
                            )}
                        >
                            {isMobile ? (
                                <X className="h-4 w-4" />
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
                        <div className="px-2 py-2 space-y-0.5">
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
                    <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-notion">
                        {navSections.map((section) => (
                            <div key={section.title} className="mb-2">
                                {!isCollapsed ? (
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="flex items-center gap-1 w-full px-2 py-1 text-xs font-medium text-fg-muted hover:text-fg-secondary transition-colors"
                                    >
                                        <ChevronRight className={cn(
                                            "h-3 w-3 transition-transform",
                                            expandedSections[section.title] && "rotate-90"
                                        )} />
                                        {section.title}
                                    </button>
                                ) : (
                                    <div className="mx-2 my-2 border-t border-sidebar-border" />
                                )}
                                
                                {(expandedSections[section.title] || isCollapsed) && (
                                    <ul className="space-y-0.5 mt-0.5">
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                            return (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm transition-colors",
                                                            isCollapsed && "justify-center px-2",
                                                            isActive
                                                                ? "bg-sidebar-active text-fg-primary font-medium"
                                                                : "text-fg-secondary hover:bg-sidebar-hover hover:text-fg-primary"
                                                        )}
                                                        title={isCollapsed ? item.name : undefined}
                                                    >
                                                        <item.icon className="h-4 w-4 shrink-0" />
                                                        
                                                        {!isCollapsed && (
                                                            <>
                                                                <span className="flex-1">{item.name}</span>
                                                                {"badge" in item && typeof item.badge === "number" && item.badge > 0 && (
                                                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white px-1.5">
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
                    <div className="border-t border-sidebar-border p-2">
                        {/* Settings */}
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm transition-colors",
                                "text-fg-secondary hover:bg-sidebar-hover hover:text-fg-primary",
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
                                "mt-1 flex items-center gap-2 rounded-[4px] px-2 py-1.5 cursor-pointer transition-colors",
                                "hover:bg-sidebar-hover",
                                isCollapsed && "justify-center px-2"
                            )}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-accent-light text-accent text-xs font-medium">
                                UP
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium text-fg-primary truncate">
                                            Usuário
                                        </p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-3 w-3 text-fg-muted transition-transform",
                                        showUserMenu && "rotate-180"
                                    )} />
                                </>
                            )}
                        </div>

                        {/* User Menu Dropdown */}
                        {showUserMenu && !isCollapsed && (
                            <div className="mt-1 rounded-[4px] bg-bg-hover overflow-hidden">
                                <button className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-fg-secondary hover:bg-bg-active hover:text-fg-primary transition-colors">
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
                    className="fixed inset-0 z-30 bg-black/20 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
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
            className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm text-fg-secondary hover:bg-sidebar-hover hover:text-fg-primary transition-colors"
        >
            {icon}
            <span className="flex-1 text-left">{label}</span>
            {shortcut && (
                <kbd className="hidden md:inline-flex items-center rounded-[3px] bg-bg-tertiary px-1.5 py-0.5 text-[10px] font-medium text-fg-muted border border-border-light">
                    {shortcut}
                </kbd>
            )}
        </button>
    );
}
