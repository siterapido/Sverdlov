"use client";

import React, { useCallback, useEffect } from "react";
import {
    FileSpreadsheet,
    ChevronRight,
    ChevronLeft,
    Check,
    ArrowLeft,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PageTransition } from "@/components/ui/page-transition";

import { useImportState } from "@/components/members/import/useImportState";
import { ImportStepUpload } from "@/components/members/import/ImportStepUpload";
import { ImportStepMapping } from "@/components/members/import/ImportStepMapping";
import { ImportStepPreview } from "@/components/members/import/ImportStepPreview";
import { ImportStepResults } from "@/components/members/import/ImportStepResults";
import { validateImportData, executeImport } from "@/app/actions/members-import";
import type { SpreadsheetData, ColumnMapping } from "@/components/members/import/types";
import { STEP_LABELS, IMPORT_STEPS } from "@/components/members/import/types";

export default function ImportacaoPage() {
    // Set page title
    useEffect(() => {
        document.title = "Importar Filiados - Sverdlov";
    }, []);
    const router = useRouter();
    const { addToast } = useToast();
    const {
        state,
        dispatch,
        currentStepIndex,
        canGoBack,
        canGoNext,
        previewStats,
        setFile,
        setMapping,
        setValidatedRows,
        setUpdateDuplicates,
        setResults,
        setError,
        setProcessing,
        nextStep,
        prevStep,
        reset,
    } = useImportState();

    // Handle file upload and processing
    const handleFileProcessed = useCallback((file: File, data: SpreadsheetData, autoMapping: ColumnMapping) => {
        setFile(file, data);
        setMapping(autoMapping);
        nextStep();
    }, [setFile, setMapping, nextStep]);

    // Handle mapping change
    const handleMappingChange = useCallback((mapping: ColumnMapping) => {
        setMapping(mapping);
    }, [setMapping]);

    // Handle proceeding from mapping to preview (runs validation)
    const handleValidateAndPreview = useCallback(async () => {
        if (!state.spreadsheetData) return;

        setProcessing(true);

        try {
            // Serialize rows to ensure all values are plain objects (no Date instances, etc.)
            const serializedRows = state.spreadsheetData.rows.map(row => {
                const serialized: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(row)) {
                    if (value instanceof Date) {
                        // Convert Date to ISO string
                        serialized[key] = value.toISOString();
                    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                        // Convert other objects to JSON string (fallback)
                        serialized[key] = JSON.stringify(value);
                    } else {
                        // Primitive values (string, number, boolean, null) are fine
                        serialized[key] = value;
                    }
                }
                return serialized;
            });

            const result = await validateImportData(
                serializedRows,
                state.mapping
            );

            if (result.success && result.rows) {
                setValidatedRows(result.rows);
                nextStep();
            } else {
                setError(result.error || 'Erro na validação');
                addToast({
                    type: 'error',
                    title: 'Erro na Validação',
                    description: result.error,
                });
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(msg);
            addToast({
                type: 'error',
                title: 'Erro na Validação',
                description: msg,
            });
        } finally {
            setProcessing(false);
        }
    }, [state.spreadsheetData, state.mapping, setProcessing, setValidatedRows, setError, nextStep, addToast]);

    // Handle executing import
    const handleExecuteImport = useCallback(async () => {
        setProcessing(true);

        try {
            const result = await executeImport(
                state.validatedRows,
                { updateDuplicates: state.updateDuplicates }
            );

            if (result.success && result.results) {
                setResults(result.results);
                nextStep();
                addToast({
                    type: 'success',
                    title: 'Importação Concluída',
                    description: `${result.results.imported} importados, ${result.results.updated} atualizados`,
                });
            } else {
                setError(result.error || 'Erro na importação');
                addToast({
                    type: 'error',
                    title: 'Erro na Importação',
                    description: result.error,
                });
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(msg);
            addToast({
                type: 'error',
                title: 'Erro na Importação',
                description: msg,
            });
        } finally {
            setProcessing(false);
        }
    }, [state.validatedRows, state.updateDuplicates, setProcessing, setResults, setError, nextStep, addToast]);

    // Handle completion
    const handleComplete = useCallback(() => {
        reset();
        router.push('/members');
        router.refresh();
    }, [reset, router]);

    // Handle close/cancel
    const handleCancel = useCallback(() => {
        if (state.step === 'results') {
            handleComplete();
        } else if (state.step === 'upload' && !state.file) {
            // If we're on upload and no file is selected, just go back without confirmation
            router.push('/members');
        } else {
            const confirm = window.confirm('Tem certeza que deseja cancelar a importação? Todo o progresso será perdido.');
            if (confirm) {
                reset();
                router.push('/members');
            }
        }
    }, [state.step, state.file, reset, router, handleComplete]);

    // Handle next button click
    const handleNextClick = useCallback(() => {
        switch (state.step) {
            case 'mapping':
                handleValidateAndPreview();
                break;
            case 'preview':
                handleExecuteImport();
                break;
            default:
                nextStep();
        }
    }, [state.step, handleValidateAndPreview, handleExecuteImport, nextStep]);

    // Get next button text
    const getNextButtonText = () => {
        if (state.isProcessing) {
            switch (state.step) {
                case 'mapping':
                    return 'Validando...';
                case 'preview':
                    return 'Importando...';
                default:
                    return 'Processando...';
            }
        }

        switch (state.step) {
            case 'mapping':
                return 'Validar Dados';
            case 'preview':
                return 'Importar';
            default:
                return 'Próximo';
        }
    };

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-12 border-b border-zinc-100 pb-8">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            onClick={handleCancel}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 bg-primary/10 flex items-center justify-center">
                                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                    Importação em Lote
                                </span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                                IMPORTAR FILIADOS
                            </h1>
                            <p className="text-zinc-500 font-medium text-sm">
                                Importe múltiplos filiados através de uma planilha Excel ou CSV
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] mb-12">
                    {/* Steps Progress */}
                    <div className="px-6 sm:px-8 py-6 border-b-2 border-zinc-200">
                        <div className="flex items-center justify-between">
                            {IMPORT_STEPS.map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center text-xs sm:text-sm font-black transition-all border-2 ${
                                                index < currentStepIndex
                                                    ? 'bg-primary border-primary text-white scale-100'
                                                    : index === currentStepIndex
                                                      ? 'bg-primary border-primary text-white scale-110'
                                                      : 'bg-white border-zinc-900 text-zinc-900'
                                            }`}
                                        >
                                            {index < currentStepIndex ? (
                                                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <span className={`mt-2 text-[10px] sm:text-xs uppercase tracking-wider font-black text-center ${
                                            index <= currentStepIndex ? 'text-zinc-900' : 'text-zinc-500'
                                        }`}>
                                            {STEP_LABELS[step]}
                                        </span>
                                    </div>
                                    {index < IMPORT_STEPS.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-2 sm:mx-4 transition-all ${
                                                index < currentStepIndex
                                                    ? 'bg-primary'
                                                    : 'bg-zinc-300'
                                            }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Error Display */}
                    {state.error && (
                        <div className="mx-8 mt-6 p-4 bg-primary/5 border-2 border-primary text-sm text-primary font-semibold">
                            {state.error}
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="px-8 py-8">
                        <AnimatePresence mode="wait">
                            {state.step === 'upload' && (
                                <ImportStepUpload
                                    key="upload"
                                    state={state}
                                    dispatch={dispatch}
                                    onClose={handleCancel}
                                    onFileProcessed={handleFileProcessed}
                                />
                            )}
                            {state.step === 'mapping' && (
                                <ImportStepMapping
                                    key="mapping"
                                    state={state}
                                    dispatch={dispatch}
                                    onClose={handleCancel}
                                    onMappingChange={handleMappingChange}
                                />
                            )}
                            {state.step === 'preview' && (
                                <ImportStepPreview
                                    key="preview"
                                    state={state}
                                    dispatch={dispatch}
                                    onClose={handleCancel}
                                    stats={previewStats}
                                    onUpdateDuplicatesChange={setUpdateDuplicates}
                                />
                            )}
                            {state.step === 'results' && state.results && (
                                <ImportStepResults
                                    key="results"
                                    state={state}
                                    dispatch={dispatch}
                                    onClose={handleCancel}
                                    results={state.results}
                                    onComplete={handleComplete}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    {state.step !== 'results' && (
                        <div className="px-6 sm:px-8 py-6 border-t-2 border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                {canGoBack && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={prevStep}
                                        disabled={state.isProcessing}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Voltar
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={state.isProcessing}
                                    className="flex-1 sm:flex-none border-2 border-zinc-900 rounded-none font-bold uppercase tracking-wider text-xs"
                                >
                                    Cancelar
                                </Button>
                                {state.step !== 'upload' && (
                                    <Button
                                        onClick={handleNextClick}
                                        disabled={!canGoNext || state.isProcessing}
                                        className="flex-1 sm:flex-none bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-bold uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(155,17,30,0.1)] transition-all active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {getNextButtonText()}
                                        {!state.isProcessing && <ChevronRight className="ml-2 h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Help Section */}
                {state.step === 'upload' && (
                    <div className="mt-8 p-6 bg-white border-2 border-zinc-900">
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-3">
                            Precisa de ajuda?
                        </h3>
                        <ul className="text-sm text-zinc-900 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-black text-base">•</span>
                                <span className="font-medium">Baixe o modelo de planilha para garantir que seus dados estejam no formato correto</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-black text-base">•</span>
                                <span className="font-medium">Verifique se todos os campos obrigatórios estão preenchidos (Nome completo)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-black text-base">•</span>
                                <span className="font-medium">CPF, Título de Eleitor ou Email são usados para detectar duplicatas</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
