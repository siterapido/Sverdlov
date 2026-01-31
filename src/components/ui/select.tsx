"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, X, Search } from "lucide-react";

const selectVariants = cva(
    "flex h-10 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer",
    {
        variants: {
            variant: {
                default: "focus:border-primary",
                error: "border-red-500 focus-visible:ring-red-500",
                success: "border-emerald-500 focus-visible:ring-emerald-500",
            },
            selectSize: {
                sm: "h-8 px-3 text-xs",
                default: "h-11 px-3",
                lg: "h-14 px-4 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            selectSize: "default",
        },
    }
);

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    group?: string;
}

export interface SelectProps extends VariantProps<typeof selectVariants> {
    options: SelectOption[];
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    placeholder?: string;
    searchable?: boolean;
    multiple?: boolean;
    error?: string;
    disabled?: boolean;
    className?: string;
    name?: string;
    id?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
    ({
        options,
        value,
        onChange,
        placeholder = "Selecione...",
        searchable = false,
        multiple = false,
        error,
        disabled = false,
        className,
        variant,
        selectSize,
        name,
        id,
    }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [searchTerm, setSearchTerm] = React.useState("");
        const containerRef = React.useRef<HTMLDivElement>(null);
        const searchInputRef = React.useRef<HTMLInputElement>(null);

        const computedVariant = error ? "error" : variant;

        // Handle click outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                    setSearchTerm("");
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        // Focus search input when opened
        React.useEffect(() => {
            if (isOpen && searchable && searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, [isOpen, searchable]);

        // Filter options based on search
        const filteredOptions = React.useMemo(() => {
            if (!searchTerm) return options;
            return options.filter(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }, [options, searchTerm]);

        // Group options
        const groupedOptions = React.useMemo(() => {
            const groups: Record<string, SelectOption[]> = {};
            const ungrouped: SelectOption[] = [];

            filteredOptions.forEach(option => {
                if (option.group) {
                    if (!groups[option.group]) groups[option.group] = [];
                    groups[option.group].push(option);
                } else {
                    ungrouped.push(option);
                }
            });

            return { groups, ungrouped };
        }, [filteredOptions]);

        // Get selected labels for display
        const getDisplayValue = () => {
            if (multiple && Array.isArray(value)) {
                if (value.length === 0) return null;
                const selectedLabels = options
                    .filter(opt => value.includes(opt.value))
                    .map(opt => opt.label);
                return selectedLabels.length > 2
                    ? `${selectedLabels.length} selecionados`
                    : selectedLabels.join(", ");
            }
            const selected = options.find(opt => opt.value === value);
            return selected?.label;
        };

        const handleSelect = (optionValue: string) => {
            if (multiple) {
                const currentValues = Array.isArray(value) ? value : [];
                const newValues = currentValues.includes(optionValue)
                    ? currentValues.filter(v => v !== optionValue)
                    : [...currentValues, optionValue];
                onChange?.(newValues);
            } else {
                onChange?.(optionValue);
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange?.(multiple ? [] : "");
        };

        const isSelected = (optionValue: string) => {
            if (multiple && Array.isArray(value)) {
                return value.includes(optionValue);
            }
            return value === optionValue;
        };

        const hasValue = multiple
            ? Array.isArray(value) && value.length > 0
            : !!value;

        const displayValue = getDisplayValue();

        const renderOption = (option: SelectOption) => (
            <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={cn(
                    "w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    isSelected(option.value) && "bg-primary/10 text-primary",
                    option.disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <span>{option.label}</span>
                {isSelected(option.value) && (
                    <Check className="h-4 w-4 text-primary" />
                )}
            </button>
        );

        return (
            <div ref={ref} className="relative w-full">
                <div
                    ref={containerRef}
                    className="relative"
                >
                    {/* Hidden input for form submission */}
                    <input
                        type="hidden"
                        name={name}
                        value={multiple ? (Array.isArray(value) ? value.join(",") : "") : (value || "")}
                    />

                    {/* Trigger button */}
                    <button
                        type="button"
                        id={id}
                        disabled={disabled}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className={cn(
                            selectVariants({ variant: computedVariant, selectSize }),
                            "flex items-center justify-between gap-2",
                            className
                        )}
                    >
                        <span className={cn(
                            "truncate",
                            !displayValue && "text-zinc-400"
                        )}>
                            {displayValue || placeholder}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                            {hasValue && !disabled && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleClear}
                                    onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-0.5"
                                >
                                    <X className="h-4 w-4" />
                                </span>
                            )}
                            <ChevronDown className={cn(
                                "h-4 w-4 text-zinc-500 transition-transform",
                                isOpen && "rotate-180"
                            )} />
                        </div>
                    </button>

                    {/* Dropdown */}
                    {isOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] max-h-60 overflow-auto">
                            {/* Search input */}
                            {searchable && (
                                <div className="p-2 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-900">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar..."
                                            className="w-full h-8 pl-8 pr-3 text-sm border border-zinc-200 dark:border-zinc-700 rounded-none bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Options list */}
                            <div className="py-1">
                                {/* Ungrouped options */}
                                {groupedOptions.ungrouped.map(renderOption)}

                                {/* Grouped options */}
                                {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                                    <div key={groupName}>
                                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800">
                                            {groupName}
                                        </div>
                                        {groupOptions.map(renderOption)}
                                    </div>
                                ))}

                                {/* No results */}
                                {filteredOptions.length === 0 && (
                                    <div className="px-3 py-6 text-sm text-zinc-500 dark:text-zinc-400 text-center">
                                        Nenhuma opção encontrada
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-xs mt-1.5 font-medium text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Select.displayName = "Select";

// === NATIVE SELECT (for simpler use cases) ===
export interface NativeSelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
    options: SelectOption[];
    error?: string;
    placeholder?: string;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
    ({ options, error, placeholder, className, variant, selectSize, ...props }, ref) => {
        const computedVariant = error ? "error" : variant;

        return (
            <div className="relative w-full">
                <select
                    ref={ref}
                    className={cn(
                        selectVariants({ variant: computedVariant, selectSize }),
                        "appearance-none pr-10",
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                {error && (
                    <p className="text-xs mt-1.5 font-medium text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
NativeSelect.displayName = "NativeSelect";

export { Select, NativeSelect, selectVariants };
