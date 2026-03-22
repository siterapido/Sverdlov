'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { confirmPresence, declinePresence, checkInAssignment, markAbsent } from '@/app/actions/task-assignments';
import { Clock, Check, X, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Assignee {
    id: string;
    memberId: string;
    status: string | null;
    role?: string | null;
    checkInTime?: string | Date | null;
    checkOutTime?: string | Date | null;
    notes?: string | null;
    member: {
        id: string;
        fullName: string;
        socialName?: string | null;
    };
}

interface TaskAssigneesPanelProps {
    assignees: Assignee[];
    taskId: string;
    isAdmin?: boolean;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    pending: {
        label: 'Pendente',
        icon: <Clock className="h-3.5 w-3.5" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
    },
    confirmed: {
        label: 'Confirmado',
        icon: <Check className="h-3.5 w-3.5" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
    },
    declined: {
        label: 'Recusou',
        icon: <X className="h-3.5 w-3.5" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
    },
    attended: {
        label: 'Presente',
        icon: <MapPin className="h-3.5 w-3.5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
    },
    absent: {
        label: 'Ausente',
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        color: 'text-red-700',
        bgColor: 'bg-red-100 border-red-300',
    },
    excused: {
        label: 'Justificado',
        icon: <Clock className="h-3.5 w-3.5" />,
        color: 'text-zinc-500',
        bgColor: 'bg-zinc-50 border-zinc-200',
    },
};

const roleLabels: Record<string, string> = {
    assignee: 'Responsável',
    leader: 'Líder',
    reviewer: 'Revisor',
    backup: 'Reserva',
};

export function TaskAssigneesPanel({ assignees, taskId, isAdmin = true }: TaskAssigneesPanelProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const confirmed = assignees.filter(a => a.status === 'confirmed' || a.status === 'attended').length;
    const declined = assignees.filter(a => a.status === 'declined').length;
    const pending = assignees.filter(a => a.status === 'pending').length;
    const total = assignees.length;

    const handleAction = async (assignmentId: string, action: 'confirm' | 'decline' | 'checkin' | 'absent') => {
        setLoading(assignmentId);
        try {
            switch (action) {
                case 'confirm':
                    await confirmPresence(assignmentId);
                    break;
                case 'decline':
                    await declinePresence(assignmentId);
                    break;
                case 'checkin':
                    await checkInAssignment(assignmentId);
                    break;
                case 'absent':
                    await markAbsent(assignmentId);
                    break;
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="border-2 border-zinc-200 bg-white">
            {/* Summary header */}
            <div className="px-4 py-3 border-b-2 border-zinc-200 bg-zinc-50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Escalados
                    </span>
                    <span className="text-xs font-bold text-zinc-600">
                        {total} escalados
                        {confirmed > 0 && <span className="text-emerald-600"> · {confirmed} confirmados</span>}
                        {declined > 0 && <span className="text-red-600"> · {declined} recusou</span>}
                        {pending > 0 && <span className="text-amber-600"> · {pending} pendentes</span>}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="flex gap-0.5 h-2">
                    {confirmed > 0 && (
                        <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${(confirmed / total) * 100}%` }}
                        />
                    )}
                    {declined > 0 && (
                        <div
                            className="bg-red-400 h-full transition-all"
                            style={{ width: `${(declined / total) * 100}%` }}
                        />
                    )}
                    {(total - confirmed - declined) > 0 && (
                        <div
                            className="bg-zinc-200 h-full transition-all"
                            style={{ width: `${((total - confirmed - declined) / total) * 100}%` }}
                        />
                    )}
                </div>
            </div>

            {/* Assignee list */}
            <div className="divide-y divide-zinc-100">
                {assignees.map(assignee => {
                    const config = statusConfig[assignee.status || 'pending'] || statusConfig.pending;
                    const name = assignee.member?.socialName || assignee.member?.fullName || 'Membro';
                    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                    const isLoading = loading === assignee.id;

                    return (
                        <div key={assignee.id} className="flex items-center gap-3 p-3">
                            {/* Avatar */}
                            <div className={cn(
                                "h-8 w-8 flex items-center justify-center text-[10px] font-black border-2",
                                config.bgColor, config.color
                            )}>
                                {initials}
                            </div>

                            {/* Name + Role */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-900 truncate">{name}</p>
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-[10px] font-bold uppercase flex items-center gap-1", config.color)}>
                                        {config.icon}
                                        {config.label}
                                    </span>
                                    {assignee.role && assignee.role !== 'assignee' && (
                                        <span className="text-[10px] text-zinc-400 uppercase font-bold">
                                            · {roleLabels[assignee.role] || assignee.role}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons (admin only) */}
                            {isAdmin && (
                                <div className="flex gap-1">
                                    {(assignee.status === 'pending' || assignee.status === 'confirmed') && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAction(assignee.id, 'checkin')}
                                            disabled={isLoading}
                                            className="h-7 px-2 text-[10px] font-bold uppercase text-blue-600 hover:bg-blue-50"
                                        >
                                            Presença
                                        </Button>
                                    )}
                                    {assignee.status === 'pending' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAction(assignee.id, 'absent')}
                                            disabled={isLoading}
                                            className="h-7 px-2 text-[10px] font-bold uppercase text-red-600 hover:bg-red-50"
                                        >
                                            Falta
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
