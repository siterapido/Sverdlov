"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva(
    "relative inline-flex items-center justify-center overflow-hidden font-medium select-none",
    {
        variants: {
            size: {
                xs: "h-5 w-5 text-[10px] rounded-[3px]",
                sm: "h-6 w-6 text-xs rounded-[4px]",
                md: "h-8 w-8 text-sm rounded-[4px]",
                lg: "h-10 w-10 text-base rounded-[5px]",
                xl: "h-12 w-12 text-lg rounded-[6px]",
            },
            variant: {
                default: "bg-accent-light text-accent",
                gray: "bg-bg-tertiary text-fg-secondary",
                blue: "bg-accent-light text-accent",
                green: "bg-success-light text-success",
                yellow: "bg-warning-light text-warning",
                red: "bg-danger-light text-danger",
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
