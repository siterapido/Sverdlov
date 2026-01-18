"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva(
    "relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium text-white select-none",
    {
        variants: {
            size: {
                xs: "h-6 w-6 text-[10px]",
                sm: "h-8 w-8 text-xs",
                md: "h-10 w-10 text-sm",
                lg: "h-12 w-12 text-base",
                xl: "h-16 w-16 text-lg",
                "2xl": "h-24 w-24 text-2xl",
            },
            variant: {
                default: "bg-gradient-to-br from-primary-400 to-secondary-500",
                primary: "bg-gradient-to-br from-primary-500 to-primary-600",
                secondary: "bg-gradient-to-br from-secondary-400 to-secondary-600",
                accent: "bg-gradient-to-br from-accent-400 to-accent-600",
                muted: "bg-bg-tertiary text-fg-secondary",
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
    ring?: boolean;
}

const statusColors = {
    online: "bg-success-500",
    offline: "bg-fg-tertiary",
    busy: "bg-danger-500",
    away: "bg-warning-500",
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
    ({ className, size, variant, src, alt, fallback, status, ring = false, ...props }, ref) => {
        const [imageError, setImageError] = React.useState(false);
        const showFallback = !src || imageError;

        return (
            <div
                ref={ref}
                className={cn(
                    avatarVariants({ size, variant }),
                    ring && "ring-2 ring-bg-primary ring-offset-2 ring-offset-bg-primary",
                    className
                )}
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
                            "absolute bottom-0 right-0 block rounded-full border-2 border-bg-secondary",
                            statusColors[status],
                            size === "xs" && "h-1.5 w-1.5",
                            size === "sm" && "h-2 w-2",
                            size === "md" && "h-2.5 w-2.5",
                            size === "lg" && "h-3 w-3",
                            size === "xl" && "h-4 w-4",
                            size === "2xl" && "h-5 w-5"
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
                    className="ring-2 ring-bg-secondary rounded-full"
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
                        avatarVariants({ size, variant: "muted" }),
                        "ring-2 ring-bg-secondary"
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
