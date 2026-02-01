import { z } from 'zod';
import { validateCPF } from '@/lib/validators/cpf';

/**
 * Helper to coerce values to string (handles numbers from Excel)
 */
const coerceToString = (val: unknown): string | null | undefined => {
    if (val === null || val === undefined || val === '') return null;
    return String(val);
};

/**
 * String field that accepts numbers (common in Excel imports)
 */
const flexibleString = () => z.preprocess(coerceToString, z.string().nullable().optional());

/**
 * Schema for validating imported member rows
 * Handles various input formats and normalizes data
 * Uses preprocess to coerce numbers to strings (Excel often returns numbers)
 */
export const memberImportRowSchema = z.object({
    fullName: z.preprocess(
        coerceToString,
        z.string()
            .min(2, 'Nome deve ter pelo menos 2 caracteres')
            .max(255, 'Nome muito longo')
    ),

    cpf: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.replace(/\D/g, '') || null)
            .refine(v => !v || v.length === 0 || validateCPF(v), 'CPF inválido')
    ),

    voterTitle: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    email: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim().toLowerCase() || null)
            .refine(
                v => !v || v.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                'Email inválido'
            )
    ),

    phone: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.replace(/\D/g, '') || null)
    ),

    state: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.toUpperCase().trim() || null)
            .refine(
                v => !v || v.length === 2,
                'UF deve ter 2 caracteres'
            )
    ),

    city: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    neighborhood: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    zone: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    dateOfBirth: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    gender: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    affiliationDate: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    party: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    situation: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    disaffiliationReason: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),

    communicationPending: z.preprocess(
        coerceToString,
        z.string()
            .optional()
            .nullable()
            .transform(v => v?.trim() || null)
    ),
});

export type MemberImportRow = z.infer<typeof memberImportRowSchema>;

/**
 * Validates a single row and returns detailed error information
 */
export function validateImportRow(
    data: Record<string, unknown>,
    rowIndex: number
): {
    success: boolean;
    data?: MemberImportRow;
    errors?: { field: string; message: string }[];
} {
    const result = memberImportRowSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));

    return { success: false, errors };
}

/**
 * Validates all rows and returns validation results
 */
export function validateAllRows(
    rows: Record<string, unknown>[]
): {
    validRows: { index: number; data: MemberImportRow }[];
    invalidRows: { index: number; errors: { field: string; message: string }[] }[];
} {
    const validRows: { index: number; data: MemberImportRow }[] = [];
    const invalidRows: { index: number; errors: { field: string; message: string }[] }[] = [];

    rows.forEach((row, index) => {
        const result = validateImportRow(row, index);
        if (result.success && result.data) {
            validRows.push({ index, data: result.data });
        } else if (result.errors) {
            invalidRows.push({ index, errors: result.errors });
        }
    });

    return { validRows, invalidRows };
}

/**
 * Import limits
 */
export const IMPORT_LIMITS = {
    MAX_FILE_SIZE_MB: 10,
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    MAX_ROWS: 5000,
} as const;

/**
 * DB field definitions for mapping
 */
export const DB_FIELDS = [
    { key: 'fullName', label: 'NOME', required: true },
    { key: 'cpf', label: 'CPF', required: false },
    { key: 'voterTitle', label: 'TITULO ELEITOR', required: false },
    { key: 'email', label: 'EMAIL', required: false },
    { key: 'phone', label: 'TELEFONE', required: false },
    { key: 'gender', label: 'GENERO', required: false },
    { key: 'dateOfBirth', label: 'DATA NASCIMENTO', required: false },
    { key: 'affiliationDate', label: 'DATA FILIACAO', required: false },
    { key: 'state', label: 'UF', required: false },
    { key: 'city', label: 'MUNICIPIO', required: false },
    { key: 'neighborhood', label: 'BAIRRO', required: false },
    { key: 'zone', label: 'ZONA', required: false },
    { key: 'party', label: 'PARTIDO', required: false },
    { key: 'situation', label: 'SITUACAO', required: false },
    { key: 'disaffiliationReason', label: 'MOTIVO DESFILIACAO', required: false },
    { key: 'communicationPending', label: 'PENDENCIA DE COMUNICACAO', required: false },
] as const;

export type DBFieldKey = typeof DB_FIELDS[number]['key'];
