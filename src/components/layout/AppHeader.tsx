"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
    Menu,
    Search,
    Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeProvider";
import { NotificationBell } from "./NotificationBell";

interface AppHeaderProps {
    toggleSidebar: () => void;
    isMobile: boolean;
    userId?: string;
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, { label: string; icon?: React.ReactNode }> = {
    dashboard: { label: "Dashboard", icon: <Home className="h-3.5 w-3.5" /> },
    members: { label: "Membros" },
    nucleos: { label: "Núcleos" },
    escalas: { label: "Escalas" },
    settings: { label: "Configurações" },
};

export function AppHeader({ toggleSidebar, isMobile, userId }: AppHeaderProps) {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

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
                {userId && <NotificationBell userId={userId} />}

                {/* User Avatar (mobile only) */}
                {isMobile && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-none bg-zinc-100 text-zinc-900 text-xs font-black border border-border">
                        UP
                    </div>
                )}
            </div>
        </header>
    );
}
