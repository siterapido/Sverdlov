"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface PopoverProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    triggerMode?: "click" | "hover";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
    contentClassName?: string;
    maxWidth?: string;
    disabled?: boolean;
}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
    ({
        trigger,
        children,
        side = "bottom",
        align = "center",
        triggerMode = "click",
        open: controlledOpen,
        onOpenChange,
        closeOnOutsideClick = true,
        closeOnEscape = true,
        showCloseButton = false,
        className,
        contentClassName,
        maxWidth = "320px",
        disabled = false,
    }, ref) => {
        const [internalOpen, setInternalOpen] = React.useState(false);
        const triggerRef = React.useRef<HTMLDivElement>(null);
        const contentRef = React.useRef<HTMLDivElement>(null);
        const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

        const isControlled = controlledOpen !== undefined;
        const isOpen = isControlled ? controlledOpen : internalOpen;

        const setOpen = (value: boolean) => {
            if (!isControlled) {
                setInternalOpen(value);
            }
            onOpenChange?.(value);
        };

        // Handle click outside
        React.useEffect(() => {
            if (!isOpen || !closeOnOutsideClick) return;

            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Node;
                if (
                    triggerRef.current && !triggerRef.current.contains(target) &&
                    contentRef.current && !contentRef.current.contains(target)
                ) {
                    setOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [isOpen, closeOnOutsideClick]);

        // Handle escape key
        React.useEffect(() => {
            if (!isOpen || !closeOnEscape) return;

            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setOpen(false);
                }
            };

            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }, [isOpen, closeOnEscape]);

        // Cleanup hover timeout
        React.useEffect(() => {
            return () => {
                if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                }
            };
        }, []);

        const handleTriggerClick = () => {
            if (disabled || triggerMode !== "click") return;
            setOpen(!isOpen);
        };

        const handleMouseEnter = () => {
            if (disabled || triggerMode !== "hover") return;
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            hoverTimeoutRef.current = setTimeout(() => setOpen(true), 100);
        };

        const handleMouseLeave = () => {
            if (disabled || triggerMode !== "hover") return;
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            hoverTimeoutRef.current = setTimeout(() => setOpen(false), 150);
        };

        const getPositionClasses = () => {
            const sideClasses = {
                top: "bottom-full mb-2",
                bottom: "top-full mt-2",
                left: "right-full mr-2",
                right: "left-full ml-2",
            };

            const alignClasses = {
                start: side === "top" || side === "bottom" ? "left-0" : "top-0",
                center: side === "top" || side === "bottom" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
                end: side === "top" || side === "bottom" ? "right-0" : "bottom-0",
            };

            return cn(sideClasses[side], alignClasses[align]);
        };

        const getAnimationClasses = () => {
            const animations = {
                top: "animate-in fade-in-0 slide-in-from-bottom-2",
                bottom: "animate-in fade-in-0 slide-in-from-top-2",
                left: "animate-in fade-in-0 slide-in-from-right-2",
                right: "animate-in fade-in-0 slide-in-from-left-2",
            };
            return animations[side];
        };

        return (
            <div
                ref={ref}
                className={cn("relative inline-block", className)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Trigger */}
                <div
                    ref={triggerRef}
                    onClick={handleTriggerClick}
                    className={cn(
                        "inline-block",
                        triggerMode === "click" && !disabled && "cursor-pointer",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {trigger}
                </div>

                {/* Content */}
                {isOpen && (
                    <div
                        ref={contentRef}
                        className={cn(
                            "absolute z-50",
                            getPositionClasses(),
                            getAnimationClasses(),
                            "duration-150"
                        )}
                        style={{ maxWidth }}
                    >
                        <div
                            className={cn(
                                "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
                                "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]",
                                contentClassName
                            )}
                        >
                            {showCloseButton && (
                                <button
                                    onClick={() => setOpen(false)}
                                    className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            {children}
                        </div>
                    </div>
                )}
            </div>
        );
    }
);
Popover.displayName = "Popover";

// === POPOVER CONTENT HELPERS ===
interface PopoverHeaderProps {
    children: React.ReactNode;
    className?: string;
}

function PopoverHeader({ children, className }: PopoverHeaderProps) {
    return (
        <div className={cn(
            "px-4 py-3 border-b border-zinc-200 dark:border-zinc-700",
            className
        )}>
            {children}
        </div>
    );
}

interface PopoverBodyProps {
    children: React.ReactNode;
    className?: string;
}

function PopoverBody({ children, className }: PopoverBodyProps) {
    return (
        <div className={cn("p-4", className)}>
            {children}
        </div>
    );
}

interface PopoverFooterProps {
    children: React.ReactNode;
    className?: string;
}

function PopoverFooter({ children, className }: PopoverFooterProps) {
    return (
        <div className={cn(
            "px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-end gap-2",
            className
        )}>
            {children}
        </div>
    );
}

export { Popover, PopoverHeader, PopoverBody, PopoverFooter };
