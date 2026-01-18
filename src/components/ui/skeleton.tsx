import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "circle" | "text";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-bg-tertiary",
                variant === "default" && "rounded-md",
                variant === "circle" && "rounded-full",
                variant === "text" && "rounded h-4",
                className
            )}
            {...props}
        />
    );
}

// === SKELETON CARD ===
function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-xl border border-border-subtle p-6 space-y-4", className)}>
            <div className="flex items-center gap-4">
                <Skeleton variant="circle" className="h-12 w-12" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

// === SKELETON STAT CARD ===
function SkeletonStatCard({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-2xl border border-border-subtle p-6 space-y-3", className)}>
            <div className="flex items-center justify-between">
                <Skeleton variant="circle" className="h-10 w-10" />
                <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

// === SKELETON TABLE ROW ===
function SkeletonTableRow({ columns = 4, className }: { columns?: number; className?: string }) {
    return (
        <div className={cn("flex items-center gap-4 p-4 border-b border-border-subtle", className)}>
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-4",
                        i === 0 ? "w-12" : i === columns - 1 ? "w-8" : "flex-1"
                    )}
                />
            ))}
        </div>
    );
}

// === SKELETON TEXT ===
function SkeletonText({
    lines = 3,
    className
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={cn(
                        i === lines - 1 ? "w-3/4" : "w-full"
                    )}
                />
            ))}
        </div>
    );
}

// === SKELETON AVATAR ===
function SkeletonAvatar({
    size = "md"
}: {
    size?: "sm" | "md" | "lg" | "xl";
}) {
    const sizes = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
    };

    return <Skeleton variant="circle" className={sizes[size]} />;
}

export {
    Skeleton,
    SkeletonCard,
    SkeletonStatCard,
    SkeletonTableRow,
    SkeletonText,
    SkeletonAvatar
};
