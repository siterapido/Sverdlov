"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, Command, ArrowRight, CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CommandItem {
    id: string;
    label: string;
    shortcut?: string;
    icon?: React.ReactNode;
    action?: () => void;
    href?: string;
    keywords?: string[];
    disabled?: boolean;
}

export interface CommandGroup {
    label: string;
    items: CommandItem[];
}

export interface CommandMenuProps {
    groups: CommandGroup[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    placeholder?: string;
    emptyMessage?: string;
    className?: string;
}

// Fuzzy search implementation
function fuzzyMatch(text: string, query: string): boolean {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
        if (textLower[i] === queryLower[queryIndex]) {
            queryIndex++;
        }
    }

    return queryIndex === queryLower.length;
}

const CommandMenu = React.forwardRef<HTMLDivElement, CommandMenuProps>(
    ({
        groups,
        open: controlledOpen,
        onOpenChange,
        placeholder = "Digite um comando ou busque...",
        emptyMessage = "Nenhum resultado encontrado",
        className,
    }, ref) => {
        const [internalOpen, setInternalOpen] = React.useState(false);
        const [searchTerm, setSearchTerm] = React.useState("");
        const [selectedIndex, setSelectedIndex] = React.useState(0);
        const inputRef = React.useRef<HTMLInputElement>(null);
        const listRef = React.useRef<HTMLDivElement>(null);
        const router = useRouter();

        const isControlled = controlledOpen !== undefined;
        const isOpen = isControlled ? controlledOpen : internalOpen;

        const setOpen = (value: boolean) => {
            if (!isControlled) {
                setInternalOpen(value);
            }
            onOpenChange?.(value);
            if (!value) {
                setSearchTerm("");
                setSelectedIndex(0);
            }
        };

        // Filter items based on search
        const filteredGroups = React.useMemo(() => {
            if (!searchTerm) return groups;

            return groups
                .map(group => ({
                    ...group,
                    items: group.items.filter(item => {
                        const searchText = [
                            item.label,
                            ...(item.keywords || []),
                        ].join(" ");
                        return fuzzyMatch(searchText, searchTerm);
                    }),
                }))
                .filter(group => group.items.length > 0);
        }, [groups, searchTerm]);

        // Flatten items for keyboard navigation
        const flatItems = React.useMemo(() => {
            return filteredGroups.flatMap(group =>
                group.items.filter(item => !item.disabled)
            );
        }, [filteredGroups]);

        // Keyboard shortcut to open (⌘K / Ctrl+K)
        React.useEffect(() => {
            const handleKeyDown = (e: KeyboardEvent) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                    e.preventDefault();
                    setOpen(!isOpen);
                }
            };

            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }, [isOpen]);

        // Focus input when opened
        React.useEffect(() => {
            if (isOpen) {
                setTimeout(() => inputRef.current?.focus(), 0);
            }
        }, [isOpen]);

        // Handle keyboard navigation
        const handleKeyDown = (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex(prev =>
                        prev < flatItems.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex(prev =>
                        prev > 0 ? prev - 1 : flatItems.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (flatItems[selectedIndex]) {
                        executeItem(flatItems[selectedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    setOpen(false);
                    break;
            }
        };

        // Execute item action
        const executeItem = (item: CommandItem) => {
            setOpen(false);
            if (item.action) {
                item.action();
            } else if (item.href) {
                router.push(item.href);
            }
        };

        // Reset selection when search changes
        React.useEffect(() => {
            setSelectedIndex(0);
        }, [searchTerm]);

        // Scroll selected item into view
        React.useEffect(() => {
            const selectedElement = listRef.current?.querySelector(
                `[data-index="${selectedIndex}"]`
            );
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: "nearest" });
            }
        }, [selectedIndex]);

        if (!isOpen) return null;

        let itemIndex = -1;

        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
                    onClick={() => setOpen(false)}
                />

                {/* Dialog */}
                <div
                    ref={ref}
                    className={cn(
                        "fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2",
                        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
                        className
                    )}
                >
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden">
                        {/* Search input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                            <Search className="h-5 w-5 text-zinc-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
                            />
                            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800">
                                ESC
                            </kbd>
                        </div>

                        {/* Results */}
                        <div
                            ref={listRef}
                            className="max-h-[300px] overflow-auto p-2"
                        >
                            {filteredGroups.length === 0 ? (
                                <div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                    {emptyMessage}
                                </div>
                            ) : (
                                filteredGroups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="mb-2 last:mb-0">
                                        {/* Group label */}
                                        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
                                            {group.label}
                                        </div>

                                        {/* Group items */}
                                        {group.items.map((item) => {
                                            if (!item.disabled) {
                                                itemIndex++;
                                            }
                                            const currentIndex = itemIndex;
                                            const isSelected = currentIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={item.id}
                                                    data-index={currentIndex}
                                                    disabled={item.disabled}
                                                    onClick={() => executeItem(item)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors",
                                                        isSelected && "bg-zinc-100 dark:bg-zinc-800",
                                                        !isSelected && "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                                        item.disabled && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    {/* Icon */}
                                                    {item.icon && (
                                                        <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
                                                            {item.icon}
                                                        </span>
                                                    )}

                                                    {/* Label */}
                                                    <span className="flex-1 truncate">
                                                        {item.label}
                                                    </span>

                                                    {/* Shortcut or arrow */}
                                                    {item.shortcut ? (
                                                        <kbd className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                                                            {item.shortcut.split(" ").map((key, i) => (
                                                                <React.Fragment key={i}>
                                                                    {i > 0 && <span>+</span>}
                                                                    <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 font-medium">
                                                                        {key === "⌘" ? (
                                                                            <Command className="h-3 w-3 inline" />
                                                                        ) : key === "↵" ? (
                                                                            <CornerDownLeft className="h-3 w-3 inline" />
                                                                        ) : (
                                                                            key
                                                                        )}
                                                                    </span>
                                                                </React.Fragment>
                                                            ))}
                                                        </kbd>
                                                    ) : isSelected && (
                                                        <ArrowRight className="h-4 w-4 text-zinc-400" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-4 text-[10px] text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700">↑</kbd>
                                    <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700">↓</kbd>
                                    <span>navegar</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700">↵</kbd>
                                    <span>selecionar</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                                <Command className="h-3 w-3" />
                                <span>K para abrir</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
);
CommandMenu.displayName = "CommandMenu";

// === HOOK FOR COMMAND MENU ===
export function useCommandMenu() {
    const [open, setOpen] = React.useState(false);

    const toggle = React.useCallback(() => setOpen(prev => !prev), []);
    const close = React.useCallback(() => setOpen(false), []);

    return {
        open,
        setOpen,
        toggle,
        close,
    };
}

export { CommandMenu };
