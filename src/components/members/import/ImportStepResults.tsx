"use client";

import React, { useCallback } from "react";
import {
    CheckCircle2,
    AlertCircle,
    Download,
    RefreshCw,
    Users,
    XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { StepProps, ImportResults } from "./types";

interface ImportStepResultsProps extends StepProps {
    results: ImportResults;
    onComplete: () => void;
}

export function ImportStepResults({ results, onComplete }: ImportStepResultsProps) {
    const { imported, updated, skipped, errors } = results;

    const hasErrors = errors.length > 0;
    const totalProcessed = imported + updated + skipped;
    const successCount = imported + updated;

    // Download errors as CSV
    const downloadErrorsCsv = useCallback(() => {
        if (errors.length === 0) return;

        const headers = ['Linha', 'Nome', 'Motivo do Erro'];
        const rows = errors.map(e => [
            String(e.index + 1),
            e.name,
            e.reason,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `erros_importacao_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [errors]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            {/* Success Header */}
            <div className={`p-8 rounded-none flex flex-col items-center text-center ${
                hasErrors
                    ? 'bg-warning-500/10 border border-warning-500/20'
                    : 'bg-success-500/10 border border-success-500/20'
            }`}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                        hasErrors ? 'bg-warning-500/20' : 'bg-success-500/20'
                    }`}
                >
                    {hasErrors ? (
                        <AlertCircle className="h-8 w-8 text-warning-500" />
                    ) : (
                        <CheckCircle2 className="h-8 w-8 text-success-500" />
                    )}
                </motion.div>
                <h3 className="text-xl font-bold text-fg-primary mb-2">
                    {hasErrors ? 'Importação Concluída com Avisos' : 'Importação Concluída!'}
                </h3>
                <p className="text-sm text-fg-secondary">
                    {successCount} de {totalProcessed} registros foram processados com sucesso.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-success-500/5 border border-success-500/20 rounded-none text-center">
                    <Users className="h-5 w-5 mx-auto text-success-500 mb-2" />
                    <p className="text-2xl font-bold text-success-600">{imported}</p>
                    <p className="text-[10px] uppercase tracking-wider text-success-600 font-semibold">
                        Importados
                    </p>
                </div>
                <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-none text-center">
                    <RefreshCw className="h-5 w-5 mx-auto text-primary-500 mb-2" />
                    <p className="text-2xl font-bold text-primary-600">{updated}</p>
                    <p className="text-[10px] uppercase tracking-wider text-primary-600 font-semibold">
                        Atualizados
                    </p>
                </div>
                <div className="p-4 bg-bg-tertiary/50 border border-border-subtle rounded-none text-center">
                    <XCircle className="h-5 w-5 mx-auto text-fg-tertiary mb-2" />
                    <p className="text-2xl font-bold text-fg-secondary">{skipped}</p>
                    <p className="text-[10px] uppercase tracking-wider text-fg-tertiary font-semibold">
                        Ignorados
                    </p>
                </div>
                <div className="p-4 bg-danger-500/5 border border-danger-500/20 rounded-none text-center">
                    <AlertCircle className="h-5 w-5 mx-auto text-danger-500 mb-2" />
                    <p className="text-2xl font-bold text-danger-600">{errors.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-danger-600 font-semibold">
                        Erros
                    </p>
                </div>
            </div>

            {/* Errors List */}
            {hasErrors && (
                <div className="border border-danger-500/20 rounded-none overflow-hidden">
                    <div className="px-4 py-3 bg-danger-500/10 border-b border-danger-500/20 flex items-center justify-between">
                        <span className="text-sm font-semibold text-danger-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Registros com erro ({errors.length})
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={downloadErrorsCsv}
                            className="text-danger-600 hover:bg-danger-500/10"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar CSV
                        </Button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-bg-tertiary/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                        Linha
                                    </th>
                                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                        Nome
                                    </th>
                                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-fg-tertiary">
                                        Motivo
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {errors.map((error, idx) => (
                                    <tr key={idx} className="bg-danger-500/5">
                                        <td className="px-4 py-2 text-fg-tertiary">
                                            {error.index + 1}
                                        </td>
                                        <td className="px-4 py-2 font-medium text-fg-primary">
                                            {error.name}
                                        </td>
                                        <td className="px-4 py-2 text-danger-500">
                                            {error.reason}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Complete Button */}
            <div className="flex justify-center pt-4">
                <Button
                    onClick={onComplete}
                    className="bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-black uppercase tracking-widest text-sm px-8 py-3 shadow-[4px_4px_0px_0px_rgba(155,17,30,0.1)] transition-all active:translate-y-0.5 active:shadow-none"
                >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Concluir
                </Button>
            </div>
        </motion.div>
    );
}
