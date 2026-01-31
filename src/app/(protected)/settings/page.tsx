import { Settings } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { getUserSettings } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Configurações',
    description: 'Gerencie seu perfil, preferências e segurança da conta',
};

export default async function SettingsPage() {
    const settingsResult = await getUserSettings();

    if (!settingsResult.success || !settingsResult.data) {
        redirect('/');
    }

    return (
        <PageTransition>
            <div className="max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
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
                            Personalização de perfil, notificações e segurança da conta.
                        </p>
                    </div>
                </div>

                <SettingsClient initialSettings={settingsResult.data} />
            </div>
        </PageTransition>
    );
}
