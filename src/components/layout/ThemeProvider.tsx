"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "sverdlov-theme",
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme | null;
        if (stored) {
            setTheme(stored);
        }
        setMounted(true);
    }, [storageKey]);

    useEffect(() => {
        const root = window.document.documentElement;

        const resolveTheme = (): "light" | "dark" => {
            if (theme === "system") {
                return window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";
            }
            return theme;
        };

        const resolved = resolveTheme();
        setResolvedTheme(resolved);

        root.setAttribute("data-theme", resolved);
        root.classList.remove("light", "dark");
        root.classList.add(resolved);

        if (theme !== "system") {
            localStorage.setItem(storageKey, theme);
        }
    }, [theme, storageKey]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = () => {
            if (theme === "system") {
                const resolved = mediaQuery.matches ? "dark" : "light";
                setResolvedTheme(resolved);
                document.documentElement.setAttribute("data-theme", resolved);
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(resolved);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// === THEME TOGGLE BUTTON ===
interface ThemeToggleProps {
    variant?: "icon" | "dropdown";
    className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    if (variant === "icon") {
        const handleClick = () => {
            setTheme(resolvedTheme === "dark" ? "light" : "dark");
        };

        return (
            <motion.button
                onClick={handleClick}
                className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-lg",
                    "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100",
                    className
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
            >
                <motion.div
                    initial={false}
                    animate={{
                        rotate: resolvedTheme === "dark" ? 0 : 180,
                        scale: 1
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                    {resolvedTheme === "dark" ? (
                        <Moon className="h-5 w-5 text-zinc-100" />
                    ) : (
                        <Sun className="h-5 w-5 text-zinc-900" />
                    )}
                </motion.div>
            </motion.button>
        );
    }

    // Dropdown variant
    const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
        { value: "light", label: "Claro", icon: <Sun className="h-4 w-4" /> },
        { value: "dark", label: "Escuro", icon: <Moon className="h-4 w-4" /> },
        { value: "system", label: "Sistema", icon: <Monitor className="h-4 w-4" /> },
    ];

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-10 items-center gap-2 rounded-lg px-3",
                    "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                )}
            >
                {resolvedTheme === "dark" ? (
                    <Moon className="h-4 w-4 text-zinc-100" />
                ) : (
                    <Sun className="h-4 w-4 text-zinc-900" />
                )}
                <span className="text-sm font-medium">
                    {options.find((o) => o.value === theme)?.label}
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={cn(
                            "absolute right-0 top-full mt-2 z-50",
                            "min-w-[140px] rounded-xl border border-zinc-200 dark:border-zinc-800",
                            "bg-white dark:bg-zinc-900 shadow-xl overflow-hidden"
                        )}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex w-full items-center gap-2 px-3 py-2 text-sm",
                                    "hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors",
                                    theme === option.value && "bg-zinc-100 dark:bg-zinc-800 font-medium"
                                )}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </motion.div>
                </>
            )}
        </div>
    );
}
