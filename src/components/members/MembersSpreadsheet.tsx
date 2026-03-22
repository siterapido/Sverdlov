"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Download,
    X,
    Users,
    MapPin,
    MoreHorizontal,
    Eye,
    Edit2,
    Trash2,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    type SelectOption,
} from "@/components/ui/select";

interface Member {
    id: string;
    fullName: string;
    cpf: string | null;
    voterTitle: string | null;
    state: string | null;
    city: string | null;
    zone: string | null;
    status: string;
    nucleusName: string | null;
    createdAt: Date;
    email?: string | null;
    phone?: string | null;
}

interface MembersSpreadsheetProps {
    members: Member[];
    onExportClick: () => void;
}

type FilterField = "status" | "nucleus" | "state" | "city" | "militancy";

const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: "Ativo", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    interested: { label: "Interessado", color: "bg-blue-100 text-blue-700 border-blue-200" },
    in_formation: { label: "Em formação", color: "bg-amber-100 text-amber-700 border-amber-200" },
    inactive: { label: "Inativo", color: "bg-zinc-100 text-zinc-600 border-zinc-200" },
};

const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Ativo" },
    { value: "interested", label: "Interessado" },
    { value: "in_formation", label: "Em formação" },
    { value: "inactive", label: "Inativo" },
];

const stateOptions = ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "PE", "CE", "PA", "MA", "GO", "DF"];

function ActionMenu({ memberId, router }: { memberId: string; router: ReturnType<typeof useRouter> }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={menuRef} className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            >
                <MoreHorizontal className="h-4 w-4" />
            </Button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white border border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/members/${memberId}`);
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                        Ver detalhes
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/members/${memberId}?edit=true`);
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
                    >
                        <Edit2 className="h-4 w-4" />
                        Editar
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                    </button>
                </div>
            )}
        </div>
    );
}

