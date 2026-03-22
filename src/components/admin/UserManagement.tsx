'use client';

import { useState } from 'react';
import CreateUserModal from './CreateUserModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteUser } from '@/app/actions/users';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

interface UserManagementProps {
    initialUsers: any[];
    initialCities: any[];
}

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Admin Geral',
    STATE_COORD: 'Coord. Estadual',
    CITY_COORD: 'Coord. Municipal',
    ZONE_COORD: 'Coord. Zonal',
    LOCAL_COORD: 'Coord. Local',
};

export default function UserManagement({ initialUsers, initialCities }: UserManagementProps) {
    const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { addToast } = useToast();
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        try {
            await deleteUser(id);
            addToast({ title: 'Usuário excluído', type: 'success' });
            router.refresh();
        } catch (e) {
            addToast({ title: 'Erro ao excluir', type: 'error' });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuários</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>Novo Usuário</Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-white dark:bg-white">
                            <tr>
                                <th className="p-4 font-medium text-zinc-900">Nome</th>
                                <th className="p-4 font-medium text-zinc-900">Email</th>
                                <th className="p-4 font-medium text-zinc-900">Cargo</th>
                                <th className="p-4 font-medium text-zinc-900">Escopo</th>
                                <th className="p-4 font-medium text-zinc-900 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialUsers.map(user => (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                    <td className="p-4">{user.fullName}</td>
                                    <td className="p-4 text-zinc-500">{user.email}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary shadow hover:bg-primary/20">
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-zinc-500">
                                        {user.scopeCity && user.scopeState
                                            ? `${user.scopeCity} - ${user.scopeState}`
                                            : user.scopeState || 'Global'}
                                        {user.scopeZone && ` (Zona: ${user.scopeZone})`}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            Excluir
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {initialUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-zinc-500">Nenhum usuário encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            <CreateUserModal
                isOpen={iscreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    router.refresh();
                }}
                cities={initialCities}
            />
        </Card>
    );
}
