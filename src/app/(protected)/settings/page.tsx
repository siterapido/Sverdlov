import { Settings } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { getUsers } from "@/app/actions/users";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let userRole = undefined;
    let users: any[] = [];

    if (token) {
        const user = await verifyToken(token);
        if (user) {
            userRole = user.role;
            
            // Only fetch users if admin
            if (userRole === 'ADMIN') {
                try {
                    users = await getUsers();
                } catch (e) {
                    console.error("Failed to fetch users", e);
                }
            }
        }
    }

    return (
        <PageTransition>
            <div className="max-w-6xl space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-primary flex items-center justify-center">
                                <Settings className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Painel de Controle</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                            Configurações
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Gerencie suas preferências e administração do sistema.
                        </p>
                    </div>
                </div>

                <SettingsTabs initialUsers={users} userRole={userRole} />
            </div>
        </PageTransition>
    );
}
