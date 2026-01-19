"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva(
    "relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium select-none bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
    {
        variants: {
            size: {
                xs: "h-5 w-5 text-[10px]",
                sm: "h-8 w-8 text-xs",
                md: "h-10 w-10 text-sm",
                lg: "h-12 w-12 text-base",
                xl: "h-14 w-14 text-lg",
            },
            variant: {
                default: "", // Default handles colors in base class
                gray: "bg-zinc-100 text-zinc-500",
                blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
                green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
                yellow: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
                red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
);

export interface AvatarProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
    src?: string | null;
    alt?: string;
    fallback?: string;
    status?: "online" | "offline" | "busy" | "away";
}

const statusColors = {
    online: "bg-success",
    offline: "bg-fg-muted",
    busy: "bg-danger",
    away: "bg-warning",
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, size, variant, src, alt, fallback, status, ...props }, ref) => {
        const [imageError, setImageError] = React.useState(false);
        const showFallback = !src || imageError;

        return (
            <div
                ref={ref}
                className={cn(avatarVariants({ size, variant }), className)}
                {...props}
            >
                {!showFallback ? (
                    <img
                        src={src}
                        alt={alt || "Avatar"}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span>{fallback ? getInitials(fallback) : "?"}</span>
                )}

                {status && (
                    <span
                        className={cn(
                            "absolute bottom-0 right-0 block rounded-full border-2 border-bg-primary",
                            statusColors[status],
                            size === "xs" && "h-1.5 w-1.5",
                            size === "sm" && "h-2 w-2",
                            size === "md" && "h-2 w-2",
                            size === "lg" && "h-2.5 w-2.5",
                            size === "xl" && "h-3 w-3"
                        )}
                    />
                )}
            </div>
        );
    }
);
Avatar.displayName = "Avatar";

// === AVATAR GROUP ===
interface AvatarGroupProps {
    children: React.ReactNode;
    max?: number;
    size?: VariantProps<typeof avatarVariants>["size"];
    className?: string;
}

function AvatarGroup({ children, max = 4, size = "md", className }: AvatarGroupProps) {
    const childrenArray = React.Children.toArray(children);
    const visibleAvatars = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
        <div className={cn("flex -space-x-2", className)}>
            {visibleAvatars.map((child, index) => (
                <div
                    key={index}
                    className="ring-2 ring-bg-primary rounded-[4px]"
                    style={{ zIndex: visibleAvatars.length - index }}
                >
                    {React.isValidElement(child)
                        ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
                        : child}
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className={cn(
                        avatarVariants({ size, variant: "gray" }),
                        "ring-2 ring-bg-primary"
                    )}
                    style={{ zIndex: 0 }}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}

export { Avatar, avatarVariants, AvatarGroup };
