import type { MemberImportRow } from '@/lib/schemas/member-import';

/**
 * Import step enum
 */
export type ImportStep = 'upload' | 'mapping' | 'preview' | 'results';

export const IMPORT_STEPS: ImportStep[] = ['upload', 'mapping', 'preview', 'results'];

export const STEP_LABELS: Record<ImportStep, string> = {
    upload: 'Upload',
    mapping: 'Mapear',
    preview: 'Revisar',
    results: 'Resultados',
};

/**
 * Row validation status
 */
export type RowStatus = 'valid' | 'invalid' | 'duplicate';

/**
 * Validated row with status information
 */
export interface ValidatedRow {
    index: number;
    data: MemberImportRow;
    status: RowStatus;
    errors?: { field: string; message: string }[];
    duplicateInfo?: {
        existingId: string;
        existingName: string;
        matchedField: 'cpf' | 'voterTitle' | 'email';
    };
}

/**
 * Import results from server
 */
export interface ImportResults {
    imported: number;
    updated: number;
    skipped: number;
    errors: {
        index: number;
        name: string;
        reason: string;
    }[];
}

/**
 * File validation result
 */
export interface FileValidation {
    valid: boolean;
    error?: string;
    file?: File;
    rowCount?: number;
}

/**
 * Column mapping: DB field key -> spreadsheet column name
 */
export type ColumnMapping = Record<string, string>;

/**
 * Raw spreadsheet data
 */
export interface SpreadsheetData {
    headers: string[];
    rows: Record<string, unknown>[];
}

/**
 * Import state machine state
 */
export interface ImportState {
    step: ImportStep;
    file: File | null;
    spreadsheetData: SpreadsheetData | null;
    mapping: ColumnMapping;
    validatedRows: ValidatedRow[];
    updateDuplicates: boolean;
    isProcessing: boolean;
    results: ImportResults | null;
    error: string | null;
}

/**
 * Import state actions
 */
export type ImportAction =
    | { type: 'SET_FILE'; payload: { file: File; data: SpreadsheetData } }
    | { type: 'SET_MAPPING'; payload: ColumnMapping }
    | { type: 'SET_VALIDATED_ROWS'; payload: ValidatedRow[] }
    | { type: 'SET_UPDATE_DUPLICATES'; payload: boolean }
    | { type: 'SET_RESULTS'; payload: ImportResults }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'NEXT_STEP' }
    | { type: 'PREV_STEP' }
    | { type: 'GO_TO_STEP'; payload: ImportStep }
    | { type: 'RESET' };

/**
 * Summary stats for the preview step
 */
export interface PreviewStats {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
}

/**
 * Props for step components
 */
export interface StepProps {
    state: ImportState;
    dispatch: React.Dispatch<ImportAction>;
    onClose: () => void;
}
