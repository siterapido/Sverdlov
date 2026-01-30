import React, { Suspense } from "react";
import { MembersClient } from "@/components/members/MembersClient";
import { getMembers, getPendingMembers } from "@/app/actions/members";

export default async function MembersPage() {
    // Busca os dados diretamente no servidor
    const [membersResult, requestsResult] = await Promise.all([
        getMembers(),
        getPendingMembers()
    ]);

    const members = membersResult.success ? membersResult.data : [];
    const requests = requestsResult.success ? requestsResult.data : [];

    return (
        <div className="max-w-6xl">
            <Suspense fallback={<MembersSkeleton />}>
                <MembersClient
                    initialMembers={members || []}
                    initialRequests={requests as any[]}
                />
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
