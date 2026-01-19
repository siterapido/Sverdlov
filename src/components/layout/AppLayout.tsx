"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className="flex min-h-screen bg-white text-zinc-900">
            <Sidebar
                isOpen={isMobile ? isSidebarOpen : true}
                isCollapsed={!isMobile && isCollapsed}
                isMobile={isMobile}
                toggleSidebar={toggleSidebar}
            />

            <div
                className={cn(
                    "flex-1 flex flex-col transition-[margin] duration-200 ease-out",
                    isMobile ? "ml-0" : (isCollapsed ? "ml-[60px]" : "ml-64")
                )}
            >
                <AppHeader toggleSidebar={toggleSidebar} isMobile={isMobile} />

                <main className="flex-1 overflow-auto p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
