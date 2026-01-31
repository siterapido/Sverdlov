"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { DateRangePicker, type DateRange } from "@/components/ui/date-picker";
import { SearchInput } from "@/components/ui/input";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    Save,
    Download,
} from "lucide-react";

export interface MemberFilters {
    search?: string;
    status?: string[];
    militancyLevel?: string[];
    financialStatus?: string[];
    state?: string;
    city?: string;
    zone?: string;
    nucleusId?: string;
    dateRange?: DateRange;
    hasEmail?: boolean;
    hasPhone?: boolean;
}

interface MembersFiltersProps {
    filters: MemberFilters;
    onChange: (filters: MemberFilters) => void;
    nucleiOptions?: SelectOption[];
    stateOptions?: SelectOption[];
    cityOptions?: SelectOption[];
    onExport?: () => void;
    onSaveFilter?: () => void;
    className?: string;
}

const statusOptions = [
    { value: "interested", label: "Interessado", description: "Manifestou interesse" },
    { value: "in_formation", label: "Em formação", description: "Participando de formação" },
    { value: "active", label: "Ativo", description: "Membro ativo" },
    { value: "inactive", label: "Inativo", description: "Membro inativo" },
];

const militancyOptions = [
    { value: "supporter", label: "Apoiador", description: "Apoiador do movimento" },
    { value: "militant", label: "Militante", description: "Militante ativo" },
    { value: "leader", label: "Dirigente", description: "Cargo de liderança" },
];

const financialOptions = [
    { value: "up_to_date", label: "Em dia", description: "Contribuições em dia" },
    { value: "late", label: "Atrasado", description: "Com pendências" },
    { value: "exempt", label: "Isento", description: "Isento de contribuição" },
];

