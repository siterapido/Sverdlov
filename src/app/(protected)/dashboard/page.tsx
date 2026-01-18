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
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
            <div className="mb-8 space-y-2">
                <div className="h-10 w-48 bg-bg-tertiary animate-pulse rounded-lg" />
                <div className="h-4 w-64 bg-bg-tertiary animate-pulse rounded-lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {[...Array(5)].map((_, i) => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SkeletonCard className="h-64" />
                </div>
                <div>
                    <SkeletonCard className="h-64" />
                </div>
                <div className="lg:col-span-2">
                    <SkeletonCard className="h-64" />
                </div>
                <div>
                    <SkeletonCard className="h-64" />
                </div>
            </div>
        </div>
    );
}
