import { getUsers } from '@/app/actions/users';
import { getCities } from '@/app/actions/cities';
import AdminPanel from '@/components/admin/AdminPanel';

export default async function AdminPage() {
    const [usersResult, citiesResult] = await Promise.all([
        getUsers(),
        getCities(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-black uppercase tracking-tighter text-black">
                    Administração
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Gerencie usuários, cidades e permissões de acesso ao sistema.
                </p>
            </div>
            <AdminPanel
                initialUsers={usersResult.success ? (usersResult.data || []) : []}
                initialCities={citiesResult.success ? (citiesResult.data || []) : []}
            />
        </div>
    );
}
