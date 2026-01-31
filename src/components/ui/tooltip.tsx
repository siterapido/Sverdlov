"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    delay?: number;
    disabled?: boolean;
    className?: string;
    contentClassName?: string;
    maxWidth?: string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
    ({
        content,
        children,
        side = "top",
        align = "center",
        delay = 200,
        disabled = false,
        className,
        contentClassName,
        maxWidth = "200px",
    }, ref) => {
        const [isVisible, setIsVisible] = React.useState(false);
        const [position, setPosition] = React.useState({ top: 0, left: 0 });
        const triggerRef = React.useRef<HTMLDivElement>(null);
        const tooltipRef = React.useRef<HTMLDivElement>(null);
        const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

        const calculatePosition = React.useCallback(() => {
            if (!triggerRef.current || !tooltipRef.current) return;

            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top = 0;
            let left = 0;
            const offset = 8;

            // Calculate position based on side
            switch (side) {
                case "top":
                    top = triggerRect.top + scrollY - tooltipRect.height - offset;
                    break;
                case "bottom":
                    top = triggerRect.bottom + scrollY + offset;
                    break;
                case "left":
                    left = triggerRect.left + scrollX - tooltipRect.width - offset;
                    top = triggerRect.top + scrollY;
                    break;
                case "right":
                    left = triggerRect.right + scrollX + offset;
                    top = triggerRect.top + scrollY;
                    break;
            }

            // Calculate alignment
            if (side === "top" || side === "bottom") {
                switch (align) {
                    case "start":
                        left = triggerRect.left + scrollX;
                        break;
                    case "center":
                        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
                        break;
                    case "end":
                        left = triggerRect.right + scrollX - tooltipRect.width;
                        break;
                }
            } else {
                switch (align) {
                    case "start":
                        top = triggerRect.top + scrollY;
                        break;
                    case "center":
                        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
                        break;
                    case "end":
                        top = triggerRect.bottom + scrollY - tooltipRect.height;
                        break;
                }
            }

            // Boundary checks
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Keep within horizontal bounds
            if (left < scrollX + 8) {
                left = scrollX + 8;
            } else if (left + tooltipRect.width > scrollX + viewportWidth - 8) {
                left = scrollX + viewportWidth - tooltipRect.width - 8;
            }

            // Keep within vertical bounds
            if (top < scrollY + 8) {
                top = scrollY + 8;
            } else if (top + tooltipRect.height > scrollY + viewportHeight - 8) {
                top = scrollY + viewportHeight - tooltipRect.height - 8;
            }

            setPosition({ top, left });
        }, [side, align]);

        const showTooltip = () => {
            if (disabled) return;

            timeoutRef.current = setTimeout(() => {
                setIsVisible(true);
            }, delay);
        };

        const hideTooltip = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setIsVisible(false);
        };

        // Calculate position after visibility change
        React.useEffect(() => {
            if (isVisible) {
                // Wait for next frame to get accurate dimensions
                requestAnimationFrame(calculatePosition);
            }
        }, [isVisible, calculatePosition]);

        // Cleanup timeout on unmount
        React.useEffect(() => {
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, []);

        const arrowClasses = {
            top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-zinc-800",
            bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-zinc-800",
            left: "right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-r-transparent border-l-zinc-800",
            right: "left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-l-transparent border-r-zinc-800",
        };

        return (
            <>
                <div
                    ref={triggerRef}
                    className={cn("inline-block", className)}
                    onMouseEnter={showTooltip}
                    onMouseLeave={hideTooltip}
                    onFocus={showTooltip}
                    onBlur={hideTooltip}
                >
                    {children}
                </div>

                {isVisible && (
                    <div
                        ref={(node) => {
                            tooltipRef.current = node;
                            if (typeof ref === "function") {
                                ref(node);
                            } else if (ref) {
                                ref.current = node;
                            }
                        }}
                        role="tooltip"
                        className={cn(
                            "fixed z-[100] px-3 py-2 text-xs font-medium text-white bg-zinc-800 dark:bg-zinc-700",
                            "shadow-lg animate-in fade-in-0 zoom-in-95 duration-100",
                            contentClassName
                        )}
                        style={{
                            top: position.top,
                            left: position.left,
                            maxWidth,
                        }}
                    >
                        {content}
                        <span
                            className={cn(
                                "absolute border-4",
                                arrowClasses[side]
                            )}
                        />
                    </div>
                )}
            </>
        );
    }
);
Tooltip.displayName = "Tooltip";

// === TOOLTIP PROVIDER (for context-based tooltips) ===
interface TooltipContextValue {
    delay: number;
}

const TooltipContext = React.createContext<TooltipContextValue>({ delay: 200 });

export interface TooltipProviderProps {
    children: React.ReactNode;
    delay?: number;
}

function TooltipProvider({ children, delay = 200 }: TooltipProviderProps) {
    return (
        <TooltipContext.Provider value={{ delay }}>
            {children}
        </TooltipContext.Provider>
    );
}

export { Tooltip, TooltipProvider };
