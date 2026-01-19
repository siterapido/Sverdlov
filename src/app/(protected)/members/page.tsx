import React, { Suspense } from "react";
import { MembersClient } from "@/components/members/MembersClient";
import { getMembers } from "@/app/actions/members";
import { Plus, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";

export default async function MembersPage() {
    // Busca os dados diretamente no servidor
    const result = await getMembers();
    const members = result.success ? result.data : [];

    return (
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                            <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider dark:text-blue-400">Gestão</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Filiados
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Gerencie todos os membros e interessados da organização.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex items-center gap-2">
                        Relatórios
                    </Button>
                    <Button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900">
                        <Plus className="h-4 w-4" />
                        Novo Filiado
                    </Button>
                </div>
            </div>

            <Suspense fallback={<MembersSkeleton />}>
                <MembersClient initialMembers={members || []} />
            </Suspense>
        </div>
    );
}

function MembersSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between gap-4">
                <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full" />
                <div className="h-10 w-80 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md" />
            </div>
            <SkeletonCard className="h-[500px] rounded-lg" />
        </div>
    );
}


