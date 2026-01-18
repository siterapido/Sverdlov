'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Schedule } from '@/lib/db/schema';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    vigilancia: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    formacao: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    agitacao: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    administrativa: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
    financeira: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    outras: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
};

const CATEGORY_LABELS: Record<string, string> = {
    vigilancia: 'Vigilância',
    formacao: 'Formação',
    agitacao: 'Agitação',
    administrativa: 'Administrativa',
    financeira: 'Financeira',
    outras: 'Outras',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: 'text-gray-500' },
    active: { label: 'Ativa', color: 'text-green-500' },
    completed: { label: 'Concluída', color: 'text-blue-500' },
    cancelled: { label: 'Cancelada', color: 'text-red-500' },
};

interface ScheduleCardProps {
    schedule: Schedule;
    index?: number;
    showLink?: boolean;
    compact?: boolean;
}

export function ScheduleCard({ schedule, index = 0, showLink = true, compact = false }: ScheduleCardProps) {
    const categoryColors = CATEGORY_COLORS[schedule.category] || CATEGORY_COLORS.outras;
    const statusInfo = STATUS_LABELS[schedule.status] || STATUS_LABELS.draft;

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative bg-white dark:bg-gray-800 rounded-xl border ${categoryColors.border} hover:shadow-lg transition-all duration-300 overflow-hidden`}
        >
            <div className="h-1.5 w-full" style={{ backgroundColor: schedule.color || '#3b82f6' }} />

            <div className={compact ? 'p-4' : 'p-5'}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h3 className={`font-semibold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-1 ${compact ? 'text-base' : 'text-lg'}`}>
                            {schedule.name}
                        </h3>
                        {!compact && schedule.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {schedule.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors.bg} ${categoryColors.text}`}>
                        {CATEGORY_LABELS[schedule.category]}
                    </span>
                    <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(schedule.startDate)}</span>
                    </div>
                    {schedule.territoryScope && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{schedule.territoryScope.split(':')[0]}</span>
                        </div>
                    )}
                </div>

                {showLink && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end">
                        <div className="flex items-center gap-1 text-red-500 group-hover:translate-x-1 transition-transform">
                            <span className="text-sm font-medium">Ver detalhes</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );

    if (showLink) {
        return <Link href={`/escalas/${schedule.id}`}>{content}</Link>;
    }

    return content;
}

// Helper exports
export { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS };
