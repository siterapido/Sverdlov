'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Schedule } from '@/lib/db/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CATEGORY_LABELS: Record<string, string> = {
    vigilancia: 'Vigilância',
    formacao: 'Formação',
    agitacao: 'Agitação',
    administrativa: 'Administrativa',
    financeira: 'Financeira',
    outras: 'Outras',
};

// Mapping legacy categories to new Badge variants
const CATEGORY_VARIANTS: Record<string, "red" | "blue" | "yellow" | "gray" | "green"> = {
    vigilancia: 'red',
    formacao: 'blue',
    agitacao: 'yellow',
    administrativa: 'gray',
    financeira: 'green',
    outras: 'gray',
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "green" | "blue" | "red" }> = {
    draft: { label: 'Rascunho', variant: 'default' },
    active: { label: 'Ativa', variant: 'green' },
    completed: { label: 'Concluída', variant: 'blue' },
    cancelled: { label: 'Cancelada', variant: 'red' },
};

interface ScheduleCardProps {
    schedule: Schedule;
    index?: number;
    showLink?: boolean;
    compact?: boolean;
}

export function ScheduleCard({ schedule, index = 0, showLink = true, compact = false }: ScheduleCardProps) {
    const categoryVariant = CATEGORY_VARIANTS[schedule.category] || 'gray';
    const statusInfo = STATUS_LABELS[schedule.status] || STATUS_LABELS.draft;

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const content = (
        <Card
            bordered
            hover={showLink}
            className="overflow-hidden border-2 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[10px_10px_0px_0px_rgba(0,82,255,0.1)] transition-all group"
        >
            <div className="h-2 w-full" style={{ backgroundColor: schedule.color || '#0052FF' }} />
            
            <CardContent className={compact ? 'p-6' : 'p-8'}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-black text-zinc-900 uppercase tracking-tighter group-hover:text-primary transition-colors leading-none ${compact ? 'text-lg' : 'text-xl'}`}>
                            {schedule.name}
                        </h3>
                        {!compact && schedule.description && (
                            <p className="text-[11px] font-bold text-zinc-400 mt-2 uppercase tracking-wider line-clamp-2">
                                {schedule.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <Badge variant={categoryVariant} className="border-2 font-black">
                        {CATEGORY_LABELS[schedule.category]?.toUpperCase() || schedule.category}
                    </Badge>
                    <Badge variant={statusInfo.variant} className="border-2 font-black">
                        {statusInfo.label.toUpperCase()}
                    </Badge>
                </div>

                <div className="flex items-center gap-6 text-[10px] font-black text-zinc-900 uppercase tracking-widest border-t border-zinc-50 pt-6 mt-auto">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{formatDate(schedule.startDate)}</span>
                    </div>
                    {schedule.territoryScope && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{schedule.territoryScope.split(':')[0]}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (showLink) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <Link href={`/escalas/${schedule.id}`}>{content}</Link>
            </motion.div>
        );
    }

    return content;
}

export { CATEGORY_LABELS, STATUS_LABELS, CATEGORY_VARIANTS };
