"use client";

import * as React from "react";
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
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
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
}

export function TabsTrigger({
    value,
    children,
    className,
    disabled = false,
}: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
        <button
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => !disabled && setActiveTab(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                    : "hover:bg-zinc-200/50 hover:text-zinc-900 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100",
                className
            )}
        >
            {children}
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
        <div
            role="tabpanel"
            className={cn("mt-4 animate-fade-in", className)}
        >
            {children}
        </div>
    );
}
