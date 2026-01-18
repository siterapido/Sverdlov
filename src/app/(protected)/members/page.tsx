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
                        <div className="h-8 w-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-500" />
                        </div>
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Gestão</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-fg-primary">
                        Filiados
                    </h1>
                    <p className="text-fg-secondary">
                        Gerencie todos os membros e interessados da organização.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex items-center gap-2">
                        Relatórios
                    </Button>
                    <Button className="flex items-center gap-2 shadow-lg shadow-primary-500/20">
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
                <div className="h-10 w-64 bg-bg-tertiary animate-pulse rounded-full" />
                <div className="h-10 w-80 bg-bg-tertiary animate-pulse rounded-lg" />
            </div>
            <SkeletonCard className="h-[500px]" />
        </div>
    );
}


