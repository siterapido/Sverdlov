"use client";

import React, { useState } from "react";
import {
    MoreHorizontal,
    FileDown,
    Filter,
    Users,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Member {
    id: string;
    fullName: string;
    cpf: string;
    voterTitle: string | null;
    state: string;
    city: string;
    zone: string | null;
    status: string;
    nucleusName: string | null;
    createdAt: Date;
}

interface MembersTableProps {
    initialMembers: Member[];
    onImportClick: () => void;
    onNewClick: () => void;
}

export function MembersTable({ initialMembers, onImportClick, onNewClick }: MembersTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const router = useRouter();

    const filteredMembers = initialMembers.filter(member => {
        const matchesSearch =
            member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.cpf.includes(searchTerm) ||
            (member.city && member.city.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = !filterStatus || member.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: initialMembers.length,
        active: initialMembers.filter(m => m.status === 'active').length,
        interested: initialMembers.filter(m => m.status === 'interested').length,
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                    <FilterButton
                        label="Todos"
                        count={statusCounts.all}
                        active={filterStatus === null}
                        onClick={() => setFilterStatus(null)}
                    />
                    <FilterButton
                        label="Ativos"
                        count={statusCounts.active}
                        active={filterStatus === 'active'}
                        onClick={() => setFilterStatus('active')}
                        variant="green"
                    />
                    <FilterButton
                        label="Interessados"
                        count={statusCounts.interested}
                        active={filterStatus === 'interested'}
                        onClick={() => setFilterStatus('interested')}
                        variant="blue"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-full md:w-80">
                        <SearchInput
                            placeholder="Pesquisar por nome, CPF ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClear={() => setSearchTerm("")}
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={onImportClick} className="hidden sm:flex items-center gap-2">
                        <FileDown className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <Card hover={false} className="overflow-hidden border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
                                    <th className="px-6 py-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Filiado</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Documentação</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Localidade</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Núcleo</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Status</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                <AnimatePresence mode="popLayout">
                                    {filteredMembers.map((member) => (
                                        <motion.tr
                                            key={member.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-900"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar fallback={member.fullName} size="md" className="bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors dark:text-zinc-50 dark:group-hover:text-blue-400">
                                                            {member.fullName}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 italic dark:text-zinc-400">
                                                            Filiado em {new Date(member.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 tabular-nums dark:text-zinc-400">
                                                        <span className="font-medium text-zinc-900 dark:text-zinc-200">CPF:</span> {member.cpf}
                                                    </div>
                                                    {member.voterTitle && (
                                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 tabular-nums dark:text-zinc-500">
                                                            <span className="font-medium">Título:</span> {member.voterTitle}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
                                                        <MapPin className="h-3 w-3 text-zinc-400" />
                                                        {member.city}, {member.state}
                                                    </div>
                                                    {member.zone && (
                                                        <span className="text-xs text-zinc-400 ml-4.5">
                                                            Zona {member.zone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {member.nucleusName ? (
                                                    <Badge variant="blue" className="font-medium">
                                                        {member.nucleusName}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-zinc-400 italic">Sem núcleo</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        member.status === 'active' ? "green" :
                                                            member.status === 'interested' ? "blue" :
                                                                "yellow"
                                                    }
                                                    dot
                                                    dotColor={
                                                        member.status === 'active' ? "green" :
                                                            member.status === 'interested' ? "blue" :
                                                                "yellow"
                                                    }
                                                    className="shadow-none"
                                                >
                                                    {member.status === 'active' ? 'Ativo' :
                                                        member.status === 'interested' ? 'Interessado' :
                                                            member.status === 'in_formation' ? 'Em Formação' : 'Inativo'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/members/${member.id}`)}>
                                                        <Eye className="h-4 w-4 text-zinc-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center dark:bg-zinc-800">
                                                    <Users className="h-8 w-8 text-zinc-400" />
                                                </div>
                                                <div className="max-w-[250px]">
                                                    <p className="text-zinc-900 font-medium dark:text-zinc-50">Nenhum filiado encontrado</p>
                                                    <p className="text-zinc-500 text-sm mt-1 dark:text-zinc-400">Tente ajustar sua busca ou filtros para encontrar o que procura.</p>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => { setSearchTerm(""); setFilterStatus(null); }}>
                                                    Limpar filtros
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function FilterButton({
    label,
    count,
    active,
    onClick,
    variant = "default"
}: {
    label: string,
    count: number,
    active: boolean,
    onClick: () => void,
    variant?: "default" | "blue" | "green"
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all whitespace-nowrap border dark:border-zinc-800",
                active
                    ? (variant === "green" ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" :
                        variant === "blue" ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" :
                            "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900")
                    : "text-zinc-600 border-transparent hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            )}
        >
            {label}
            <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] tabular-nums",
                active
                    ? (variant === "green" ? "bg-white/50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" :
                        variant === "blue" ? "bg-white/50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" :
                            "bg-zinc-700 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-700")
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            )}>
                {count}
            </span>
        </button>
    );
}

