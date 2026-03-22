"use client";

import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { DB_FIELDS } from "@/lib/schemas/member-import";
import type { StepProps, ColumnMapping } from "./types";

interface ImportStepMappingProps extends StepProps {
    onMappingChange: (mapping: ColumnMapping) => void;
}

export function ImportStepMapping({ state, onMappingChange }: ImportStepMappingProps) {
    const { spreadsheetData, mapping } = state;
    const headers = spreadsheetData?.headers || [];
    const rows = spreadsheetData?.rows || [];

    // Get preview values for each column (first 3 non-empty values)
    const columnPreviews = useMemo(() => {
        const previews: Record<string, string[]> = {};

        headers.forEach(header => {
            const values: string[] = [];
            for (const row of rows) {
                const value = row[header];
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    values.push(String(value).slice(0, 30)); // Truncate long values
                    if (values.length >= 3) break;
                }
            }
            previews[header] = values;
        });

        return previews;
    }, [headers, rows]);

    // Check if any identifier field is mapped
    const hasIdentifierMapped = useMemo(() => {
        return mapping.cpf || mapping.voterTitle || mapping.email;
    }, [mapping]);

    // Check if name is mapped
    const hasNameMapped = useMemo(() => {
        return !!mapping.fullName;
    }, [mapping]);

    const handleMappingChange = (fieldKey: string, sheetColumn: string) => {
        const newMapping = { ...mapping };
        if (sheetColumn === '') {
            delete newMapping[fieldKey];
        } else {
            newMapping[fieldKey] = sheetColumn;
        }
        onMappingChange(newMapping);
    };

    // Get preview for a mapped field
    const getMappedPreview = (fieldKey: string): string[] => {
        const sheetColumn = mapping[fieldKey];
        if (!sheetColumn) return [];
        return columnPreviews[sheetColumn] || [];
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {/* Info Card */}
            <div className="bg-white border-2 border-zinc-900 p-4 flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 bg-primary flex items-center justify-center border-2 border-zinc-900">
                    <div className="h-2 w-2 bg-white animate-pulse" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-zinc-900 font-black uppercase tracking-wide">Relacionar campos</p>
                    <p className="text-xs text-zinc-600 mt-1 font-medium">
                        Combine as colunas da sua planilha com os campos oficiais do sistema para garantir uma importação correta.
                    </p>
                </div>
            </div>

            {/* Warnings */}
            {!hasNameMapped && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 p-3 bg-primary/5 border-2 border-primary"
                >
                    <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-primary font-semibold">
                        O campo <strong className="font-black">NOME</strong> é obrigatório. Mapeie uma coluna para continuar.
                    </p>
                </motion.div>
            )}

            {hasNameMapped && !hasIdentifierMapped && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 p-3 bg-zinc-100 border-2 border-zinc-900"
                >
                    <AlertTriangle className="h-4 w-4 text-zinc-900 shrink-0" />
                    <p className="text-xs text-zinc-900 font-semibold">
                        Nenhum identificador mapeado (CPF, Título de Eleitor ou Email). A detecção de duplicatas será limitada.
                    </p>
                </motion.div>
            )}

            {/* Mapping Grid */}
            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {DB_FIELDS.map(field => {
                    const isMapped = !!mapping[field.key];
                    const preview = getMappedPreview(field.key);

                    return (
                        <div
                            key={field.key}
                            className={`flex items-center justify-between p-3 border-2 transition-all ${
                                isMapped
                                    ? 'border-primary bg-primary/5'
                                    : 'border-zinc-900 hover:border-primary hover:bg-primary/5'
                            }`}
                        >
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-black text-zinc-900 flex items-center gap-1.5 uppercase tracking-wide">
                                    {isMapped && (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                    )}
                                    {field.label}
                                    {field.required && <span className="text-primary">*</span>}
                                </span>
                                {/* Preview values when mapped */}
                                {isMapped && preview.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-zinc-600 font-medium">
                                        <ChevronRight className="h-3 w-3 text-primary" />
                                        <span className="truncate">
                                            {preview.slice(0, 3).join(' · ')}
                                            {preview.length > 3 && ' ...'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <select
                                value={mapping[field.key] || ""}
                                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                className={`text-sm border-2 px-3 py-1.5 bg-white min-w-[220px] focus:outline-none focus:border-primary transition-all cursor-pointer font-semibold ${
                                    isMapped ? 'border-primary' : 'border-zinc-900'
                                }`}
                            >
                                <option value="">Não importar</option>
                                {headers.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-zinc-900 text-sm">
                <span className="text-zinc-900 font-bold">
                    {rows.length.toLocaleString()} linhas encontradas
                </span>
                <span className="text-zinc-900 font-bold">
                    {Object.keys(mapping).length} de {DB_FIELDS.length} campos mapeados
                </span>
            </div>
        </motion.div>
    );
}
