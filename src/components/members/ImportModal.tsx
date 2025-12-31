"use client";

import React, { useState, useRef } from "react";
import {
    X,
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    MappingPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { importMembers } from "@/app/actions/members";

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const dbFields = [
        { key: "fullName", label: "Nome Completo", required: true },
        { key: "cpf", label: "CPF", required: true },
        { key: "voterTitle", label: "Título de Eleitor", required: false },
        { key: "dateOfBirth", label: "Data de Nascimento", required: true },
        { key: "email", label: "E-mail", required: false },
        { key: "phone", label: "Telefone", required: false },
        { key: "state", label: "Estado (UF)", required: true },
        { key: "city", label: "Cidade", required: true },
        { key: "zone", label: "Zona Eleitoral", required: false },
        { key: "neighborhood", label: "Bairro", required: false },
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        const reader = new FileReader();
        reader.onload = (event) => {
            const bstr = event.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const sheetHeaders = rawData[0] as string[];
            setHeaders(sheetHeaders);
            setData(XLSX.utils.sheet_to_json(ws));

            // Auto mapping
            const newMapping: Record<string, string> = {};
            dbFields.forEach(field => {
                const match = sheetHeaders.find(h =>
                    h.toLowerCase().includes(field.label.toLowerCase()) ||
                    h.toLowerCase().includes(field.key.toLowerCase())
                );
                if (match) newMapping[field.key] = match;
            });
            setMapping(newMapping);
            setStep(2);
        };
        reader.readAsBinaryString(uploadedFile);
    };

    const handleImport = async () => {
        setIsImporting(true);
        const formattedData = data.map(row => {
            const member: any = {};
            Object.entries(mapping).forEach(([dbKey, sheetKey]) => {
                member[dbKey] = row[sheetKey];
            });
            return member;
        });

        const result = await importMembers(formattedData);
        setIsImporting(false);

        if (result.success) {
            onSuccess();
            onClose();
        } else {
            alert(result.error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-bg-primary w-full max-w-2xl rounded-lg shadow-xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                    <h2 className="text-lg font-semibold text-fg-primary flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-success" />
                        Importar Filiados
                    </h2>
                    <button onClick={onClose} className="text-fg-secondary hover:bg-bg-hover p-1 rounded transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {step === 1 && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border-subtle rounded-lg p-12 flex flex-col items-center gap-4 hover:bg-bg-hover cursor-pointer transition-all group"
                        >
                            <div className="bg-bg-hover p-4 rounded-full group-hover:bg-bg-primary transition-colors">
                                <Upload className="h-8 w-8 text-fg-secondary" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-fg-primary">Clique ou arraste sua planilha aqui</p>
                                <p className="text-sm text-fg-secondary mt-1">Suporta .xlsx, .csv ou .ods</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-bg-hover p-4 rounded-md">
                                <p className="text-sm text-fg-primary font-medium">Relacionar campos</p>
                                <p className="text-xs text-fg-secondary">Combine as colunas da sua planilha com os campos do sistema.</p>
                            </div>

                            <div className="grid gap-4">
                                {dbFields.map(field => (
                                    <div key={field.key} className="flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-fg-primary flex items-center gap-1.5">
                                                {field.label}
                                                {field.required && <span className="text-danger">*</span>}
                                            </span>
                                        </div>
                                        <select
                                            value={mapping[field.key] || ""}
                                            onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                            className="text-sm border border-border-subtle rounded px-2 py-1.5 bg-bg-primary min-w-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="">Não importar</option>
                                            {headers.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-subtle bg-bg-secondary flex justify-between items-center">
                    <div className="flex gap-2">
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2 text-sm font-medium text-fg-secondary hover:bg-bg-hover rounded transition-colors"
                            >
                                Voltar
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-fg-secondary hover:bg-bg-hover rounded transition-colors"
                        >
                            Cancelar
                        </button>
                        {step === 2 && (
                            <button
                                onClick={handleImport}
                                disabled={isImporting}
                                className="bg-primary text-white px-6 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isImporting ? "Importando..." : "Finalizar Importação"}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
