"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Select, type SelectOption } from "@/components/ui/select";
import { DatePicker, type DateRange, DateRangePicker } from "@/components/ui/date-picker";
import { SearchInput } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyData } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    RefreshCw,
    Download,
    Filter,
    Eye,
    Plus,
    Pencil,
    Trash2,
    LogIn,
    LogOut,
    FileUp,
    FileDown,
} from "lucide-react";
import { getAuditLogs, type AuditLogWithUser } from "./actions";

const actionOptions: SelectOption[] = [
    { value: "", label: "Todas as ações" },
    { value: "CREATE", label: "Criação" },
    { value: "UPDATE", label: "Atualização" },
    { value: "DELETE", label: "Exclusão" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
    { value: "EXPORT", label: "Exportação" },
    { value: "IMPORT", label: "Importação" },
    { value: "VIEW", label: "Visualização" },
];

const tableOptions: SelectOption[] = [
    { value: "", label: "Todas as tabelas" },
    { value: "users", label: "Usuários" },
    { value: "members", label: "Membros" },
    { value: "nuclei", label: "Núcleos" },
    { value: "finances", label: "Finanças" },
    { value: "schedules", label: "Escalas" },
    { value: "projects", label: "Projetos" },
];

const actionIcons: Record<string, React.ReactNode> = {
    CREATE: <Plus className="h-3.5 w-3.5" />,
    UPDATE: <Pencil className="h-3.5 w-3.5" />,
    DELETE: <Trash2 className="h-3.5 w-3.5" />,
    LOGIN: <LogIn className="h-3.5 w-3.5" />,
    LOGOUT: <LogOut className="h-3.5 w-3.5" />,
    EXPORT: <FileDown className="h-3.5 w-3.5" />,
    IMPORT: <FileUp className="h-3.5 w-3.5" />,
    VIEW: <Eye className="h-3.5 w-3.5" />,
};

const actionColors: Record<string, string> = {
    CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    LOGIN: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    LOGOUT: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    EXPORT: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    IMPORT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    VIEW: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [total, setTotal] = useState(0);

    // Filters
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [tableFilter, setTableFilter] = useState("");
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    const [showFilters, setShowFilters] = useState(false);

    // Selected log for detail view
    const [selectedLog, setSelectedLog] = useState<AuditLogWithUser | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const result = await getAuditLogs({
                page,
                pageSize,
                action: (actionFilter || undefined) as import("@/lib/db/schema").AuditAction | undefined,
                tableName: tableFilter || undefined,
                startDate: dateRange.start || undefined,
                endDate: dateRange.end || undefined,
                search: search || undefined,
            });
            setLogs(result.logs);
            setTotal(result.total);
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, pageSize, actionFilter, tableFilter, dateRange]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) {
                fetchLogs();
            } else {
                setPage(1);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const columns: DataTableColumn<AuditLogWithUser>[] = [
        {
            key: "createdAt",
            header: "Data/Hora",
            width: "160px",
            render: (row) => (
                <div className="text-sm">
                    <div className="font-medium">
                        {format(new Date(row.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <div className="text-xs text-zinc-500">
                        {format(new Date(row.createdAt), "HH:mm:ss")}
                    </div>
                </div>
            ),
        },
        {
            key: "action",
            header: "Ação",
            width: "120px",
            render: (row) => (
                <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium",
                    actionColors[row.action]
                )}>
                    {actionIcons[row.action]}
                    {row.action}
                </span>
            ),
        },
        {
            key: "tableName",
            header: "Tabela",
            width: "120px",
            render: (row) => (
                <span className="text-sm font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5">
                    {row.tableName}
                </span>
            ),
        },
        {
            key: "user",
            header: "Usuário",
            render: (row) => (
                <div className="text-sm">
                    {row.user ? (
                        <>
                            <div className="font-medium">{row.user.fullName}</div>
                            <div className="text-xs text-zinc-500">{row.user.email}</div>
                        </>
                    ) : (
                        <span className="text-zinc-400">Sistema</span>
                    )}
                </div>
            ),
        },
        {
            key: "changedFields",
            header: "Alterações",
            render: (row) => {
                if (!row.changedFields) return <span className="text-zinc-400">-</span>;

                const fields = Object.keys(row.changedFields as Record<string, unknown>);
                if (fields.length === 0) return <span className="text-zinc-400">-</span>;

                return (
                    <div className="flex flex-wrap gap-1">
                        {fields.slice(0, 3).map(field => (
                            <span
                                key={field}
                                className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5"
                            >
                                {field}
                            </span>
                        ))}
                        {fields.length > 3 && (
                            <span className="text-[10px] text-zinc-500">
                                +{fields.length - 3}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "ipAddress",
            header: "IP",
            width: "130px",
            render: (row) => (
                <span className="text-xs font-mono text-zinc-500">
                    {row.ipAddress || "-"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            width: "60px",
            align: "center",
            render: (row) => (
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(row);
                    }}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    const clearFilters = () => {
        setSearch("");
        setActionFilter("");
        setTableFilter("");
        setDateRange({ start: null, end: null });
    };

    const hasActiveFilters = search || actionFilter || tableFilter || dateRange.start || dateRange.end;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">
                        Logs de Auditoria
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Histórico de todas as ações realizadas no sistema
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLogs}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                    >
                        Atualizar
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="h-4 w-4" />}
                    >
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-col gap-4">
                        {/* Search and toggle */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 max-w-md">
                                <SearchInput
                                    placeholder="Buscar por usuário, tabela, ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClear={() => setSearch("")}
                                />
                            </div>
                            <Button
                                variant={showFilters ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                leftIcon={<Filter className="h-4 w-4" />}
                            >
                                Filtros
                                {hasActiveFilters && (
                                    <span className="ml-1.5 h-5 w-5 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full">
                                        !
                                    </span>
                                )}
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    Limpar filtros
                                </Button>
                            )}
                        </div>

                        {/* Extended filters */}
                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                <Select
                                    options={actionOptions}
                                    value={actionFilter}
                                    onChange={(v) => setActionFilter(v as string)}
                                    placeholder="Tipo de ação"
                                />
                                <Select
                                    options={tableOptions}
                                    value={tableFilter}
                                    onChange={(v) => setTableFilter(v as string)}
                                    placeholder="Tabela"
                                />
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                    placeholder="Período"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                data={logs}
                columns={columns}
                loading={loading}
                pagination={{
                    page,
                    pageSize,
                    total,
                    onPageChange: setPage,
                    onPageSizeChange: setPageSize,
                    pageSizeOptions: [10, 25, 50, 100],
                }}
                onRowClick={(row) => setSelectedLog(row)}
                emptyMessage="Nenhum log encontrado"
                stickyHeader
            />

            {/* Detail Modal */}
            {selectedLog && (
                <LogDetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
}

// === LOG DETAIL MODAL ===
function LogDetailModal({
    log,
    onClose,
}: {
    log: AuditLogWithUser;
    onClose: () => void;
}) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden pointer-events-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                        <h2 className="text-lg font-bold">Detalhes do Log</h2>
                        <Button variant="ghost" size="icon-sm" onClick={onClose}>
                            ×
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                        <div className="space-y-6">
                            {/* Basic info */}
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem
                                    label="Data/Hora"
                                    value={format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                />
                                <InfoItem
                                    label="Ação"
                                    value={
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium",
                                            actionColors[log.action]
                                        )}>
                                            {actionIcons[log.action]}
                                            {log.action}
                                        </span>
                                    }
                                />
                                <InfoItem label="Tabela" value={log.tableName} />
                                <InfoItem label="ID do Registro" value={log.recordId || "-"} />
                                <InfoItem
                                    label="Usuário"
                                    value={log.user ? `${log.user.fullName} (${log.user.email})` : "Sistema"}
                                />
                                <InfoItem label="Endereço IP" value={log.ipAddress || "-"} />
                            </div>

                            {/* User Agent */}
                            {log.userAgent && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2">
                                        User Agent
                                    </h4>
                                    <p className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-3 break-all">
                                        {log.userAgent}
                                    </p>
                                </div>
                            )}

                            {/* Changed Fields */}
                            {log.changedFields && Object.keys(log.changedFields as object).length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2">
                                        Campos Alterados
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(log.changedFields as Record<string, { old: unknown; new: unknown }>).map(([field, change]) => (
                                            <div
                                                key={field}
                                                className="bg-zinc-50 dark:bg-zinc-800 p-3 text-sm"
                                            >
                                                <div className="font-medium mb-1">{field}</div>
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="text-zinc-500">Antes: </span>
                                                        <span className="font-mono text-red-600 dark:text-red-400">
                                                            {JSON.stringify(change.old)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-500">Depois: </span>
                                                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                                            {JSON.stringify(change.new)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Old Values */}
                            {log.oldValues && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2">
                                        Valores Anteriores
                                    </h4>
                                    <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-3 overflow-x-auto">
                                        {JSON.stringify(log.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* New Values */}
                            {log.newValues && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2">
                                        Novos Valores
                                    </h4>
                                    <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-3 overflow-x-auto">
                                        {JSON.stringify(log.newValues, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Metadata */}
                            {log.metadata && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2">
                                        Metadados
                                    </h4>
                                    <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-3 overflow-x-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-1">
                {label}
            </dt>
            <dd className="text-sm font-medium">{value}</dd>
        </div>
    );
}
