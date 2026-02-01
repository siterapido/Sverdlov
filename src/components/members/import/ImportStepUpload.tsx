"use client";

import React, { useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, Download, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IMPORT_LIMITS, DB_FIELDS } from "@/lib/schemas/member-import";
import type { StepProps, SpreadsheetData, ColumnMapping } from "./types";

interface ImportStepUploadProps extends StepProps {
    onFileProcessed: (file: File, data: SpreadsheetData, autoMapping: ColumnMapping) => void;
}

export function ImportStepUpload({ state, onFileProcessed }: ImportStepUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const processFile = useCallback((file: File) => {
        setError(null);

        // Validate file size
        if (file.size > IMPORT_LIMITS.MAX_FILE_SIZE_BYTES) {
            setError(`Arquivo muito grande. Tamanho máximo: ${IMPORT_LIMITS.MAX_FILE_SIZE_MB}MB`);
            return;
        }

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv', // .csv
        ];
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const hasValidExtension = validExtensions.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (!validTypes.includes(file.type) && !hasValidExtension) {
            setError('Tipo de arquivo inválido. Use .xlsx, .xls ou .csv');
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const arrayBuffer = event.target?.result;
                if (!arrayBuffer) {
                    setError('Erro ao ler arquivo');
                    return;
                }

                // Use readAsArrayBuffer instead of readAsBinaryString
                const wb = XLSX.read(arrayBuffer, { type: "array" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // Get headers
                const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
                const headers = (rawData[0] || []).map(h => String(h || '').trim()).filter(Boolean);

                if (headers.length === 0) {
                    setError('Planilha sem cabeçalhos. A primeira linha deve conter os nomes das colunas.');
                    return;
                }

                // Get rows as objects
                const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

                // Validate row count
                if (rows.length > IMPORT_LIMITS.MAX_ROWS) {
                    setError(`Muitas linhas. Máximo permitido: ${IMPORT_LIMITS.MAX_ROWS} linhas`);
                    return;
                }

                if (rows.length === 0) {
                    setError('Planilha sem dados. Adicione pelo menos uma linha de dados.');
                    return;
                }

                // Auto-mapping based on column name similarity
                const autoMapping: ColumnMapping = {};
                DB_FIELDS.forEach(field => {
                    const match = headers.find(h => {
                        const headerUpper = h.toUpperCase();
                        const labelUpper = field.label.toUpperCase();
                        const keyLower = field.key.toLowerCase();

                        return (
                            headerUpper === labelUpper ||
                            headerUpper.includes(labelUpper) ||
                            headerUpper.includes(keyLower.toUpperCase()) ||
                            h.toLowerCase().includes(keyLower)
                        );
                    });
                    if (match) {
                        autoMapping[field.key] = match;
                    }
                });

                const spreadsheetData: SpreadsheetData = { headers, rows };
                onFileProcessed(file, spreadsheetData, autoMapping);
            } catch (err) {
                console.error('Error parsing file:', err);
                setError('Erro ao processar arquivo. Verifique se o formato está correto.');
            }
        };

        reader.onerror = () => {
            setError('Erro ao ler arquivo');
        };

        // Use readAsArrayBuffer for better encoding support
        reader.readAsArrayBuffer(file);
    }, [onFileProcessed]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const downloadTemplate = useCallback(() => {
        // Create template with headers
        const ws = XLSX.utils.aoa_to_sheet([
            DB_FIELDS.map(f => f.label),
            // Example row
            ['João da Silva', '123.456.789-00', '1234567890', 'joao@email.com', '11999999999', 'M', '1990-01-15', '2020-03-10', 'SP', 'São Paulo', 'Centro', '001', 'UP', 'Ativo', '', ''],
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Modelo');

        // Set column widths
        ws['!cols'] = DB_FIELDS.map(() => ({ wch: 20 }));

        XLSX.writeFile(wb, 'modelo_importacao_filiados.xlsx');
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            {/* Upload Area */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-none p-12 flex flex-col items-center gap-4 hover:bg-bg-hover hover:border-primary-500/50 cursor-pointer transition-all group relative overflow-hidden ${
                    isDragging
                        ? 'border-primary-500 bg-primary-500/5'
                        : error
                          ? 'border-danger-500/50'
                          : 'border-border-subtle'
                }`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className={`p-5 rounded-none transition-all shadow-sm ${
                    isDragging
                        ? 'bg-primary-500/10 scale-110'
                        : 'bg-bg-hover group-hover:bg-primary-500/10 group-hover:scale-110'
                }`}>
                    <Upload className={`h-8 w-8 ${
                        isDragging ? 'text-primary-500' : 'text-fg-secondary group-hover:text-primary-500'
                    }`} />
                </div>

                <div className="text-center relative z-10">
                    <p className="font-semibold text-fg-primary text-lg">
                        {isDragging ? 'Solte o arquivo aqui' : 'Clique ou arraste sua planilha aqui'}
                    </p>
                    <p className="text-sm text-fg-tertiary mt-2">
                        Suporta .xlsx, .csv ou .xls (máx. {IMPORT_LIMITS.MAX_FILE_SIZE_MB}MB, {IMPORT_LIMITS.MAX_ROWS.toLocaleString()} linhas)
                    </p>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                />

                <div className="mt-4 flex gap-2">
                    <Badge variant="gray">Excel</Badge>
                    <Badge variant="gray">CSV</Badge>
                    <Badge variant="gray">Google Sheets</Badge>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-danger-500/10 border border-danger-500/20 rounded-none"
                >
                    <AlertCircle className="h-5 w-5 text-danger-500 shrink-0" />
                    <p className="text-sm text-danger-600">{error}</p>
                </motion.div>
            )}

            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-bg-tertiary/50 border border-border-subtle rounded-none">
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-fg-secondary" />
                    <div>
                        <p className="text-sm font-semibold text-fg-primary">Modelo de Planilha</p>
                        <p className="text-xs text-fg-tertiary">Baixe um modelo com as colunas corretas</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        downloadTemplate();
                    }}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    Baixar Modelo
                </Button>
            </div>
        </motion.div>
    );
}
