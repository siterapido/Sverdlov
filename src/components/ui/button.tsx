"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-danger text-white hover:bg-danger/90",
                outline: "border border-input bg-background hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",
                ghost: "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                link: "text-primary underline-offset-4 hover:underline",
                success: "bg-success text-white hover:bg-success/90",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
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
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="shrink-0">{leftIcon}</span>
                ) : null}
                {children}
                {rightIcon && !loading && (
                    <span className="shrink-0">{rightIcon}</span>
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
                className={cn("rounded-[4px]", className)}
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
                "[&>button:first-child]:rounded-l-[4px]",
                "[&>button:last-child]:rounded-r-[4px]",
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
