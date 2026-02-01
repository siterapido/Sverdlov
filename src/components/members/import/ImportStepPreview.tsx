"use client";

import React, { useState, useMemo } from "react";
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Users,
    Filter,
    RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { StepProps, ValidatedRow, RowStatus, PreviewStats } from "./types";

interface ImportStepPreviewProps extends StepProps {
    stats: PreviewStats;
    onUpdateDuplicatesChange: (value: boolean) => void;
}

type FilterType = 'all' | RowStatus;

export function ImportStepPreview({
    state,
    stats,
    onUpdateDuplicatesChange,
}: ImportStepPreviewProps) {
    const { validatedRows, updateDuplicates, isProcessing } = state;
    const [filter, setFilter] = useState<FilterType>('all');

    // Filtered rows
    const filteredRows = useMemo(() => {
        if (filter === 'all') return validatedRows;
        return validatedRows.filter(row => row.status === filter);
    }, [validatedRows, filter]);

    // Status badge component
    const StatusBadge = ({ status }: { status: RowStatus }) => {
        switch (status) {
            case 'valid':
                return (
                    <Badge variant="green" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Válido
                    </Badge>
                );
            case 'invalid':
                return (
                    <Badge variant="red" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Erro
                    </Badge>
                );
            case 'duplicate':
                return (
                    <Badge variant="yellow" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Duplicata
                    </Badge>
                );
        }
    };

    // Filter buttons
    const filterButtons: { type: FilterType; label: string; count: number }[] = [
        { type: 'all', label: 'Todos', count: stats.total },
        { type: 'valid', label: 'Válidos', count: stats.valid },
        { type: 'invalid', label: 'Erros', count: stats.invalid },
        { type: 'duplicate', label: 'Duplicatas', count: stats.duplicates },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-bg-tertiary/50 border border-border-subtle rounded-none text-center">
                    <Users className="h-5 w-5 mx-auto text-fg-secondary mb-2" />
                    <p className="text-2xl font-bold text-fg-primary">{stats.total}</p>
                    <p className="text-[10px] uppercase tracking-wider text-fg-tertiary font-semibold">Total</p>
                </div>
                <div className="p-4 bg-success-500/5 border border-success-500/20 rounded-none text-center">
                    <CheckCircle2 className="h-5 w-5 mx-auto text-success-500 mb-2" />
                    <p className="text-2xl font-bold text-success-600">{stats.valid}</p>
                    <p className="text-[10px] uppercase tracking-wider text-success-600 font-semibold">Válidos</p>
                </div>
                <div className="p-4 bg-warning-500/5 border border-warning-500/20 rounded-none text-center">
                    <AlertTriangle className="h-5 w-5 mx-auto text-warning-500 mb-2" />
                    <p className="text-2xl font-bold text-warning-600">{stats.duplicates}</p>
                    <p className="text-[10px] uppercase tracking-wider text-warning-600 font-semibold">Duplicatas</p>
                </div>
                <div className="p-4 bg-danger-500/5 border border-danger-500/20 rounded-none text-center">
                    <AlertCircle className="h-5 w-5 mx-auto text-danger-500 mb-2" />
                    <p className="text-2xl font-bold text-danger-600">{stats.invalid}</p>
                    <p className="text-[10px] uppercase tracking-wider text-danger-600 font-semibold">Erros</p>
                </div>
            </div>

            {/* Duplicate Handling Option */}
            {stats.duplicates > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-warning-500/5 border border-warning-500/20 rounded-none"
                >
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={updateDuplicates}
                            onChange={(e) => onUpdateDuplicatesChange(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded-none border-2 border-warning-500 text-warning-500 focus:ring-warning-500/20"
                        />
                        <div>
                            <p className="text-sm font-semibold text-fg-primary flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-warning-500" />
                                Atualizar duplicatas
                            </p>
                            <p className="text-xs text-fg-tertiary mt-1">
                                Os dados da planilha substituirão os dados existentes dos {stats.duplicates} cadastros duplicados.
                            </p>
                        </div>
                    </label>
                </motion.div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-border-subtle">
                <Filter className="h-4 w-4 text-fg-tertiary" />
                {filterButtons.map(btn => (
                    <button
                        key={btn.type}
                        onClick={() => setFilter(btn.type)}
                        className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                            filter === btn.type
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-fg-tertiary hover:text-fg-secondary'
                        }`}
                    >
                        {btn.label} ({btn.count})
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <div className="border border-border-subtle rounded-none overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-bg-tertiary/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                    #
                                </th>
                                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                    Nome
                                </th>
                                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                    CPF
                                </th>
                                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                    Email
                                </th>
                                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                    Status
                                </th>
                                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                    Detalhes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-fg-tertiary">
                                        Nenhum registro encontrado com este filtro
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.slice(0, 100).map((row) => (
                                    <tr
                                        key={row.index}
                                        className={`${
                                            row.status === 'invalid'
                                                ? 'bg-danger-500/5'
                                                : row.status === 'duplicate'
                                                  ? 'bg-warning-500/5'
                                                  : ''
                                        }`}
                                    >
                                        <td className="px-4 py-2 text-fg-tertiary">
                                            {row.index + 1}
                                        </td>
                                        <td className="px-4 py-2 font-medium text-fg-primary truncate max-w-[150px]">
                                            {row.data.fullName || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-fg-secondary">
                                            {row.data.cpf
                                                ? `${row.data.cpf.slice(0, 3)}.${row.data.cpf.slice(3, 6)}.${row.data.cpf.slice(6, 9)}-${row.data.cpf.slice(9)}`
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-fg-secondary truncate max-w-[150px]">
                                            {row.data.email || '-'}
                                        </td>
                                        <td className="px-4 py-2">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-4 py-2 text-xs text-fg-tertiary max-w-[200px]">
                                            {row.status === 'invalid' && row.errors && (
                                                <span className="text-danger-500">
                                                    {row.errors.map(e => e.message).join(', ')}
                                                </span>
                                            )}
                                            {row.status === 'duplicate' && row.duplicateInfo && (
                                                <span className="text-warning-600">
                                                    Já existe: {row.duplicateInfo.existingName}
                                                    {' '}({row.duplicateInfo.matchedField === 'cpf' ? 'mesmo CPF' :
                                                        row.duplicateInfo.matchedField === 'email' ? 'mesmo Email' : 'mesmo Título'})
                                                </span>
                                            )}
                                            {row.status === 'valid' && (
                                                <span className="text-success-500">Pronto para importar</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredRows.length > 100 && (
                    <div className="px-4 py-2 bg-bg-tertiary/50 border-t border-border-subtle text-xs text-fg-tertiary text-center">
                        Mostrando 100 de {filteredRows.length} registros
                    </div>
                )}
            </div>

            {/* Import Summary */}
            <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-none">
                <p className="text-sm text-fg-primary font-semibold mb-1">
                    Resumo da importação
                </p>
                <p className="text-xs text-fg-tertiary">
                    {stats.valid} novos cadastros serão criados
                    {updateDuplicates && stats.duplicates > 0 && (
                        <>, {stats.duplicates} serão atualizados</>
                    )}
                    {!updateDuplicates && stats.duplicates > 0 && (
                        <>, {stats.duplicates} duplicatas serão ignoradas</>
                    )}
                    {stats.invalid > 0 && (
                        <>, {stats.invalid} com erro serão ignorados</>
                    )}.
                </p>
            </div>

            {/* Processing indicator */}
            {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-fg-secondary">Validando dados...</span>
                </div>
            )}
        </motion.div>
    );
}
