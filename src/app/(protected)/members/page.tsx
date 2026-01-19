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
        <div className="max-w-6xl">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-primary flex items-center justify-center">
                            <Users className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Gestão da Organização</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                        Filiados
                    </h1>
                    <p className="text-zinc-500 font-medium text-sm">
                        Gerenciamento centralizado de membros, núcleos e dados estatutários.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" className="hidden sm:flex items-center gap-2 border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[10px]">
                        RELATÓRIOS
                    </Button>
                    <Button className="flex items-center gap-2 bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(0,82,255,0.1)] transition-all active:translate-y-0.5 active:shadow-none">
                        <Plus className="h-4 w-4" />
                        NOVO FILIADO
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
        <div className="space-y-10">
            <div className="flex justify-between gap-4">
                <div className="h-12 w-64 bg-zinc-100 animate-pulse" />
                <div className="h-12 w-96 bg-zinc-100 animate-pulse" />
            </div>
            <div className="h-[600px] bg-zinc-50 animate-pulse border-2 border-zinc-100" />
        </div>
    );
}


