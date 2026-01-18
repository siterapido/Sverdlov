"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsContextType {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used within a Tabs provider");
    }
    return context;
}

interface TabsProps {
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
    const [activeTab, setActiveTabState] = React.useState(value || defaultValue);

    const setActiveTab = React.useCallback((tab: string) => {
        setActiveTabState(tab);
        onValueChange?.(tab);
    }, [onValueChange]);

    React.useEffect(() => {
        if (value !== undefined) {
            setActiveTabState(value);
        }
    }, [value]);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "pills" | "underline";
}

export function TabsList({ children, className, variant = "default" }: TabsListProps) {
    const variantClasses = {
        default: "bg-bg-tertiary p-1 rounded-lg",
        pills: "gap-2",
        underline: "border-b border-border-subtle gap-0",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center",
                variantClasses[variant],
                className
            )}
            role="tablist"
        >
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    variant?: "default" | "pills" | "underline";
}

export function TabsTrigger({
    value,
    children,
    className,
    disabled = false,
    variant = "default"
}: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    const baseClasses = "relative px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        default: cn(
            "rounded-md",
            isActive
                ? "text-fg-primary"
                : "text-fg-secondary hover:text-fg-primary"
        ),
        pills: cn(
            "rounded-lg",
            isActive
                ? "bg-primary-500 text-white shadow-md"
                : "text-fg-secondary hover:bg-bg-hover hover:text-fg-primary"
        ),
        underline: cn(
            "pb-3",
            isActive
                ? "text-primary-500"
                : "text-fg-secondary hover:text-fg-primary"
        ),
    };

    return (
        <button
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => !disabled && setActiveTab(value)}
            className={cn(baseClasses, variantClasses[variant], className)}
        >
            {children}

            {/* Active indicator for default variant */}
            {variant === "default" && isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-bg-secondary rounded-md shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            {/* Active indicator for underline variant */}
            {variant === "underline" && isActive && (
                <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { activeTab } = useTabsContext();

    if (activeTab !== value) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            className={cn("mt-4", className)}
        >
            {children}
        </motion.div>
    );
}
