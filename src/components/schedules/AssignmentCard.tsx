'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, AlertCircle, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';
import { SlotAssignment } from '@/lib/db/schema';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Check; color: string; bg: string }> = {
    pending: { label: 'Pendente', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    declined: { label: 'Recusado', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    attended: { label: 'Presente', icon: Check, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    absent: { label: 'Ausente', icon: X, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    excused: { label: 'Justificado', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20' },
};

interface AssignmentWithDetails {
    id: string;
    status: string;
    slotName: string;
    slotDate: string;
    slotTime: string;
    scheduleName: string;
}

interface AssignmentCardProps {
    assignment: AssignmentWithDetails;
    onConfirm?: (id: string) => Promise<void>;
    onDecline?: (id: string) => Promise<void>;
    showActions?: boolean;
}

export function AssignmentCard({ assignment, onConfirm, onDecline, showActions = true }: AssignmentCardProps) {
    const [loading, setLoading] = useState(false);
    const statusConfig = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;
    const isPast = new Date(assignment.slotDate) < new Date();
    const canAct = assignment.status === 'pending' && !isPast && showActions;

    const handleConfirm = async () => {
        if (!onConfirm) return;
        setLoading(true);
        await onConfirm(assignment.id);
        setLoading(false);
    };

    const handleDecline = async () => {
        if (!onDecline) return;
        setLoading(true);
        await onDecline(assignment.id);
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 bg-white dark:bg-gray-800 rounded-xl border ${isPast ? 'opacity-60' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{assignment.slotName}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{assignment.scheduleName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(assignment.slotDate + 'T12:00').toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {assignment.slotTime}
                        </span>
                    </div>
                </div>

                {canAct && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                            Confirmar
                        </button>
                        <button
                            onClick={handleDecline}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1.5 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                            Recusar
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Helper export
export { STATUS_CONFIG };
