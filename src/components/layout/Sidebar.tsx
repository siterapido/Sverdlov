"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    Bell,
    ChevronDown,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge, NotificationBadge } from "@/components/ui/badge";

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    isMobile: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ isOpen, isCollapsed, isMobile, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const navSections = [
        {
            title: "Gestão",
            items: [
                { name: "Início", href: "/dashboard", icon: Home, badge: null },
                { name: "Membros", href: "/members", icon: Users, badge: null },
                { name: "Escalas", href: "/escalas", icon: ClipboardList, badge: "Novo" },
            ],
        },
        {
            title: "Execução",
            items: [
                { name: "Financeiro", href: "/finance", icon: DollarSign, badge: null },
                { name: "Calendário", href: "/calendar", icon: Calendar, badge: null },
            ],
        },
        {
            title: "Comunicação",
            items: [
                { name: "Chat", href: "/chat", icon: MessageSquare, badge: 3 },
            ],
        },
    ];

    const sidebarVariants = {
        open: { x: 0 },
        closed: { x: "-100%" },
    };

    return (
        <>
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={isOpen ? "open" : "closed"}
                variants={sidebarVariants}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen",
                    "bg-sidebar-bg backdrop-blur-xl",
                    "border-r border-sidebar-border",
                    "transition-[width] duration-300 ease-out",
                    isCollapsed ? "w-[72px]" : "w-64"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header / Logo */}
                    <div className={cn(
                        "flex items-center p-4 border-b border-sidebar-border",
                        isCollapsed ? "justify-center" : "justify-between"
                    )}>
                        {!isCollapsed && (
                            <Link href="/dashboard" className="flex items-center gap-3 group">
                                <div className="relative">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-bold text-sm shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
                                        S
                                    </div>
                                    <motion.div
                                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-20 blur-lg"
                                        initial={false}
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                                <div className="overflow-hidden">
                                    <span className="text-sidebar-text-active font-semibold text-sm">
                                        Sverdlov
                                    </span>
                                    <p className="text-sidebar-text text-[10px] opacity-60">
                                        Unidade Popular
                                    </p>
                                </div>
                            </Link>
                        )}
                        <motion.button
                            onClick={toggleSidebar}
                            className={cn(
                                "rounded-lg p-2 text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active",
                                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isMobile ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <motion.div
                                    animate={{ rotate: isCollapsed ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronsLeft className="h-5 w-5" />
                                </motion.div>
                            )}
                        </motion.button>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-3 py-4 space-y-1">
                        <QuickAction
                            icon={<Search className="h-4 w-4" />}
                            label="Buscar"
                            shortcut="⌘K"
                            isCollapsed={isCollapsed}
                        />
                        <QuickAction
                            icon={<Plus className="h-4 w-4" />}
                            label="Nova Ação"
                            isCollapsed={isCollapsed}
                            highlight
                        />
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
                        {navSections.map((section, idx) => (
                            <div key={section.title} className={cn(idx > 0 && "mt-6")}>
                                {!isCollapsed ? (
                                    <div className="mb-2 px-3 text-[10px] font-semibold text-sidebar-text/50 uppercase tracking-widest">
                                        {section.title}
                                    </div>
                                ) : (
                                    <div className="mb-2 mx-2 border-t border-sidebar-border" />
                                )}
                                <ul className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                        isCollapsed && "justify-center px-2",
                                                        isActive
                                                            ? "bg-gradient-to-r from-primary-500/20 to-secondary-500/10 text-sidebar-text-active"
                                                            : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
                                                    )}
                                                    title={isCollapsed ? item.name : undefined}
                                                >
                                                    {/* Active indicator */}
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeTab"
                                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-primary-400 to-secondary-500"
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        />
                                                    )}

                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                    >
                                                        <item.icon className={cn(
                                                            "h-5 w-5 shrink-0",
                                                            isActive && "text-primary-400"
                                                        )} />
                                                    </motion.div>

                                                    {!isCollapsed && (
                                                        <>
                                                            <span className="flex-1">{item.name}</span>
                                                            {typeof item.badge === "string" && (
                                                                <Badge variant="gradient" size="sm">
                                                                    {item.badge}
                                                                </Badge>
                                                            )}
                                                            {typeof item.badge === "number" && item.badge > 0 && (
                                                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white px-1.5">
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
                            </div>
                        ))}

                        {/* Favorites placeholder */}
                        {!isCollapsed && (
                            <div className="mt-8">
                                <div className="mb-2 px-3 text-[10px] font-semibold text-sidebar-text/50 uppercase tracking-widest">
                                    Favoritos
                                </div>
                                <div className="px-3 py-2 text-xs text-sidebar-text/40 italic flex items-center gap-2">
                                    <Sparkles className="h-3 w-3" />
                                    Arraste itens aqui
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* Footer / User Section */}
                    <div className="border-t border-sidebar-border p-3">
                        {/* Settings */}
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? "Configurações" : undefined}
                        >
                            <Settings className="h-5 w-5" />
                            {!isCollapsed && "Configurações"}
                        </Link>

                        {/* User Profile */}
                        <div
                            className={cn(
                                "mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors",
                                "hover:bg-sidebar-hover",
                                isCollapsed && "justify-center px-2"
                            )}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <Avatar
                                size="sm"
                                fallback="UP"
                                status="online"
                            />
                            {!isCollapsed && (
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium text-sidebar-text-active truncate">
                                        Usuário
                                    </p>
                                    <p className="text-xs text-sidebar-text/60 truncate">
                                        admin@up.org.br
                                    </p>
                                </div>
                            )}
                            {!isCollapsed && (
                                <ChevronDown className={cn(
                                    "h-4 w-4 text-sidebar-text transition-transform",
                                    showUserMenu && "rotate-180"
                                )} />
                            )}
                        </div>

                        {/* User Menu Dropdown */}
                        <AnimatePresence>
                            {showUserMenu && !isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 rounded-lg bg-sidebar-hover overflow-hidden"
                                >
                                    <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-sidebar-text hover:bg-white/5 transition-colors">
                                        <LogOut className="h-4 w-4" />
                                        Sair
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// === Quick Action Button ===
function QuickAction({
    icon,
    label,
    shortcut,
    isCollapsed,
    highlight = false,
}: {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    isCollapsed: boolean;
    highlight?: boolean;
}) {
    return (
        <motion.button
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isCollapsed && "justify-center px-2",
                highlight
                    ? "bg-gradient-to-r from-primary-500/20 to-secondary-500/10 text-primary-400 hover:from-primary-500/30 hover:to-secondary-500/20"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed ? label : undefined}
        >
            {icon}
            {!isCollapsed && (
                <>
                    <span className="flex-1 text-left">{label}</span>
                    {shortcut && (
                        <kbd className="hidden md:inline-flex items-center gap-1 rounded bg-sidebar-hover px-1.5 py-0.5 text-[10px] font-medium text-sidebar-text/50">
                            {shortcut}
                        </kbd>
                    )}
                </>
            )}
        </motion.button>
    );
}
