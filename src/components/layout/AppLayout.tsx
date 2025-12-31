"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-bg-primary font-sans text-fg-primary">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "md:ml-64" : "ml-0"
                )}
            >
                {!isSidebarOpen && (
                    <div className="fixed top-3 left-3 z-50">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-fg-secondary hover:bg-bg-hover p-1 rounded-sm"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                )}
                <main className="min-h-screen w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
