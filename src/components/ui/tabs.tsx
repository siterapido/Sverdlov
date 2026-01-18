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
                "inline-flex items-center gap-0 border-b border-border-default",
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
                "relative px-3 py-2 text-sm font-medium transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                    ? "text-fg-primary"
                    : "text-fg-secondary hover:text-fg-primary",
                className
            )}
        >
            {children}

            {/* Active indicator */}
            {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fg-primary" />
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
        <div
            role="tabpanel"
            className={cn("mt-4 animate-fade-in", className)}
        >
            {children}
        </div>
    );
}
