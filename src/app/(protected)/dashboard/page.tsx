import { getDashboardStats } from "@/app/actions/dashboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { Suspense } from "react";
import { SkeletonStatCard, SkeletonCard } from "@/components/ui/skeleton";

export default async function DashboardPage() {
    // We can use direct call or fetch here since it's a server component
    const data = await getDashboardStats();

    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardClient data={data} />
        </Suspense>
    );
}

function DashboardSkeleton() {
    return (
        <div className="max-w-6xl">
            <div className="mb-10 space-y-3 border-b border-zinc-100 pb-8">
                <div className="h-10 w-48 bg-zinc-100 animate-pulse rounded-none" />
                <div className="h-4 w-64 bg-zinc-100 animate-pulse rounded-none" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-zinc-100 mb-10">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-zinc-50 border-r last:border-r-0 border-zinc-100 animate-pulse" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="h-64 bg-zinc-50 border-2 border-zinc-100 animate-pulse rounded-none" />
                </div>
                <div>
                    <div className="h-64 bg-zinc-50 border-2 border-zinc-100 animate-pulse rounded-none" />
                </div>
                <div className="lg:col-span-2">
                    <div className="h-64 bg-zinc-50 border-2 border-zinc-100 animate-pulse rounded-none" />
                </div>
                <div>
                    <div className="h-64 bg-zinc-50 border-2 border-zinc-100 animate-pulse rounded-none" />
                </div>
            </div>
        </div>
    );
}
