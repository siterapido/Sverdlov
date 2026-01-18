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
            className="overflow-hidden transition-all duration-200"
        >
            <div className="h-1 w-full" style={{ backgroundColor: schedule.color || 'var(--color-border-default)' }} />
            
            <CardContent className={compact ? 'p-3' : 'p-4'}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-fg-primary truncate ${compact ? 'text-sm' : 'text-base'}`}>
                            {schedule.name}
                        </h3>
                        {!compact && schedule.description && (
                            <p className="text-xs text-fg-secondary mt-0.5 line-clamp-2">
                                {schedule.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <Badge variant={categoryVariant} size="sm">
                        {CATEGORY_LABELS[schedule.category] || schedule.category}
                    </Badge>
                    <Badge variant={statusInfo.variant} dot dotColor={statusInfo.variant === 'default' ? 'gray' : statusInfo.variant} size="sm">
                        {statusInfo.label}
                    </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-fg-secondary">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(schedule.startDate)}</span>
                    </div>
                    {schedule.territoryScope && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
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
