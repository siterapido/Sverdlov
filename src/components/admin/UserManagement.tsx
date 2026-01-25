'use client';

import { useState } from 'react';
import CreateUserModal from './CreateUserModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteUser } from '@/app/actions/users';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

export default function UserManagement({ initialUsers }: { initialUsers: any[] }) {
    const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { addToast } = useToast();
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        try {
            await deleteUser(id);
            addToast({ title: 'Usuário excluído', type: 'success' });
            router.refresh(); // Refresh server data
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
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-zinc-50 dark:bg-zinc-900/50">
                            <tr>
                                <th className="p-4 font-medium">Nome</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Cargo</th>
                                <th className="p-4 font-medium">Escopo</th>
                                <th className="p-4 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialUsers.map(user => (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                    <td className="p-4">{user.fullName}</td>
                                    <td className="p-4 text-zinc-500">{user.email}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary shadow hover:bg-primary/20">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-zinc-500">
                                        {user.role === 'STATE_COORD' && `Estado: ${user.scopeState}`}
                                        {user.role === 'CITY_COORD' && `Cidade: ${user.scopeCity} (${user.scopeState})`}
                                        {user.role === 'ZONE_COORD' && `Zona: ${user.scopeZone}`}
                                        {user.role === 'LOCAL_COORD' && `Núcleo ID: ${user.scopeNucleusId?.substring(0, 8)}...`}
                                        {user.role === 'ADMIN' && 'Global'}
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
            />
        </Card>
    );
}
