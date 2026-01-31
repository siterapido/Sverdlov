import { z } from 'zod';

export const nucleusSchema = z.object({
    name: z.string().min(2, 'Nome muito curto').max(255),
    type: z.enum(['territorial', 'thematic']),
    state: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
    city: z.string().min(2, 'Cidade inválida'),
    zone: z.string().optional().nullable(),
    status: z.enum(['dispersed', 'pre_nucleus', 'in_formation', 'active', 'consolidated']),
});

export type NucleusSchema = z.infer<typeof nucleusSchema>;
