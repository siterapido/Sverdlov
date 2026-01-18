"use client";

import React, { useState, useRef } from "react";
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { importMembers } from "@/app/actions/members";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalBody,
    ModalFooter
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
            // Reset state for next time
            setStep(1);
            setFile(null);
        } else {
            alert(result.error);
        }
    };

    return (
        <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <ModalContent size="lg">
                <ModalHeader>
                    <ModalTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-success-500/10 flex items-center justify-center">
                            <FileSpreadsheet className="h-5 w-5 text-success-500" />
                        </div>
                        Importar Filiados
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border-subtle rounded-2xl p-12 flex flex-col items-center gap-4 hover:bg-bg-hover hover:border-primary-500/50 cursor-pointer transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="bg-bg-hover p-5 rounded-2xl group-hover:bg-primary-500/10 group-hover:scale-110 transition-all shadow-sm">
                                    <Upload className="h-8 w-8 text-fg-secondary group-hover:text-primary-500" />
                                </div>
                                <div className="text-center relative z-10">
                                    <p className="font-semibold text-fg-primary text-lg">Clique ou arraste sua planilha aqui</p>
                                    <p className="text-sm text-fg-tertiary mt-2">Suporta .xlsx, .csv ou .ods</p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".xlsx,.xls,.csv"
                                />

                                <div className="mt-4 flex gap-2">
                                    <Badge variant="gray">Excel</Badge>
                                    <Badge variant="gray">CSV</Badge>
                                    <Badge variant="gray">Google Sheets</Badge>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-bg-tertiary/50 border border-border-subtle p-4 rounded-xl flex items-start gap-3">
                                    <div className="h-5 w-5 mt-0.5 rounded-full bg-primary-500 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-fg-primary font-semibold">Relacionar campos</p>
                                        <p className="text-xs text-fg-tertiary mt-1">Combine as colunas da sua planilha com os campos oficiais do sistema para garantir uma importação correta.</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {dbFields.map(field => (
                                        <div key={field.key} className="flex items-center justify-between p-3 rounded-xl border border-border-subtle hover:border-primary-500/30 hover:bg-bg-hover/50 transition-all group">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-fg-primary flex items-center gap-1.5">
                                                    {field.label}
                                                    {field.required && <span className="text-danger-500">*</span>}
                                                </span>
                                            </div>
                                            <select
                                                value={mapping[field.key] || ""}
                                                onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                                className="text-sm border border-border-subtle rounded-lg px-3 py-1.5 bg-bg-primary min-w-[220px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer group-hover:border-primary-500/50"
                                            >
                                                <option value="">Não importar</option>
                                                {headers.map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ModalBody>
                <ModalFooter className="justify-between">
                    <div>
                        {step === 2 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Voltar
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            Cancelar
                        </Button>
                        {step === 2 && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleImport}
                                disabled={isImporting}
                                className="shadow-none"
                            >
                                {isImporting ? "Importando..." : (
                                    <>
                                        Finalizar Importação
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

