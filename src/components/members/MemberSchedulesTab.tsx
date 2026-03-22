'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckSquare, Clock, MapPin, Calendar } from 'lucide-react';
import { getMemberTasks } from '@/app/actions/task-assignments';
import { cn } from '@/lib/utils';

interface MemberSchedulesTabProps {
    memberId: string;
    assignments?: any[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
    confirmed: { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-800' },
    declined: { label: 'Recusado', color: 'bg-red-100 text-red-800' },
    attended: { label: 'Presente', color: 'bg-blue-100 text-blue-800' },
    absent: { label: 'Ausente', color: 'bg-red-200 text-red-900' },
    excused: { label: 'Justificado', color: 'bg-zinc-100 text-zinc-800' },
};

const taskStatusConfig: Record<string, { label: string; color: string }> = {
    todo: { label: 'A Fazer', color: 'bg-amber-100 text-amber-800' },
    in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
    review: { label: 'Revisão', color: 'bg-purple-100 text-purple-800' },
    done: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-800' },
};

const turnoLabels: Record<string, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
};

const dayLabels: Record<number, string> = {
    0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb',
};

export function MemberSchedulesTab({ memberId }: MemberSchedulesTabProps) {
    const [taskAssignments, setTaskAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const result = await getMemberTasks(memberId);
            if (result.success) {
                setTaskAssignments(result.data || []);
            }
            setLoading(false);
        };
        load();
    }, [memberId]);

    if (loading) {
        return <div className="py-8 text-center text-sm text-zinc-400">Carregando...</div>;
    }

    if (!taskAssignments || taskAssignments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">Este membro não está escalado em nenhuma tarefa</p>
            </div>
        );
    }

    // Group by project
    const byProject = taskAssignments.reduce((acc, assignment) => {
        const projectName = assignment.task?.project?.name || 'Sem projeto';
        const projectId = assignment.task?.projectId || 'none';
        if (!acc[projectId]) {
            acc[projectId] = { name: projectName, assignments: [] };
        }
        acc[projectId].assignments.push(assignment);
        return acc;
    }, {} as Record<string, { name: string; assignments: any[] }>);

    return (
        <div className="space-y-6">
            {(Object.entries(byProject) as [string, { name: string; assignments: any[] }][]).map(([projectId, group]) => (
                <div key={projectId}>
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                        {group.name}
                    </h4>
                    <div className="space-y-2">
                        {group.assignments.map((assignment: any) => {
                            const task = assignment.task;
                            if (!task) return null;
                            const taskStatus = taskStatusConfig[task.status] || taskStatusConfig.todo;
                            const assignmentStatus = statusConfig[assignment.status] || statusConfig.pending;

                            const scheduleLabel = [
                                task.dayOfWeek !== null && task.dayOfWeek !== undefined ? dayLabels[task.dayOfWeek] : null,
                                task.turno ? turnoLabels[task.turno] : null,
                            ].filter(Boolean).join(' ');

                            return (
                                <div
                                    key={assignment.id}
                                    className="flex items-center justify-between p-4 bg-white border-2 border-zinc-200 hover:border-zinc-400 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link
                                                href={`/projects/${task.projectId}`}
                                                className="text-sm font-bold text-zinc-900 hover:text-primary truncate"
                                            >
                                                {task.title}
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={cn("rounded-none text-[10px] font-bold uppercase", taskStatus.color)}>
                                                {taskStatus.label}
                                            </Badge>
                                            <Badge className={cn("rounded-none text-[10px] font-bold uppercase", assignmentStatus.color)}>
                                                {assignmentStatus.label}
                                            </Badge>
                                            {scheduleLabel && (
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {scheduleLabel}
                                                </span>
                                            )}
                                            {task.dueDate && (
                                                <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                            {task.location && (
                                                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {task.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
