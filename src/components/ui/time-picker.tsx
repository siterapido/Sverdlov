"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Clock, ChevronDown, X } from "lucide-react";

const timePickerVariants = cva(
    "flex h-10 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
    {
        variants: {
            variant: {
                default: "focus:border-primary",
                error: "border-red-500 focus-visible:ring-red-500",
            },
            inputSize: {
                sm: "h-8 px-3 text-xs",
                default: "h-11 px-3",
                lg: "h-14 px-4 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            inputSize: "default",
        },
    }
);

// Generate time slots in 30-minute intervals
const generateTimeSlots = (interval: number = 30): string[] => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const h = hour.toString().padStart(2, "0");
            const m = minute.toString().padStart(2, "0");
            slots.push(`${h}:${m}`);
        }
    }
    return slots;
};

// Validate time format (HH:mm)
const isValidTime = (time: string): boolean => {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(time);
};

// Format time to HH:mm
const formatTime = (time: string): string => {
    const cleaned = time.replace(/[^\d:]/g, "");
    const parts = cleaned.split(":");

    if (parts.length === 1) {
        const digits = parts[0];
        if (digits.length <= 2) {
            return digits;
        } else if (digits.length <= 4) {
            return `${digits.slice(0, 2)}:${digits.slice(2)}`;
        }
    }

    if (parts.length === 2) {
        const [h, m] = parts;
        const hour = Math.min(23, parseInt(h || "0", 10));
        const minute = Math.min(59, parseInt(m || "0", 10));
        return `${hour.toString().padStart(2, "0")}:${m.length === 0 ? "" : minute.toString().padStart(2, "0")}`;
    }

    return cleaned.slice(0, 5);
};

export interface TimePickerProps extends VariantProps<typeof timePickerVariants> {
    value?: string;
    onChange?: (time: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    id?: string;
    interval?: number; // Interval in minutes for dropdown options
    minTime?: string;
    maxTime?: string;
    clearable?: boolean;
}

const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
    ({
        value = "",
        onChange,
        placeholder = "HH:mm",
        disabled = false,
        error,
        className,
        variant,
        inputSize,
        name,
        id,
        interval = 30,
        minTime,
        maxTime,
        clearable = true,
    }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [inputValue, setInputValue] = React.useState(value);
        const containerRef = React.useRef<HTMLDivElement>(null);
        const inputRef = React.useRef<HTMLInputElement>(null);
        const listRef = React.useRef<HTMLDivElement>(null);

        const computedVariant = error ? "error" : variant;

        const timeSlots = React.useMemo(() => generateTimeSlots(interval), [interval]);

        // Filter time slots based on min/max
        const filteredSlots = React.useMemo(() => {
            return timeSlots.filter(slot => {
                if (minTime && slot < minTime) return false;
                if (maxTime && slot > maxTime) return false;
                return true;
            });
        }, [timeSlots, minTime, maxTime]);

        // Sync input value with prop value
        React.useEffect(() => {
            setInputValue(value);
        }, [value]);

        // Handle click outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                    // Validate and set on blur
                    if (inputValue && isValidTime(inputValue)) {
                        onChange?.(inputValue);
                    } else if (inputValue) {
                        setInputValue(value); // Reset to previous valid value
                    }
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [inputValue, onChange, value]);

        // Scroll to selected time in dropdown
        React.useEffect(() => {
            if (isOpen && listRef.current && value) {
                const selectedElement = listRef.current.querySelector(`[data-time="${value}"]`);
                if (selectedElement) {
                    selectedElement.scrollIntoView({ block: "center" });
                }
            }
        }, [isOpen, value]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const formatted = formatTime(e.target.value);
            setInputValue(formatted);

            // If valid time, update parent
            if (isValidTime(formatted)) {
                onChange?.(formatted);
            }
        };

        const handleSelectTime = (time: string) => {
            setInputValue(time);
            onChange?.(time);
            setIsOpen(false);
            inputRef.current?.focus();
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            setInputValue("");
            onChange?.("");
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                setIsOpen(false);
                if (inputValue && isValidTime(inputValue)) {
                    onChange?.(inputValue);
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setIsOpen(true);
            } else if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        return (
            <div ref={ref} className="relative w-full">
                <div ref={containerRef} className="relative">
                    {/* Hidden input for form submission */}
                    <input
                        type="hidden"
                        name={name}
                        value={value}
                    />

                    {/* Input container */}
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />

                        <input
                            ref={inputRef}
                            type="text"
                            id={id}
                            disabled={disabled}
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={() => setIsOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            maxLength={5}
                            className={cn(
                                timePickerVariants({ variant: computedVariant, inputSize }),
                                "pl-10 pr-16",
                                className
                            )}
                        />

                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {clearable && inputValue && !disabled && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-0.5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => !disabled && setIsOpen(!isOpen)}
                                disabled={disabled}
                                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                            >
                                <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform",
                                    isOpen && "rotate-180"
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Dropdown */}
                    {isOpen && (
                        <div
                            ref={listRef}
                            className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] max-h-48 overflow-auto"
                        >
                            {filteredSlots.map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    data-time={time}
                                    onClick={() => handleSelectTime(time)}
                                    className={cn(
                                        "w-full px-3 py-2 text-left text-sm transition-colors",
                                        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                        time === value && "bg-primary/10 text-primary font-medium"
                                    )}
                                >
                                    {time}
                                </button>
                            ))}
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
TimePicker.displayName = "TimePicker";

// === TIME RANGE PICKER ===
export interface TimeRange {
    start: string;
    end: string;
}

export interface TimeRangePickerProps extends VariantProps<typeof timePickerVariants> {
    value?: TimeRange;
    onChange?: (range: TimeRange) => void;
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    interval?: number;
}

const TimeRangePicker = React.forwardRef<HTMLDivElement, TimeRangePickerProps>(
    ({
        value = { start: "", end: "" },
        onChange,
        disabled = false,
        error,
        className,
        variant,
        inputSize,
        name,
        interval = 30,
    }, ref) => {
        const computedVariant = error ? "error" : variant;

        return (
            <div ref={ref} className={cn("flex items-center gap-2", className)}>
                <TimePicker
                    value={value.start}
                    onChange={(start) => onChange?.({ ...value, start })}
                    placeholder="Início"
                    disabled={disabled}
                    variant={computedVariant}
                    inputSize={inputSize}
                    name={name ? `${name}_start` : undefined}
                    interval={interval}
                    maxTime={value.end || undefined}
                    clearable={false}
                />
                <span className="text-zinc-400">até</span>
                <TimePicker
                    value={value.end}
                    onChange={(end) => onChange?.({ ...value, end })}
                    placeholder="Fim"
                    disabled={disabled}
                    variant={computedVariant}
                    inputSize={inputSize}
                    name={name ? `${name}_end` : undefined}
                    interval={interval}
                    minTime={value.start || undefined}
                    clearable={false}
                />
                {error && (
                    <p className="text-xs mt-1.5 font-medium text-red-500 dark:text-red-400 w-full">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
TimeRangePicker.displayName = "TimeRangePicker";

export { TimePicker, TimeRangePicker, timePickerVariants };
