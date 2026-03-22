'use client';

import { cn } from '@/lib/utils';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface TaskAssignee {
    id: string;
    memberId: string;
    status: string | null;
    member: {
        id: string;
        fullName: string;
        socialName?: string | null;
    };
    [key: string]: any;
}

export interface TaskData {
    id: string;
    projectId: string;
    title: string;
    description?: string | null;
    status: string | null;
    priority: string | null;
    category?: string | null;
    turno?: string | null;
    dayOfWeek?: number | null;
    frequency?: string | null;
    location?: string | null;
    color?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    sortOrder?: number | null;
    dueDate?: string | Date | null;
    assignees?: TaskAssignee[];
    project?: { id: string; name: string } | null;
    [key: string]: any; // Allow additional fields from DB
}

interface TaskCardProps {
    task: TaskData;
    onClick?: () => void;
    isDragging?: boolean;
    showProject?: boolean;
}

const priorityConfig: Record<string, { label: string; color: string }> = {
    high: { label: 'Alta', color: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: 'Média', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    low: { label: 'Baixa', color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const categoryLabels: Record<string, string> = {
    vigilancia: 'Vigilância',
    formacao: 'Formação',
    agitacao: 'Agitação',
    administrativa: 'Admin',
    financeira: 'Financeira',
    outras: 'Outras',
};

const turnoLabels: Record<string, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
};

const dayLabels: Record<number, string> = {
    0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb',
};

const frequencyLabels: Record<string, string> = {
    pontual: '',
    semanal: 'Semanal',
    quinzenal: 'Quinzenal',
    mensal: 'Mensal',
    continua: 'Contínua',
};

export function TaskCard({ task, onClick, isDragging, showProject }: TaskCardProps) {
    const priority = priorityConfig[task.priority || 'medium'] || priorityConfig.medium;
    const assignees = task.assignees || [];
    const confirmed = assignees.filter(a => a.status === 'confirmed' || a.status === 'attended').length;
    const declined = assignees.filter(a => a.status === 'declined').length;
    const total = assignees.length;

    const isDueSoon = task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    // Build schedule label (e.g. "Sáb Manhã" or "Semanal")
    const scheduleLabel = [
        task.dayOfWeek !== null && task.dayOfWeek !== undefined ? dayLabels[task.dayOfWeek] : null,
        task.turno ? turnoLabels[task.turno] : null,
    ].filter(Boolean).join(' ');

    const freqLabel = task.frequency && task.frequency !== 'pontual' ? frequencyLabels[task.frequency] : null;

    return (
        <div
            className={cn(
                "bg-white border-2 border-zinc-200 p-3 cursor-pointer transition-all",
                "hover:border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]",
                "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]",
                isDragging && "opacity-80 rotate-2 shadow-lg border-zinc-900"
            )}
            onClick={onClick}
        >
            {/* Title */}
            <h4 className="text-sm font-bold text-zinc-900 truncate mb-2">{task.title}</h4>

            {/* Badges row */}
            <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 border", priority.color)}>
                    {priority.label}
                </span>
                {task.category && task.category !== 'outras' && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {categoryLabels[task.category] || task.category}
                    </span>
                )}
                {showProject && task.project && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200">
                        {task.project.name}
                    </span>
                )}
            </div>

            {/* Schedule info */}
            {(scheduleLabel || freqLabel) && (
                <div className="flex items-center gap-1.5 mb-2 text-[10px] text-zinc-500 font-bold uppercase">
                    <Clock className="h-3 w-3" />
                    {scheduleLabel && <span>{scheduleLabel}</span>}
                    {freqLabel && <span className="text-primary">{freqLabel}</span>}
                    {task.startTime && <span>{task.startTime}{task.endTime ? `-${task.endTime}` : ''}</span>}
                </div>
            )}

            {/* Location */}
            {task.location && (
                <div className="flex items-center gap-1.5 mb-2 text-[10px] text-zinc-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{task.location}</span>
                </div>
            )}

            {/* Due date */}
            {task.dueDate && (
                <div className={cn(
                    "flex items-center gap-1.5 mb-2 text-[10px] font-bold",
                    isOverdue ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-zinc-400"
                )}>
                    <Calendar className="h-3 w-3" />
                    <span>
                        {isOverdue ? 'Vencida: ' : ''}
                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                </div>
            )}

            {/* Assignees & Confirmation */}
            {total > 0 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                    {/* Avatar stack */}
                    <div className="flex items-center -space-x-2">
                        {assignees.slice(0, 3).map(a => {
                            const name = a.member?.socialName || a.member?.fullName || '?';
                            const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                            return (
                                <div
                                    key={a.id}
                                    className={cn(
                                        "h-6 w-6 flex items-center justify-center text-[9px] font-black border-2 border-white",
                                        a.status === 'confirmed' || a.status === 'attended' ? 'bg-emerald-500 text-white' :
                                        a.status === 'declined' ? 'bg-red-400 text-white' :
                                        'bg-zinc-200 text-zinc-600'
                                    )}
                                    title={`${name} - ${a.status}`}
                                >
                                    {initials}
                                </div>
                            );
                        })}
                        {total > 3 && (
                            <div className="h-6 w-6 flex items-center justify-center text-[9px] font-black bg-zinc-100 text-zinc-500 border-2 border-white">
                                +{total - 3}
                            </div>
                        )}
                    </div>

                    {/* Confirmation progress */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(confirmed / total) * 40}px` }} />
                            <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${(declined / total) * 40}px` }} />
                            <div className="h-1.5 rounded-full bg-zinc-200" style={{ width: `${((total - confirmed - declined) / total) * 40}px` }} />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold">
                            {confirmed}/{total}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