export function MembersFilters({
    filters,
    onChange,
    nucleiOptions = [],
    stateOptions = [],
    cityOptions = [],
    onExport,
    onSaveFilter,
    className,
}: MembersFiltersProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const updateFilter = <K extends keyof MemberFilters>(
        key: K,
        value: MemberFilters[K]
    ) => {
        onChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onChange({});
    };

    const activeFilterCount = React.useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status?.length) count++;
        if (filters.militancyLevel?.length) count++;
        if (filters.financialStatus?.length) count++;
        if (filters.state) count++;
        if (filters.city) count++;
        if (filters.zone) count++;
        if (filters.nucleusId) count++;
        if (filters.dateRange?.start || filters.dateRange?.end) count++;
        if (filters.hasEmail !== undefined) count++;
        if (filters.hasPhone !== undefined) count++;
        return count;
    }, [filters]);

    const hasActiveFilters = activeFilterCount > 0;

    return (
        <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700", className)}>
            {/* Main filter bar */}
            <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <SearchInput
                            placeholder="Buscar por nome, CPF, email..."
                            value={filters.search || ""}
                            onChange={(e) => updateFilter("search", e.target.value)}
                            onClear={() => updateFilter("search", "")}
                        />
                    </div>

                    {/* Quick filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Select
                            options={[
                                { value: "", label: "Todos os status" },
                                ...statusOptions.map(s => ({ value: s.value, label: s.label })),
                            ]}
                            value={filters.status?.[0] || ""}
                            onChange={(v) => updateFilter("status", v ? [v as string] : undefined)}
                            placeholder="Status"
                            className="w-40"
                            selectSize="sm"
                        />

                        <Select
                            options={[
                                { value: "", label: "Todos os níveis" },
                                ...militancyOptions.map(m => ({ value: m.value, label: m.label })),
                            ]}
                            value={filters.militancyLevel?.[0] || ""}
                            onChange={(v) => updateFilter("militancyLevel", v ? [v as string] : undefined)}
                            placeholder="Nível"
                            className="w-40"
                            selectSize="sm"
                        />

                        {nucleiOptions.length > 0 && (
                            <Select
                                options={[
                                    { value: "", label: "Todos os núcleos" },
                                    ...nucleiOptions,
                                ]}
                                value={filters.nucleusId || ""}
                                onChange={(v) => updateFilter("nucleusId", v as string || undefined)}
                                placeholder="Núcleo"
                                className="w-44"
                                selectSize="sm"
                                searchable
                            />
                        )}

                        {/* Toggle advanced filters */}
                        <Button
                            variant={isExpanded ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="gap-1.5"
                        >
                            <Filter className="h-4 w-4" />
                            Filtros
                            {hasActiveFilters && (
                                <Badge variant="default" className="ml-1 h-5 min-w-[20px] flex items-center justify-center">
                                    {activeFilterCount}
                                </Badge>
                            )}
                            {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                            )}
                        </Button>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-zinc-500"
                            >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Limpar
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Advanced filters panel */}
            {isExpanded && (
                <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Status checkboxes */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-3">
                                Status
                            </h4>
                            <CheckboxGroup
                                options={statusOptions}
                                value={filters.status || []}
                                onChange={(values) => updateFilter("status", values.length > 0 ? values : undefined)}
                                size="sm"
                            />
                        </div>

                        {/* Militancy level checkboxes */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-3">
                                Nível de Militância
                            </h4>
                            <CheckboxGroup
                                options={militancyOptions}
                                value={filters.militancyLevel || []}
                                onChange={(values) => updateFilter("militancyLevel", values.length > 0 ? values : undefined)}
                                size="sm"
                            />
                        </div>

                        {/* Financial status checkboxes */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-3">
                                Situação Financeira
                            </h4>
                            <CheckboxGroup
                                options={financialOptions}
                                value={filters.financialStatus || []}
                                onChange={(values) => updateFilter("financialStatus", values.length > 0 ? values : undefined)}
                                size="sm"
                            />
                        </div>

                        {/* Territorial filters */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                                Localização
                            </h4>

                            {stateOptions.length > 0 && (
                                <Select
                                    options={[
                                        { value: "", label: "Todos os estados" },
                                        ...stateOptions,
                                    ]}
                                    value={filters.state || ""}
                                    onChange={(v) => {
                                        updateFilter("state", v as string || undefined);
                                        // Clear city when state changes
                                        if (filters.city) updateFilter("city", undefined);
                                    }}
                                    placeholder="Estado"
                                    selectSize="sm"
                                    searchable
                                />
                            )}

                            {cityOptions.length > 0 && filters.state && (
                                <Select
                                    options={[
                                        { value: "", label: "Todas as cidades" },
                                        ...cityOptions,
                                    ]}
                                    value={filters.city || ""}
                                    onChange={(v) => updateFilter("city", v as string || undefined)}
                                    placeholder="Cidade"
                                    selectSize="sm"
                                    searchable
                                />
                            )}
                        </div>
                    </div>

                    {/* Additional filters row */}
                    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap items-end gap-4">
                        {/* Date range */}
                        <div className="w-full max-w-xs">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 block mb-2">
                                Data de Cadastro
                            </label>
                            <DateRangePicker
                                value={filters.dateRange || { start: null, end: null }}
                                onChange={(range) => updateFilter("dateRange", range)}
                                placeholder="Selecione o período"
                                inputSize="sm"
                            />
                        </div>

                        {/* Contact filters */}
                        <div className="flex items-center gap-4">
                            <Checkbox
                                checked={filters.hasEmail === true}
                                onChange={(checked) => updateFilter("hasEmail", checked ? true : undefined)}
                                label="Com email"
                                size="sm"
                            />
                            <Checkbox
                                checked={filters.hasPhone === true}
                                onChange={(checked) => updateFilter("hasPhone", checked ? true : undefined)}
                                label="Com telefone"
                                size="sm"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="ml-auto flex items-center gap-2">
                            {onSaveFilter && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onSaveFilter}
                                    leftIcon={<Save className="h-4 w-4" />}
                                >
                                    Salvar filtro
                                </Button>
                            )}
                            {onExport && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onExport}
                                    leftIcon={<Download className="h-4 w-4" />}
                                >
                                    Exportar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Active filters display */}
            {hasActiveFilters && !isExpanded && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {filters.search && (
                        <FilterTag
                            label={`Busca: "${filters.search}"`}
                            onRemove={() => updateFilter("search", undefined)}
                        />
                    )}
                    {filters.status?.map(s => (
                        <FilterTag
                            key={s}
                            label={statusOptions.find(opt => opt.value === s)?.label || s}
                            onRemove={() => updateFilter("status", filters.status?.filter(x => x !== s))}
                        />
                    ))}
                    {filters.militancyLevel?.map(m => (
                        <FilterTag
                            key={m}
                            label={militancyOptions.find(opt => opt.value === m)?.label || m}
                            onRemove={() => updateFilter("militancyLevel", filters.militancyLevel?.filter(x => x !== m))}
                        />
                    ))}
                    {filters.financialStatus?.map(f => (
                        <FilterTag
                            key={f}
                            label={financialOptions.find(opt => opt.value === f)?.label || f}
                            onRemove={() => updateFilter("financialStatus", filters.financialStatus?.filter(x => x !== f))}
                        />
                    ))}
                    {filters.state && (
                        <FilterTag
                            label={`Estado: ${filters.state}`}
                            onRemove={() => {
                                updateFilter("state", undefined);
                                updateFilter("city", undefined);
                            }}
                        />
                    )}
                    {filters.city && (
                        <FilterTag
                            label={`Cidade: ${filters.city}`}
                            onRemove={() => updateFilter("city", undefined)}
                        />
                    )}
                    {filters.nucleusId && (
                        <FilterTag
                            label={`Núcleo: ${nucleiOptions.find(n => n.value === filters.nucleusId)?.label || filters.nucleusId}`}
                            onRemove={() => updateFilter("nucleusId", undefined)}
                        />
                    )}
                    {(filters.dateRange?.start || filters.dateRange?.end) && (
                        <FilterTag
                            label="Período selecionado"
                            onRemove={() => updateFilter("dateRange", undefined)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {label}
            <button
                onClick={onRemove}
                className="ml-0.5 p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm transition-colors"
            >
                <X className="h-3 w-3" />
            </button>
        </span>
    );
}

export default MembersFilters;
