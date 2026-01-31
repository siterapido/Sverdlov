import { getUsers } from '@/app/actions/users';
import UserManagement from '@/components/admin/UserManagement';

export default async function AdminPage() {
    const usersResult = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-black uppercase tracking-tighter text-black">
                    Administração de Usuários
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Gerencie coordenadores e permissões de acesso ao sistema.
                </p>
            </div>
            <UserManagement initialUsers={usersResult.success ? (usersResult.data || []) : []} />
        </div>
    );
}
