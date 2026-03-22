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
                    <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary border font-black uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" />
                        Válido
                    </Badge>
                );
            case 'invalid':
                return (
                    <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary border font-black uppercase tracking-wider">
                        <AlertCircle className="h-3 w-3" />
                        Erro
                    </Badge>
                );
            case 'duplicate':
                return (
                    <Badge className="flex items-center gap-1 bg-zinc-100 text-zinc-900 border-zinc-900 border font-black uppercase tracking-wider">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-3 sm:p-4 bg-white border-2 border-zinc-900 text-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-zinc-900 mb-2" />
                    <p className="text-xl sm:text-2xl font-black text-zinc-900">{stats.total}</p>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-900 font-black">Total</p>
                </div>
                <div className="p-3 sm:p-4 bg-primary/5 border-2 border-primary text-center">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-primary mb-2" />
                    <p className="text-xl sm:text-2xl font-black text-primary">{stats.valid}</p>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary font-black">Válidos</p>
                </div>
                <div className="p-3 sm:p-4 bg-zinc-100 border-2 border-zinc-900 text-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-zinc-900 mb-2" />
                    <p className="text-xl sm:text-2xl font-black text-zinc-900">{stats.duplicates}</p>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-900 font-black">Duplicatas</p>
                </div>
                <div className="p-3 sm:p-4 bg-primary/5 border-2 border-primary text-center">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-primary mb-2" />
                    <p className="text-xl sm:text-2xl font-black text-primary">{stats.invalid}</p>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary font-black">Erros</p>
                </div>
            </div>

            {/* Duplicate Handling Option */}
            {stats.duplicates > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 sm:p-4 bg-zinc-100 border-2 border-zinc-900"
                >
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={updateDuplicates}
                            onChange={(e) => onUpdateDuplicatesChange(e.target.checked)}
                            className="mt-1 h-4 w-4 border-2 border-zinc-900 text-primary focus:ring-primary/20"
                        />
                        <div>
                            <p className="text-xs sm:text-sm font-black text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
                                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                Atualizar duplicatas
                            </p>
                            <p className="text-xs text-zinc-600 mt-1 font-medium">
                                Os dados da planilha substituirão os dados existentes dos {stats.duplicates} cadastros duplicados.
                            </p>
                        </div>
                    </label>
                </motion.div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b-2 border-zinc-900">
                <Filter className="h-4 w-4 text-zinc-900" />
                {filterButtons.map(btn => (
                    <button
                        key={btn.type}
                        onClick={() => setFilter(btn.type)}
                        className={`px-2 py-1.5 sm:px-3 sm:py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${
                            filter === btn.type
                                ? 'border-primary text-primary'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900'
                        }`}
                    >
                        {btn.label} ({btn.count})
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <div className="border-2 border-zinc-900 overflow-hidden">
                <div className="max-h-[200px] sm:max-h-[300px] overflow-y-auto overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-900 sticky top-0">
                            <tr>
                                <th className="px-2 py-1.5 sm:px-4 sm:py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                    #
                                </th>
                                <th className="px-2 py-1.5 sm:px-4 sm:py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                    Nome
                                </th>
                                <th className="hidden sm:table-cell px-2 py-1.5 sm:px-4 sm:py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                    CPF
                                </th>
                                <th className="px-2 py-1.5 sm:px-4 sm:py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                    Email
                                </th>
                                <th className="px-2 py-1.5 sm:px-4 sm:py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                    Status
                                </th>
                                <th className="hidden md:table-cell px-2 py-1.5 sm:px-4 sm:py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                    Detalhes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-zinc-900">
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-2 py-8 sm:px-4 text-center text-zinc-500 font-semibold">
                                        Nenhum registro encontrado com este filtro
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.slice(0, 100).map((row) => (
                                    <tr
                                        key={row.index}
                                        className={`${
                                            row.status === 'invalid'
                                                ? 'bg-primary/5'
                                                : row.status === 'duplicate'
                                                  ? 'bg-zinc-100'
                                                  : 'bg-white'
                                        }`}
                                    >
                                        <td className="px-2 py-1.5 sm:px-4 sm:py-2 text-zinc-600 font-semibold">
                                            {row.index + 1}
                                        </td>
                                        <td className="px-2 py-1.5 sm:px-4 sm:py-2 font-bold text-zinc-900 truncate max-w-[120px] sm:max-w-[150px]">
                                            {row.data.fullName || '-'}
                                        </td>
                                        <td className="hidden sm:table-cell px-2 py-1.5 sm:px-4 sm:py-2 text-zinc-700 font-medium">
                                            {row.data.cpf
                                                ? `${row.data.cpf.slice(0, 3)}.${row.data.cpf.slice(3, 6)}.${row.data.cpf.slice(6, 9)}-${row.data.cpf.slice(9)}`
                                                : '-'}
                                        </td>
                                        <td className="px-2 py-1.5 sm:px-4 sm:py-2 text-zinc-700 truncate max-w-[120px] sm:max-w-[150px] font-medium">
                                            {row.data.email || '-'}
                                        </td>
                                        <td className="px-2 py-1.5 sm:px-4 sm:py-2">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="hidden md:table-cell px-2 py-1.5 sm:px-4 sm:py-2 text-xs text-zinc-700 max-w-[200px] font-medium">
                                            {row.status === 'invalid' && row.errors && (
                                                <span className="text-primary font-semibold">
                                                    {row.errors.map(e => e.message).join(', ')}
                                                </span>
                                            )}
                                            {row.status === 'duplicate' && row.duplicateInfo && (
                                                <span className="text-zinc-900 font-semibold">
                                                    Já existe: {row.duplicateInfo.existingName}
                                                    {' '}({row.duplicateInfo.matchedField === 'cpf' ? 'mesmo CPF' :
                                                        row.duplicateInfo.matchedField === 'email' ? 'mesmo Email' : 'mesmo Título'})
                                                </span>
                                            )}
                                            {row.status === 'valid' && (
                                                <span className="text-primary font-semibold">Pronto para importar</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredRows.length > 100 && (
                    <div className="px-2 py-2 sm:px-4 bg-zinc-100 border-t-2 border-zinc-900 text-xs text-zinc-900 text-center font-semibold">
                        Mostrando 100 de {filteredRows.length} registros
                    </div>
                )}
            </div>

            {/* Import Summary */}
            <div className="p-3 sm:p-4 bg-primary/5 border-2 border-primary">
                <p className="text-sm text-zinc-900 font-black mb-1 uppercase tracking-wide">
                    Resumo da importação
                </p>
                <p className="text-xs text-zinc-900 font-semibold">
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
