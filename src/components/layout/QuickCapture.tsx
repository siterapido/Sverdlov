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
                    "h-10 w-10 rounded-none shadow-[4px_4px_0px_0px_rgba(0,82,255,0.1)] transition-all",
                    isOpen && "rotate-45"
                )}
            >
                <Plus className="h-6 w-6" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-none bg-white border-2 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-50 mb-1">
                        Captura Rápida
                    </div>
                    {actions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 text-[13px] font-bold text-zinc-900 hover:bg-zinc-50 transition-all group"
                        >
                            <div className={cn("flex h-8 w-8 items-center justify-center border-2 border-zinc-100 group-hover:border-primary transition-colors", action.color)}>
                                <action.icon className="h-4 w-4" />
                            </div>
                            <span className="uppercase tracking-tight">{action.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
