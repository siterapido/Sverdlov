"use client";

import React, { useState } from "react";
import {
    FileDown,
    Users,
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
                "flex items-center gap-2 px-4 py-2 rounded-none text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2",
                active
                    ? (variant === "green" ? "text-emerald-600 border-emerald-600" :
                        variant === "blue" ? "text-primary border-primary" :
                            "text-zinc-900 border-zinc-900")
                    : "text-zinc-400 border-transparent hover:text-zinc-900"
            )}
        >
            {label}
            <span className={cn(
                "px-1.5 py-0.5 text-[9px] tabular-nums",
                active
                    ? (variant === "green" ? "bg-emerald-600 text-white" :
                        variant === "blue" ? "bg-primary text-white" :
                            "bg-zinc-900 text-white")
                    : "bg-zinc-100 text-zinc-500"
            )}>
                {count}
            </span>
        </button>
    );
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

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: "Ativo",
            interested: "Interessado",
            in_formation: "Em Formação",
            inactive: "Inativo"
        };
        return labels[status] || status;
    };

    return (
        <div className="space-y-10">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-0 scrollbar-none border-b border-zinc-100 w-full md:w-auto">
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

                <div className="flex items-center gap-4">
                    <div className="w-full md:w-96">
                        <SearchInput
                            placeholder="PESQUISAR FILIADOS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClear={() => setSearchTerm("")}
                            className="rounded-none border-zinc-900 border-2"
                        />
                    </div>
                    <Button variant="outline" size="lg" onClick={onImportClick} className="hidden sm:flex items-center gap-2 border-2 border-zinc-900 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                        <FileDown className="h-5 w-5" />
                        EXPORTAR
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <div className="border-2 border-zinc-900 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-900 border-b-2 border-zinc-900">
                                <th className="px-8 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Filiado</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Documentação</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Localidade</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Núcleo</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            <AnimatePresence mode="popLayout">
                                {filteredMembers.map((member) => (
                                    <motion.tr
                                        key={member.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-zinc-50 transition-all cursor-pointer"
                                        onClick={() => router.push(`/members/${member.id}`)}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar fallback={member.fullName} size="md" className="bg-zinc-100 text-zinc-900 rounded-none border-2 border-zinc-900" />
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[15px] font-black text-zinc-900 group-hover:text-primary transition-colors leading-tight">
                                                        {member.fullName}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                        DESDE {new Date(member.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-600 tabular-nums">
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-1.5 py-0.5 border border-zinc-100">CPF</span> {member.cpf}
                                                </div>
                                                {member.voterTitle && (
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 tabular-nums">
                                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-1.5 py-0.5 border border-zinc-100">TÍTULO</span> {member.voterTitle}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[13px] font-bold text-zinc-900">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    {member.city}, {member.state}
                                                </div>
                                                {member.zone && (
                                                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider ml-6">
                                                        Zona {member.zone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {member.nucleusName ? (
                                                <Badge variant="blue" className="font-black border-2 border-primary">
                                                    {member.nucleusName}
                                                </Badge>
                                            ) : (
                                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">SEM NÚCLEO</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge
                                                variant={
                                                    member.status === 'active' ? "green" :
                                                        member.status === 'interested' ? "blue" :
                                                            "yellow"
                                                }
                                                className="border-2 font-black"
                                            >
                                                {getStatusLabel(member.status).toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button variant="ghost" size="icon" className="hover:bg-zinc-100 rounded-none">
                                                    <Eye className="h-5 w-5 text-zinc-400" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600 rounded-none">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="h-20 w-20 bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center">
                                                <Users className="h-10 w-10 text-zinc-300" />
                                            </div>
                                            <div className="max-w-[300px] space-y-2">
                                                <p className="text-xl font-black uppercase tracking-tight text-zinc-900">Nenhum filiado encontrado</p>
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Tente ajustar sua busca ou filtros para encontrar o que procura.</p>
                                            </div>
                                            <Button variant="outline" size="lg" className="rounded-none border-2 border-zinc-900 font-black uppercase tracking-widest text-[10px]" onClick={() => { setSearchTerm(""); setFilterStatus(null); }}>
                                                Limpar filtros
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
