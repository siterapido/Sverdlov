'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import { PageTransition } from "@/components/ui/page-transition";

interface SettingsTabsProps {
  initialUsers: any[];
  userRole?: string;
}

export function SettingsTabs({ initialUsers, userRole }: SettingsTabsProps) {
  const isAdmin = userRole === 'ADMIN';

  return (
    <Tabs defaultValue="general" className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="bg-white p-1 border border-zinc-200">
          <TabsTrigger value="general" className="gap-2 text-black">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="gap-2 text-black">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="general">
        <PageTransition>
          <div className="border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-24 text-center rounded-lg">
            <div className="h-16 w-16 bg-white border-2 border-zinc-100 flex items-center justify-center mx-auto mb-6 rounded-full">
              <Settings className="h-8 w-8 text-zinc-300" />
            </div>
            <p className="text-xl font-black uppercase tracking-tight text-zinc-900">Configurações Gerais</p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-2">
              Personalização de perfil e notificações em breve.
            </p>
          </div>
        </PageTransition>
      </TabsContent>

      {isAdmin && (
        <TabsContent value="users">
          <PageTransition>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Administração de Usuários
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Gerencie coordenadores e permissões de acesso ao sistema.
                </p>
              </div>
              <UserManagement initialUsers={initialUsers} />
            </div>
          </PageTransition>
        </TabsContent>
      )}
    </Tabs>
  );
}
