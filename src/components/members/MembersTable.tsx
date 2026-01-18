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
                        variant="success"
                    />
                    <FilterButton
                        label="Interessados"
                        count={statusCounts.interested}
                        active={filterStatus === 'interested'}
                        onClick={() => setFilterStatus('interested')}
                        variant="primary"
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
            <Card hover={false} className="overflow-hidden border-border-subtle">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-bg-tertiary/50 border-b border-border-subtle">
                                    <th className="px-6 py-4 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Filiado</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Documentação</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Localidade</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Núcleo</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                <AnimatePresence mode="popLayout">
                                    {filteredMembers.map((member) => (
                                        <motion.tr
                                            key={member.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-bg-hover/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar fallback={member.fullName} size="md" ring />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-fg-primary group-hover:text-primary transition-colors">
                                                            {member.fullName}
                                                        </span>
                                                        <span className="text-xs text-fg-tertiary italic">
                                                            Filiado em {new Date(member.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-fg-secondary tabular-nums">
                                                        <span className="font-medium">CPF:</span> {member.cpf}
                                                    </div>
                                                    {member.voterTitle && (
                                                        <div className="flex items-center gap-1.5 text-xs text-fg-tertiary tabular-nums">
                                                            <span className="font-medium">Título:</span> {member.voterTitle}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-sm text-fg-secondary">
                                                        <MapPin className="h-3 w-3 text-primary-500" />
                                                        {member.city}, {member.state}
                                                    </div>
                                                    {member.zone && (
                                                        <span className="text-xs text-fg-tertiary ml-4.5">
                                                            Zona {member.zone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {member.nucleusName ? (
                                                    <Badge variant="secondary" className="font-medium">
                                                        {member.nucleusName}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-fg-tertiary italic">Sem núcleo</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        member.status === 'active' ? "success" :
                                                            member.status === 'interested' ? "default" :
                                                                "default"
                                                    }
                                                    dot
                                                    dotColor={
                                                        member.status === 'active' ? "success" :
                                                            member.status === 'interested' ? "primary" :
                                                                "primary"
                                                    }
                                                >
                                                    {member.status === 'active' ? 'Ativo' :
                                                        member.status === 'interested' ? 'Interessado' :
                                                            member.status === 'in_formation' ? 'Em Formação' : 'Inativo'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/members/${member.id}`)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-danger hover:text-danger hover:bg-danger/10">
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
                                                <div className="h-16 w-16 bg-bg-tertiary rounded-full flex items-center justify-center">
                                                    <Users className="h-8 w-8 text-fg-tertiary opacity-30" />
                                                </div>
                                                <div className="max-w-[250px]">
                                                    <p className="text-fg-primary font-medium">Nenhum filiado encontrado</p>
                                                    <p className="text-fg-tertiary text-sm mt-1">Tente ajustar sua busca ou filtros para encontrar o que procura.</p>
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
    variant?: "default" | "primary" | "success"
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                active
                    ? (variant === "success" ? "bg-success-500 text-white shadow-lg shadow-success-500/20" :
                        variant === "primary" ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" :
                            "bg-fg-primary text-bg-primary shadow-lg shadow-fg-primary/20")
                    : "bg-bg-tertiary text-fg-secondary hover:bg-bg-hover"
            )}
        >
            {label}
            <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] tabular-nums",
                active ? "bg-white/20 text-white" : "bg-bg-hover text-fg-tertiary"
            )}>
                {count}
            </span>
        </button>
    );
}

