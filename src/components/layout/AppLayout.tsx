"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className="flex min-h-screen bg-bg-primary font-sans text-fg-primary">
            <Sidebar
                isOpen={isMobile ? isSidebarOpen : true}
                isCollapsed={!isMobile && isCollapsed}
                isMobile={isMobile}
                toggleSidebar={toggleSidebar}
            />

            <div
                className={cn(
                    "flex-1 flex flex-col transition-[margin] duration-300 ease-in-out font-sans",
                    isMobile ? "ml-0" : (isCollapsed ? "ml-16" : "ml-64")
                )}
            >
                <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
