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
                "inline-flex h-12 items-center justify-start border-b border-zinc-100 w-full gap-8",
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
                "inline-flex items-center justify-center whitespace-nowrap h-full px-1 text-[11px] font-black uppercase tracking-[0.1em] transition-all relative",
                isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted hover:text-zinc-900",
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
