"use client";

import React, { useCallback } from "react";
import {
    FileSpreadsheet,
    ChevronRight,
    ChevronLeft,
    Check,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalBody,
    ModalFooter
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

import { useImportState } from "./import/useImportState";
import { ImportStepUpload } from "./import/ImportStepUpload";
import { ImportStepMapping } from "./import/ImportStepMapping";
import { ImportStepPreview } from "./import/ImportStepPreview";
import { ImportStepResults } from "./import/ImportStepResults";
import { validateImportData, executeImport } from "@/app/actions/members-import";
import type { SpreadsheetData, ColumnMapping, ImportStep } from "./import/types";
import { STEP_LABELS, IMPORT_STEPS } from "./import/types";

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
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
            const result = await validateImportData(
                state.spreadsheetData.rows,
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
        onSuccess();
        onClose();
    }, [reset, onSuccess, onClose]);

    // Handle close
    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

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
        <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
                    {/* Steps Progress */}
                    <div className="flex items-center justify-between mb-6 px-4">
                        {IMPORT_STEPS.map((step, index) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                            index < currentStepIndex
                                                ? 'bg-success-500 text-white'
                                                : index === currentStepIndex
                                                  ? 'bg-primary-500 text-white'
                                                  : 'bg-bg-tertiary text-fg-tertiary'
                                        }`}
                                    >
                                        {index < currentStepIndex ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <span className={`mt-1 text-[10px] uppercase tracking-wider font-semibold ${
                                        index <= currentStepIndex ? 'text-fg-primary' : 'text-fg-tertiary'
                                    }`}>
                                        {STEP_LABELS[step]}
                                    </span>
                                </div>
                                {index < IMPORT_STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 ${
                                            index < currentStepIndex
                                                ? 'bg-success-500'
                                                : 'bg-bg-tertiary'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Error Display */}
                    {state.error && (
                        <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded-none text-sm text-danger-600">
                            {state.error}
                        </div>
                    )}

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        {state.step === 'upload' && (
                            <ImportStepUpload
                                key="upload"
                                state={state}
                                dispatch={dispatch}
                                onClose={handleClose}
                                onFileProcessed={handleFileProcessed}
                            />
                        )}
                        {state.step === 'mapping' && (
                            <ImportStepMapping
                                key="mapping"
                                state={state}
                                dispatch={dispatch}
                                onClose={handleClose}
                                onMappingChange={handleMappingChange}
                            />
                        )}
                        {state.step === 'preview' && (
                            <ImportStepPreview
                                key="preview"
                                state={state}
                                dispatch={dispatch}
                                onClose={handleClose}
                                stats={previewStats}
                                onUpdateDuplicatesChange={setUpdateDuplicates}
                            />
                        )}
                        {state.step === 'results' && state.results && (
                            <ImportStepResults
                                key="results"
                                state={state}
                                dispatch={dispatch}
                                onClose={handleClose}
                                results={state.results}
                                onComplete={handleComplete}
                            />
                        )}
                    </AnimatePresence>
                </ModalBody>

                {state.step !== 'results' && (
                    <ModalFooter className="justify-between">
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
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={handleClose}>
                                Cancelar
                            </Button>
                            {state.step !== 'upload' && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleNextClick}
                                    disabled={!canGoNext || state.isProcessing}
                                    className="shadow-none"
                                >
                                    {getNextButtonText()}
                                    {!state.isProcessing && <ChevronRight className="ml-2 h-4 w-4" />}
                                </Button>
                            )}
                        </div>
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    );
}
