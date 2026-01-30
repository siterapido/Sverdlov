'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG: Record<string, { label: string; icon: any; variant: "default" | "green" | "red" | "blue" | "yellow" | "gray" }> = {
    pending: { label: 'Pendente', icon: AlertCircle, variant: 'yellow' },
    confirmed: { label: 'Confirmado', icon: CheckCircle, variant: 'green' },
    declined: { label: 'Recusado', icon: XCircle, variant: 'red' },
    attended: { label: 'Presente', icon: Check, variant: 'blue' },
    absent: { label: 'Ausente', icon: X, variant: 'red' },
    excused: { label: 'Justificado', icon: AlertCircle, variant: 'gray' },
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
        >
            <Card bordered className={`p-4 ${isPast ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-fg-primary truncate">{assignment.slotName}</span>
                            <Badge variant={statusConfig.variant} size="sm" className="gap-1">
                                <statusConfig.icon className="w-3 h-3" />
                                {statusConfig.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-fg-secondary truncate">{assignment.scheduleName}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-fg-tertiary">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(assignment.slotDate + 'T12:00').toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {assignment.slotTime}
                            </span>
                        </div>
                    </div>

                    {canAct && (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleConfirm}
                                disabled={loading}
                                variant="success"
                                size="sm"
                                leftIcon={<Check className="w-3.5 h-3.5" />}
                            >
                                Confirmar
                            </Button>
                            <Button
                                onClick={handleDecline}
                                disabled={loading}
                                variant="outline"
                                size="sm"
                                className="text-danger border-danger/30 hover:bg-danger-light hover:border-danger"
                                leftIcon={<X className="w-3.5 h-3.5" />}
                            >
                                Recusar
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

// Helper export
export { STATUS_CONFIG };
