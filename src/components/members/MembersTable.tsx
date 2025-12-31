"use client";

import React, { useState } from "react";
import {
    Search,
    Plus,
    ArrowUpDown,
    MoreHorizontal,
    ChevronDown,
    FileDown,
    Filter,
    Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    const router = useRouter();

    const filteredMembers = initialMembers.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.cpf.includes(searchTerm) ||
        (member.city && member.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full bg-bg-primary">
            {/* Table Header/Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-secondary" />
                        <input
                            type="text"
                            placeholder="Pesquisar filiados..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="notion-input pl-9 border-none bg-bg-hover hover:bg-bg-hover/80 transition-colors"
                        />
                    </div>
                    <button className="flex items-center gap-1.5 px-2 py-1 text-sm text-fg-secondary hover:bg-bg-hover rounded transition-colors font-medium">
                        <Filter className="h-4 w-4" />
                        Filtrar
                    </button>
                    <button className="flex items-center gap-1.5 px-2 py-1 text-sm text-fg-secondary hover:bg-bg-hover rounded transition-colors font-medium">
                        <ArrowUpDown className="h-4 w-4" />
                        Ordenar
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onImportClick}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-fg-secondary hover:bg-bg-hover rounded transition-colors"
                    >
                        <FileDown className="h-4 w-4" />
                        Importar
                    </button>
                    <button
                        onClick={onNewClick}
                        className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Filiado
                    </button>
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border-subtle">
                            <th className="px-6 py-3 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider w-8">#</th>
                            <th className="px-6 py-3 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">CPF</th>
                            <th className="px-6 py-3 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Título de Eleitor</th>
                            <th className="px-6 py-3 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Localidade</th>
                            <th className="px-6 py-3 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Núcleo</th>
                            <th className="px-6 py-3 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-[12px] font-semibold text-fg-secondary uppercase tracking-wider w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member, index) => (
                            <tr
                                key={member.id}
                                onClick={() => router.push(`/members/${member.id}`)}
                                className="group border-b border-border-subtle hover:bg-bg-hover/50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-3 text-sm text-fg-secondary tabular-nums">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-3">
                                    <span className="text-sm font-semibold text-fg-primary group-hover:text-primary transition-colors">
                                        {member.fullName}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-fg-secondary tabular-nums">
                                    {member.cpf}
                                </td>
                                <td className="px-6 py-3 text-sm text-fg-secondary tabular-nums">
                                    {member.voterTitle || "—"}
                                </td>
                                <td className="px-6 py-3 text-sm text-fg-secondary">
                                    {member.city}, {member.state} {member.zone ? `(Zona ${member.zone})` : ""}
                                </td>
                                <td className="px-6 py-3">
                                    {member.nucleusName ? (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-bg-hover text-fg-secondary">
                                            {member.nucleusName}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-fg-secondary">Nenhum</span>
                                    )}
                                </td>
                                <td className="px-6 py-3">
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                        member.status === 'active' ? "bg-success/10 text-success" :
                                            member.status === 'interested' ? "bg-primary/10 text-primary" :
                                                "bg-fg-secondary/10 text-fg-secondary"
                                    )}>
                                        {member.status === 'active' ? 'Ativo' :
                                            member.status === 'interested' ? 'Interessado' :
                                                member.status === 'in_formation' ? 'Em Formação' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg-hover rounded transition-all">
                                        <MoreHorizontal className="h-4 w-4 text-fg-secondary" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredMembers.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-10 w-10 text-fg-secondary opacity-20" />
                                        <p className="text-fg-secondary text-sm">Nenhum filiado encontrado.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
