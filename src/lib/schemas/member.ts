import { z } from 'zod';

export const memberSchema = z.object({
    fullName: z.string().min(3, 'Nome muito curto').max(255),
    socialName: z.string().max(255).optional().nullable(),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (AAAA-MM-DD)'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Telefone inválido'),

    // Territorial
    state: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
    city: z.string().min(2, 'Cidade inválida'),
    neighborhood: z.string().min(2, 'Bairro inválido'),
    zone: z.string().optional().nullable(),

    // Political
    voterTitle: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),

    // Form specific / Mapped
    interest: z.enum(['militancy', 'support', 'education']).optional(),
    howDidYouHear: z.string().optional(),

    // Import specific fields
    party: z.string().optional().nullable(),
    situation: z.string().optional().nullable(),
    disaffiliationReason: z.string().optional().nullable(),
    communicationPending: z.string().optional().nullable(),
});

export type MemberSchema = z.infer<typeof memberSchema>;
