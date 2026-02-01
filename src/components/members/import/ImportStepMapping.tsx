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
            <div className="bg-bg-tertiary/50 border border-border-subtle p-4 rounded-none flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 rounded-full bg-primary-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-fg-primary font-semibold">Relacionar campos</p>
                    <p className="text-xs text-fg-tertiary mt-1">
                        Combine as colunas da sua planilha com os campos oficiais do sistema para garantir uma importação correta.
                    </p>
                </div>
            </div>

            {/* Warnings */}
            {!hasNameMapped && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 p-3 bg-danger-500/10 border border-danger-500/20 rounded-none"
                >
                    <AlertTriangle className="h-4 w-4 text-danger-500 shrink-0" />
                    <p className="text-xs text-danger-600">
                        O campo <strong>NOME</strong> é obrigatório. Mapeie uma coluna para continuar.
                    </p>
                </motion.div>
            )}

            {hasNameMapped && !hasIdentifierMapped && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 p-3 bg-warning-500/10 border border-warning-500/20 rounded-none"
                >
                    <AlertTriangle className="h-4 w-4 text-warning-500 shrink-0" />
                    <p className="text-xs text-warning-600">
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
                            className={`flex items-center justify-between p-3 rounded-none border transition-all ${
                                isMapped
                                    ? 'border-success-500/30 bg-success-500/5'
                                    : 'border-border-subtle hover:border-primary-500/30 hover:bg-bg-hover/50'
                            }`}
                        >
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-semibold text-fg-primary flex items-center gap-1.5">
                                    {isMapped && (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success-500" />
                                    )}
                                    {field.label}
                                    {field.required && <span className="text-danger-500">*</span>}
                                </span>
                                {/* Preview values when mapped */}
                                {isMapped && preview.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-fg-tertiary">
                                        <ChevronRight className="h-3 w-3" />
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
                                className={`text-sm border rounded-none px-3 py-1.5 bg-bg-primary min-w-[220px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer ${
                                    isMapped ? 'border-success-500/50' : 'border-border-subtle'
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
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-sm">
                <span className="text-fg-tertiary">
                    {rows.length.toLocaleString()} linhas encontradas
                </span>
                <span className="text-fg-secondary">
                    {Object.keys(mapping).length} de {DB_FIELDS.length} campos mapeados
                </span>
            </div>
        </motion.div>
    );
}
