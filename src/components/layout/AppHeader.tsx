"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickCapture } from "./QuickCapture";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
    onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
    const pathname = usePathname();

    // Map pathname to section info and tabs
    const getSectionInfo = (path: string) => {
        if (path.startsWith("/members")) {
            return {
                title: "Membros",
                tabs: [
                    { name: "Lista", href: "/members" },
                    { name: "Núcleos", href: "/members/nuclei" },
                    { name: "Importar", href: "/members/import" },
                ],
            };
        }
        if (path.startsWith("/finance")) {
            return {
                title: "Financeiro",
                tabs: [
                    { name: "Visão Geral", href: "/finance" },
                    { name: "Entradas", href: "/finance/incomes" },
                    { name: "Saídas", href: "/finance/expenses" },
                ],
            };
        }
        if (path.startsWith("/dashboard")) {
            return {
                title: "Início",
                tabs: [
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "Minha Atividade", href: "/dashboard/activity" },
                ],
            };
        }
        if (path.startsWith("/calendar")) return { title: "Calendário", tabs: [] };
        if (path.startsWith("/chat")) return { title: "Chat", tabs: [] };
        if (path.startsWith("/settings")) return { title: "Configurações", tabs: [] };

        return { title: "Sverdlov", tabs: [] };
    };

    const section = getSectionInfo(pathname);

    return (
        <header className="sticky top-0 z-30 w-full border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md">
            <div className="flex h-12 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMenuClick}
                        className="p-1 text-fg-secondary lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-2 text-sm font-medium text-fg-primary">
                        <span>{section.title}</span>
                    </div>

                    <nav className="ml-4 hidden items-center gap-0.5 md:flex">
                        {section.tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={cn(
                                        "px-3 py-1 text-sm transition-all rounded-sm inline-flex items-center justify-center min-w-[80px]",
                                        isActive
                                            ? "bg-bg-hover text-fg-primary font-medium"
                                            : "text-fg-secondary hover:text-fg-primary hover:bg-bg-hover/50"
                                    )}
                                >
                                    {tab.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/calendar">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-fg-secondary">
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <QuickCapture />
                </div>
            </div>
        </header>
    );
}
