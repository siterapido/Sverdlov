import React, { useState, useRef, useEffect } from "react";
import { Plus, Users, DollarSign, Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QuickCapture() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const actions = [
        { name: "Novo Filiado", icon: Users, href: "/members", color: "text-primary" },
        { name: "Nova Transação", icon: DollarSign, href: "/finance", color: "text-success" },
        { name: "Agendar Evento", icon: Calendar, href: "/calendar", color: "text-warning" },
        { name: "Mensagem", icon: MessageSquare, href: "/chat", color: "text-secondary" },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="default"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-8 w-8 rounded-full shadow-sm transition-all duration-200",
                    isOpen && "rotate-45"
                )}
            >
                <Plus className="h-5 w-5" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-bg-primary border border-border-subtle shadow-lg py-1 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-fg-secondary uppercase tracking-wider">
                        Captura Rápida
                    </div>
                    {actions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-fg-primary hover:bg-bg-hover transition-colors"
                        >
                            <action.icon className={cn("h-4 w-4", action.color)} />
                            <span>{action.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
