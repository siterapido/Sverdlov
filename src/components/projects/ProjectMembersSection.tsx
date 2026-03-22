'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, type SelectOption } from '@/components/ui/select';
import { AlertCircle, Trash2, Users } from 'lucide-react';
import { removeMemberFromProject, updateProjectMemberRole } from '@/app/actions/projects';

interface ProjectMember {
    id: string;
    projectId: string;
    memberId: string;
    role: 'coordinator' | 'member' | 'contributor' | 'observer';
    status: 'active' | 'inactive';
    assignedAt: string | Date;
    member?: {
        id: string;
        fullName: string;
        email: string | null;
        militancyLevel: string;
    };
    assignedBy?: {
        id: string;
        fullName: string;
    } | null;
}

interface ProjectMembersSectionProps {
    projectId: string;
    members: ProjectMember[];
    canManage: boolean;
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

export function ProjectMembersSection({ projectId, members, canManage }: ProjectMembersSectionProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleRemoveMember = async (assignmentId: string) => {
        if (!confirm('Deseja remover este membro do projeto?')) return;

        setLoading(assignmentId);
        try {
            const result = await removeMemberFromProject(assignmentId);
            if (result.success) {
                alert('Membro removido com sucesso');
            } else {
                alert(result.error || 'Falha ao remover membro');
            }
        } finally {
            setLoading(null);
        }
    };

    const handleUpdateRole = async (assignmentId: string, newRole: string | string[]) => {
        if (Array.isArray(newRole)) return;

        setLoading(assignmentId);
        try {
            const result = await updateProjectMemberRole(
                assignmentId,
                newRole as 'coordinator' | 'member' | 'contributor' | 'observer'
            );
            if (result.success) {
                alert('Papel atualizado com sucesso');
            } else {
                alert(result.error || 'Falha ao atualizar papel');
            }
        } finally {
            setLoading(null);
        }
    };

    if (!members || members.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Membros da Equipe
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 text-center">Nenhum membro vinculado a este projeto</p>
                        {canManage && (
                            <Button className="mt-4" variant="outline">
                                Adicionar Membro
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Membros da Equipe ({members.length})
                    </CardTitle>
                    <CardDescription>Pessoas vinculadas a este projeto</CardDescription>
                </div>
                {canManage && (
                    <Button variant="outline" size="sm">
                        Adicionar Membro
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/members/${member.memberId}`}
                                        className="font-medium hover:underline text-blue-600"
                                    >
                                        {member.member?.fullName || 'Membro desconhecido'}
                                    </Link>
                                    <Badge variant="outline" className="text-xs">
                                        {member.member?.militancyLevel === 'leader'
                                            ? 'Liderança'
                                            : member.member?.militancyLevel === 'militant'
                                                ? 'Militante'
                                                : 'Simpatizante'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{member.member?.email}</p>
                                {member.assignedBy && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Atribuído por {member.assignedBy.fullName} em{' '}
                                        {typeof member.assignedAt === 'string'
                                            ? new Date(member.assignedAt).toLocaleDateString('pt-BR')
                                            : member.assignedAt.toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 ml-4">
                                {canManage ? (
                                    <>
                                        <Select
                                            value={member.role}
                                            onChange={(value) => handleUpdateRole(member.id, value)}
                                            disabled={loading === member.id}
                                            options={[
                                                { value: 'coordinator', label: roleLabels.coordinator },
                                                { value: 'member', label: roleLabels.member },
                                                { value: 'contributor', label: roleLabels.contributor },
                                                { value: 'observer', label: roleLabels.observer }
                                            ]}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member.id)}
                                            disabled={loading === member.id}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </>
                                ) : (
                                    <Badge className={roleColors[member.role]}>
                                        {roleLabels[member.role]}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
