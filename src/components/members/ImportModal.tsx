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
        { key: "fullName", label: "NOME", required: true },
        { key: "cpf", label: "CPF", required: false },
        { key: "voterTitle", label: "TITULO ELEITOR", required: false },
        { key: "gender", label: "GENERO", required: false },
        { key: "affiliationDate", label: "DATA FILIACAO", required: false },
        { key: "state", label: "UF", required: false },
        { key: "city", label: "MUNICIPIO", required: false },
        { key: "zone", label: "ZONA", required: false },
        { key: "party", label: "PARTIDO", required: false },
        { key: "situation", label: "SITUACAO", required: false },
        { key: "disaffiliationReason", label: "MOTIVO DESFILIACAO", required: false },
        { key: "communicationPending", label: "PENDENCIA DE COMUNICACAO", required: false },
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
                    h.toUpperCase() === field.label.toUpperCase() ||
                    h.toUpperCase().includes(field.label.toUpperCase()) ||
                    h.toLowerCase().includes(field.key.toLowerCase())
                );
                if (match) newMapping[field.key] = match;
            });
            setMapping(newMapping);
            setStep(2);
        };
        reader.readAsBinaryString(uploadedFile);
    };

    const [importResults, setImportResults] = useState<any>(null);

    const handleImport = async (updateExisting = false) => {
        setIsImporting(true);
        const formattedData = data.map(row => {
            const member: any = {};
            Object.entries(mapping).forEach(([dbKey, sheetKey]) => {
                member[dbKey] = row[sheetKey];
            });
            return member;
        });

        const result = await importMembers(formattedData, updateExisting);
        setIsImporting(false);

        if (result.success && result.results) {
            if (result.results.duplicates.length > 0 && !updateExisting) {
                setImportResults(result.results);
                setStep(3); // Result/Duplicate handling step
            } else {
                onSuccess();
                onClose();
                // Reset state
                setStep(1);
                setFile(null);
                setImportResults(null);
            }
        } else {
            alert(result.error);
        }
    };

    return (
        <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <ModalContent size="lg">
                <ModalHeader>
                    <ModalTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-none bg-success-500/10 flex items-center justify-center">
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
                                className="border-2 border-dashed border-border-subtle rounded-none p-12 flex flex-col items-center gap-4 hover:bg-bg-hover hover:border-primary-500/50 cursor-pointer transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="bg-bg-hover p-5 rounded-none group-hover:bg-primary-500/10 group-hover:scale-110 transition-all shadow-sm">
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
                        ) : step === 2 ? (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-bg-tertiary/50 border border-border-subtle p-4 rounded-none flex items-start gap-3">
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
                                        <div key={field.key} className="flex items-center justify-between p-3 rounded-none border border-border-subtle hover:border-primary-500/30 hover:bg-bg-hover/50 transition-all group">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-fg-primary flex items-center gap-1.5">
                                                    {field.label}
                                                    {field.required && <span className="text-danger-500">*</span>}
                                                </span>
                                            </div>
                                            <select
                                                value={mapping[field.key] || ""}
                                                onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                                className="text-sm border border-border-subtle rounded-none px-3 py-1.5 bg-bg-primary min-w-[220px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer group-hover:border-primary-500/50"
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
                        ) : (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-warning-500/10 border border-warning-500/20 p-6 rounded-none flex flex-col items-center text-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-warning-500/20 flex items-center justify-center">
                                        <AlertCircle className="h-6 w-6 text-warning-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-fg-primary text-lg">Duplicatas Encontradas</h3>
                                        <p className="text-sm text-fg-secondary">
                                            Identificamos {importResults?.duplicates?.length} pessoas que já possuem cadastro no sistema (CPF ou Título de Eleitor já cadastrados).
                                        </p>
                                    </div>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto border border-border-subtle rounded-none divide-y divide-border-subtle">
                                    {importResults?.duplicates?.map((dup: any, i: number) => (
                                        <div key={i} className="p-3 bg-bg-secondary/30 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-fg-primary">{dup.fullName || dup.NOME}</span>
                                                <span className="text-xs text-fg-tertiary">CPF/Título: {dup.cpf || dup.voterTitle || "N/A"}</span>
                                            </div>
                                            <Badge variant="yellow">Já cadastrado</Badge>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-none">
                                    <p className="text-sm text-fg-primary font-medium mb-1">Deseja atualizar os dados destes cadastros?</p>
                                    <p className="text-xs text-fg-tertiary">Se você escolher sim, as informações da planilha substituirão os dados atuais destes filiados.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ModalBody>
                <ModalFooter className="justify-between">
                    <div>
                        {(step === 2 || step === 3) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep(step - 1)}
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
                                onClick={() => handleImport(false)}
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
                        {step === 3 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        onSuccess();
                                        onClose();
                                    }}
                                    disabled={isImporting}
                                >
                                    Ignorar e Concluir
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleImport(true)}
                                    disabled={isImporting}
                                    className="shadow-none"
                                >
                                    {isImporting ? "Atualizando..." : "Sim, Atualizar Dados"}
                                </Button>
                            </>
                        )}
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