export function MembersSpreadsheet({ members, onExportClick }: MembersSpreadsheetProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<Record<FilterField, string>>({
        status: "all",
        nucleus: "all",
        state: "all",
        city: "all",
        militancy: "all",
    });

    const uniqueCities = useMemo(() => {
        const cities = members
            .map((m) => m.city)
            .filter((c): c is string => c !== null);
        return [...new Set(cities)].sort();
    }, [members]);

    const uniqueNuclei = useMemo(() => {
        const nuclei = members
            .map((m) => m.nucleusName)
            .filter((n): n is string => n !== null);
        return [...new Set(nuclei)].sort();
    }, [members]);

    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            const searchLower = search.toLowerCase();
            const matchesSearch =
                !search ||
                member.fullName.toLowerCase().includes(searchLower) ||
                member.cpf?.includes(search) ||
                member.email?.toLowerCase().includes(searchLower) ||
                member.city?.toLowerCase().includes(searchLower);

            const matchesStatus = filters.status === "all" || member.status === filters.status;
            const matchesState = filters.state === "all" || member.state === filters.state;
            const matchesCity = filters.city === "all" || member.city === filters.city;
            const matchesNucleus =
                filters.nucleus === "all" || member.nucleusName === filters.nucleus;

            return matchesSearch && matchesStatus && matchesState && matchesCity && matchesNucleus;
        });
    }, [members, search, filters]);

    const activeFiltersCount = Object.values(filters).filter((v) => v !== "all").length;

    const clearFilters = () => {
        setFilters({ status: "all", nucleus: "all", state: "all", city: "all", militancy: "all" });
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date(date));
    };

    const formatCpf = (cpf: string | null) => {
        if (!cpf) return "-";
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const statusSelectOptions: SelectOption[] = statusOptions;
    const stateSelectOptions: SelectOption[] = [
        { value: "all", label: "Todas UFs" },
        ...stateOptions.map((uf) => ({ value: uf, label: uf })),
    ];
    const citySelectOptions: SelectOption[] = [
        { value: "all", label: "Todas" },
        ...uniqueCities
            .filter((c) => filters.state === "all" || members.find((m) => m.city === c)?.state === filters.state)
            .map((city) => ({ value: city, label: city })),
    ];
    const nucleusSelectOptions: SelectOption[] = [
        { value: "all", label: "Todos" },
        ...uniqueNuclei.map((n) => ({ value: n, label: n })),
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 bg-zinc-50/50">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nome, CPF, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 bg-white border-zinc-200 focus:border-zinc-400 rounded-none"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Quick Filters */}
                <div className="flex items-center gap-2">
                    <Select
                        options={statusSelectOptions}
                        value={filters.status}
                        onChange={(v) => setFilters((f) => ({ ...f, status: v as string }))}
                    />

                    <Select
                        options={stateSelectOptions}
                        value={filters.state}
                        onChange={(v) => setFilters((f) => ({ ...f, state: v as string, city: "all" }))}
                    />

                    {uniqueCities.length > 0 && (
                        <Select
                            options={citySelectOptions}
                            value={filters.city}
                            onChange={(v) => setFilters((f) => ({ ...f, city: v as string }))}
                            disabled={filters.state === "all"}
                        />
                    )}

                    {uniqueNuclei.length > 0 && (
                        <Select
                            options={nucleusSelectOptions}
                            value={filters.nucleus}
                            onChange={(v) => setFilters((f) => ({ ...f, nucleus: v as string }))}
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-9 text-zinc-600 hover:text-zinc-900"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Limpar ({activeFiltersCount})
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onExportClick}
                        className="h-9 border-zinc-200 rounded-none gap-1.5"
                    >
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Results count */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 text-xs text-zinc-500">
                <span className="font-medium">{filteredMembers.length}</span>
                <span>de {members.length} filiados</span>
            </div>

            {/* Spreadsheet Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-zinc-100">
                        <tr>
                            <th className="w-12 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                                #
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 min-w-[200px]">
                                Nome
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                                CPF
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                                Email
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                                Telefone
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                                Localidade
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                                Núcleo
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                                Status
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                                Cadastro
                            </th>
                            <th className="w-12 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-3 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                                        <Users className="h-10 w-10" />
                                        <p className="font-medium text-zinc-600">
                                            Nenhum filiado encontrado
                                        </p>
                                        <p className="text-xs">
                                            Tente ajustar os filtros ou busca
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member, index) => (
                                <tr
                                    key={member.id}
                                    className="hover:bg-zinc-50 cursor-pointer transition-colors group"
                                    onClick={() => router.push(`/members/${member.id}`)}
                                >
                                    <td className="px-3 py-2 text-xs text-zinc-400 font-mono">
                                        {String(index + 1).padStart(3, "0")}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="font-medium text-zinc-900 hover:text-primary">
                                            {member.fullName}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 font-mono text-xs text-zinc-600">
                                        {formatCpf(member.cpf)}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-zinc-600">
                                        {member.email || "-"}
                                    </td>
                                    <td className="px-3 py-2 font-mono text-xs text-zinc-600">
                                        {member.phone
                                            ? member.phone.replace(
                                                  /(\d{2})(\d{5})(\d{4})/,
                                                  "($1) $2-$3"
                                              )
                                            : "-"}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-zinc-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-zinc-400" />
                                            {member.city || "-"}, {member.state || "-"}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        {member.nucleusName ? (
                                            <span className="text-xs font-medium text-zinc-700">
                                                {member.nucleusName}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-zinc-400 italic">
                                                Sem núcleo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider border rounded-sm px-1.5 py-0",
                                                statusConfig[member.status]?.color ||
                                                    "bg-zinc-100 text-zinc-600 border-zinc-200"
                                            )}
                                        >
                                            {statusConfig[member.status]?.label || member.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-zinc-500">
                                        {formatDate(member.createdAt)}
                                    </td>
                                    <td className="px-3 py-2">
                                        <ActionMenu memberId={member.id} router={router} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
                <span>
                    Mostrando {filteredMembers.length} de {members.length} registros
                </span>
                <span>
                    Página 1 de 1
                </span>
            </div>
        </div>
    );
}
