"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:brightness-110",
                destructive: "bg-danger text-white hover:brightness-110",
                outline: "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900",
                secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
                ghost: "hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                link: "text-primary underline-offset-4 hover:underline",
                success: "bg-success text-white hover:brightness-110",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
                "icon-sm": "h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant,
        size,
        asChild = false,
        loading = false,
        leftIcon,
        rightIcon,
        children,
        disabled,
        ...props
    }, ref) => {
        const isDisabled = disabled || loading;
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isDisabled}
                {...props}
            >
                {asChild ? (
                    children
                ) : (
                    <>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : leftIcon ? (
                            <span className="shrink-0">{leftIcon}</span>
                        ) : null}
                        {children}
                        {rightIcon && !loading && (
                            <span className="shrink-0">{rightIcon}</span>
                        )}
                    </>
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

// === ICON BUTTON ===
interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
    icon: React.ReactNode;
    "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, size = "icon", variant = "ghost", className, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                className={cn("rounded-none", className)}
                {...props}
            >
                {icon}
            </Button>
        );
    }
);
IconButton.displayName = "IconButton";

// === BUTTON GROUP ===
interface ButtonGroupProps {
    children: React.ReactNode;
    className?: string;
    attached?: boolean;
}

function ButtonGroup({ children, className, attached = false }: ButtonGroupProps) {
    if (attached) {
        return (
            <div className={cn(
                "inline-flex",
                "[&>button]:rounded-none",
                "[&>button:first-child]:rounded-l-sm",
                "[&>button:last-child]:rounded-r-sm",
                "[&>button:not(:last-child)]:border-r-0",
                className
            )}>
                {children}
            </div>
        );
    }

    return (
        <div className={cn("inline-flex gap-2", className)}>
            {children}
        </div>
    );
}

export { Button, buttonVariants, IconButton, ButtonGroup };
