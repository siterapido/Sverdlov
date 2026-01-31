'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ScheduleSlot {
    id: string;
    slotId: string;
    memberId: string;
    role: 'participant' | 'leader' | 'backup';
    status: 'pending' | 'confirmed' | 'declined' | 'attended' | 'absent' | 'excused';
    createdAt: string;
    slot?: {
        id: string;
        name: string;
        date: string;
        startTime: string;
        endTime: string;
        location?: string;
        schedule?: {
            id: string;
            name: string;
        };
    };
}

interface MemberSchedulesTabProps {
    memberId: string;
    assignments: ScheduleSlot[];
}

const roleColors: Record<string, string> = {
    participant: 'bg-blue-100 text-blue-800',
    leader: 'bg-red-100 text-red-800',
    backup: 'bg-yellow-100 text-yellow-800',
};

const roleLabels: Record<string, string> = {
    participant: 'Participante',
    leader: 'Líder',
    backup: 'Reserva',
};

const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    attended: 'bg-green-200 text-green-900',
    absent: 'bg-red-200 text-red-900',
    excused: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    declined: 'Recusado',
    attended: 'Presença',
    absent: 'Ausência',
    excused: 'Justificado',
};

export function MemberSchedulesTab({ memberId, assignments }: MemberSchedulesTabProps) {
    if (!assignments || assignments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">Este membro não foi atribuído a nenhum turno</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {assignments.map((assignment) => (
                <Card key={assignment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-lg">
                                    <Link
                                        href={`/schedules/${assignment.slot?.schedule?.id}`}
                                        className="hover:underline text-blue-600"
                                    >
                                        {assignment.slot?.schedule?.name || 'Escala desconhecida'}
                                    </Link>
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {assignment.slot?.name}
                                    {assignment.slot?.location && ` • ${assignment.slot.location}`}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge className={roleColors[assignment.role]}>
                                    {roleLabels[assignment.role]}
                                </Badge>
                                <Badge className={statusColors[assignment.status]}>
                                    {statusLabels[assignment.status]}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                        <p>
                            {new Date(assignment.slot?.date || '').toLocaleDateString('pt-BR')} •{' '}
                            {assignment.slot?.startTime} - {assignment.slot?.endTime}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
