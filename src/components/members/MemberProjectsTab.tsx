'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ProjectAssignment {
    id: string;
    projectId: string;
    memberId: string;
    role: 'coordinator' | 'member' | 'contributor' | 'observer';
    assignedAt: string | Date;
    status: 'active' | 'inactive';
    project?: {
        id: string;
        name: string;
        type: string | null;
        status: string | null;
    };
}

interface MemberProjectsTabProps {
    memberId: string;
    assignments: ProjectAssignment[];
}

const roleColors: Record<string, string> = {
    coordinator: 'bg-red-100 text-red-800',
    member: 'bg-blue-100 text-blue-800',
    contributor: 'bg-green-100 text-green-800',
    observer: 'bg-gray-100 text-gray-800',
};

const roleLabels: Record<string, string> = {
    coordinator: 'Coordenador',
    member: 'Membro',
    contributor: 'Colaborador',
    observer: 'Observador',
};

export function MemberProjectsTab({ memberId, assignments }: MemberProjectsTabProps) {
    if (!assignments || assignments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">Este membro não está vinculado a nenhum projeto</p>
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
                                        href={`/projects/${assignment.projectId}`}
                                        className="hover:underline text-blue-600"
                                    >
                                        {assignment.project?.name || 'Projeto desconhecido'}
                                    </Link>
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Tipo: {assignment.project?.type || 'N/A'} • Status: {assignment.project?.status || 'N/A'}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge className={roleColors[assignment.role]}>
                                    {roleLabels[assignment.role]}
                                </Badge>
                                <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                                    {assignment.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                        <p>Atribuído em: {typeof assignment.assignedAt === 'string'
                            ? new Date(assignment.assignedAt).toLocaleDateString('pt-BR')
                            : assignment.assignedAt.toLocaleDateString('pt-BR')}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
