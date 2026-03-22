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
            <div className={`p-8 flex flex-col items-center text-center border-2 ${
                hasErrors
                    ? 'bg-zinc-100 border-zinc-900'
                    : 'bg-primary/5 border-primary'
            }`}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className={`h-16 w-16 flex items-center justify-center mb-4 border-2 ${
                        hasErrors ? 'bg-white border-zinc-900' : 'bg-primary border-primary'
                    }`}
                >
                    {hasErrors ? (
                        <AlertCircle className="h-8 w-8 text-zinc-900" />
                    ) : (
                        <CheckCircle2 className="h-8 w-8 text-white" />
                    )}
                </motion.div>
                <h3 className="text-xl font-black text-zinc-900 mb-2 uppercase tracking-wide">
                    {hasErrors ? 'Importação Concluída com Avisos' : 'Importação Concluída!'}
                </h3>
                <p className="text-sm text-zinc-900 font-semibold">
                    {successCount} de {totalProcessed} registros foram processados com sucesso.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-primary/5 border-2 border-primary text-center">
                    <Users className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-black text-primary">{imported}</p>
                    <p className="text-[10px] uppercase tracking-wider text-primary font-black">
                        Importados
                    </p>
                </div>
                <div className="p-4 bg-white border-2 border-zinc-900 text-center">
                    <RefreshCw className="h-5 w-5 mx-auto text-zinc-900 mb-2" />
                    <p className="text-2xl font-black text-zinc-900">{updated}</p>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-900 font-black">
                        Atualizados
                    </p>
                </div>
                <div className="p-4 bg-zinc-100 border-2 border-zinc-900 text-center">
                    <XCircle className="h-5 w-5 mx-auto text-zinc-900 mb-2" />
                    <p className="text-2xl font-black text-zinc-900">{skipped}</p>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-900 font-black">
                        Ignorados
                    </p>
                </div>
                <div className="p-4 bg-primary/5 border-2 border-primary text-center">
                    <AlertCircle className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-black text-primary">{errors.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-primary font-black">
                        Erros
                    </p>
                </div>
            </div>

            {/* Errors List */}
            {hasErrors && (
                <div className="border-2 border-primary overflow-hidden">
                    <div className="px-4 py-3 bg-primary/5 border-b-2 border-primary flex items-center justify-between">
                        <span className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-wide">
                            <AlertCircle className="h-4 w-4" />
                            Registros com erro ({errors.length})
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={downloadErrorsCsv}
                            className="text-primary hover:bg-primary/10 font-bold uppercase tracking-wider"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar CSV
                        </Button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                        Linha
                                    </th>
                                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                        Nome
                                    </th>
                                    <th className="px-4 py-2 text-left text-[10px] uppercase tracking-wider font-black text-white">
                                        Motivo
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-primary">
                                {errors.map((error, idx) => (
                                    <tr key={idx} className="bg-primary/5">
                                        <td className="px-4 py-2 text-zinc-600 font-semibold">
                                            {error.index + 1}
                                        </td>
                                        <td className="px-4 py-2 font-bold text-zinc-900">
                                            {error.name}
                                        </td>
                                        <td className="px-4 py-2 text-primary font-semibold">
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
