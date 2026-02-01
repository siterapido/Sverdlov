"use client";

import { useReducer, useCallback } from 'react';
import type {
    ImportState,
    ImportAction,
    ImportStep,
    ColumnMapping,
    ValidatedRow,
    SpreadsheetData,
    PreviewStats,
    IMPORT_STEPS,
} from './types';

const initialState: ImportState = {
    step: 'upload',
    file: null,
    spreadsheetData: null,
    mapping: {},
    validatedRows: [],
    updateDuplicates: false,
    isProcessing: false,
    results: null,
    error: null,
};

const STEP_ORDER: ImportStep[] = ['upload', 'mapping', 'preview', 'results'];

function importReducer(state: ImportState, action: ImportAction): ImportState {
    switch (action.type) {
        case 'SET_FILE':
            return {
                ...state,
                file: action.payload.file,
                spreadsheetData: action.payload.data,
                error: null,
            };

        case 'SET_MAPPING':
            return {
                ...state,
                mapping: action.payload,
                error: null,
            };

        case 'SET_VALIDATED_ROWS':
            return {
                ...state,
                validatedRows: action.payload,
                error: null,
            };

        case 'SET_UPDATE_DUPLICATES':
            return {
                ...state,
                updateDuplicates: action.payload,
            };

        case 'SET_RESULTS':
            return {
                ...state,
                results: action.payload,
                isProcessing: false,
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isProcessing: false,
            };

        case 'SET_PROCESSING':
            return {
                ...state,
                isProcessing: action.payload,
                error: action.payload ? null : state.error,
            };

        case 'NEXT_STEP': {
            const currentIndex = STEP_ORDER.indexOf(state.step);
            const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1);
            return {
                ...state,
                step: STEP_ORDER[nextIndex],
                error: null,
            };
        }

        case 'PREV_STEP': {
            const currentIndex = STEP_ORDER.indexOf(state.step);
            const prevIndex = Math.max(currentIndex - 1, 0);
            return {
                ...state,
                step: STEP_ORDER[prevIndex],
                error: null,
            };
        }

        case 'GO_TO_STEP':
            return {
                ...state,
                step: action.payload,
                error: null,
            };

        case 'RESET':
            return initialState;

        default:
            return state;
    }
}

export function useImportState() {
    const [state, dispatch] = useReducer(importReducer, initialState);

    // Computed values
    const currentStepIndex = STEP_ORDER.indexOf(state.step);

    const canGoBack = currentStepIndex > 0 && state.step !== 'results';

    const canGoNext = (() => {
        switch (state.step) {
            case 'upload':
                return state.file !== null && state.spreadsheetData !== null;
            case 'mapping':
                return state.mapping.fullName !== undefined && state.mapping.fullName !== '';
            case 'preview':
                return state.validatedRows.some(r => r.status === 'valid' || (r.status === 'duplicate' && state.updateDuplicates));
            case 'results':
                return false;
            default:
                return false;
        }
    })();

    // Preview statistics
    const previewStats: PreviewStats = {
        total: state.validatedRows.length,
        valid: state.validatedRows.filter(r => r.status === 'valid').length,
        invalid: state.validatedRows.filter(r => r.status === 'invalid').length,
        duplicates: state.validatedRows.filter(r => r.status === 'duplicate').length,
    };

    // Helper actions
    const setFile = useCallback((file: File, data: SpreadsheetData) => {
        dispatch({ type: 'SET_FILE', payload: { file, data } });
    }, []);

    const setMapping = useCallback((mapping: ColumnMapping) => {
        dispatch({ type: 'SET_MAPPING', payload: mapping });
    }, []);

    const setValidatedRows = useCallback((rows: ValidatedRow[]) => {
        dispatch({ type: 'SET_VALIDATED_ROWS', payload: rows });
    }, []);

    const setUpdateDuplicates = useCallback((value: boolean) => {
        dispatch({ type: 'SET_UPDATE_DUPLICATES', payload: value });
    }, []);

    const setResults = useCallback((results: ImportState['results']) => {
        if (results) {
            dispatch({ type: 'SET_RESULTS', payload: results });
        }
    }, []);

    const setError = useCallback((error: string) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    }, []);

    const setProcessing = useCallback((isProcessing: boolean) => {
        dispatch({ type: 'SET_PROCESSING', payload: isProcessing });
    }, []);

    const nextStep = useCallback(() => {
        dispatch({ type: 'NEXT_STEP' });
    }, []);

    const prevStep = useCallback(() => {
        dispatch({ type: 'PREV_STEP' });
    }, []);

    const goToStep = useCallback((step: ImportStep) => {
        dispatch({ type: 'GO_TO_STEP', payload: step });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    return {
        state,
        dispatch,
        // Computed
        currentStepIndex,
        canGoBack,
        canGoNext,
        previewStats,
        // Actions
        setFile,
        setMapping,
        setValidatedRows,
        setUpdateDuplicates,
        setResults,
        setError,
        setProcessing,
        nextStep,
        prevStep,
        goToStep,
        reset,
    };
}
