"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday,
    isBefore,
    isAfter,
    parse,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const datePickerVariants = cva(
    "flex h-10 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer",
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

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export interface DatePickerProps extends VariantProps<typeof datePickerVariants> {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    id?: string;
    clearable?: boolean;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
    ({
        value,
        onChange,
        placeholder = "Selecione uma data",
        minDate,
        maxDate,
        disabled = false,
        error,
        className,
        variant,
        inputSize,
        name,
        id,
        clearable = true,
    }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [viewDate, setViewDate] = React.useState(value || new Date());
        const containerRef = React.useRef<HTMLDivElement>(null);

        const computedVariant = error ? "error" : variant;

        // Handle click outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        // Update view date when value changes
        React.useEffect(() => {
            if (value) {
                setViewDate(value);
            }
        }, [value]);

        const handleSelectDate = (date: Date) => {
            onChange?.(date);
            setIsOpen(false);
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange?.(null);
        };

        const isDateDisabled = (date: Date) => {
            if (minDate && isBefore(date, minDate)) return true;
            if (maxDate && isAfter(date, maxDate)) return true;
            return false;
        };

        // Generate calendar days
        const generateCalendarDays = () => {
            const monthStart = startOfMonth(viewDate);
            const monthEnd = endOfMonth(viewDate);
            const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
            const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

            const days: Date[] = [];
            let currentDate = calendarStart;

            while (currentDate <= calendarEnd) {
                days.push(currentDate);
                currentDate = addDays(currentDate, 1);
            }

            return days;
        };

        const days = generateCalendarDays();

        return (
            <div ref={ref} className="relative w-full">
                <div ref={containerRef} className="relative">
                    {/* Hidden input for form submission */}
                    <input
                        type="hidden"
                        name={name}
                        value={value ? format(value, "yyyy-MM-dd") : ""}
                    />

                    {/* Trigger button */}
                    <button
                        type="button"
                        id={id}
                        disabled={disabled}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className={cn(
                            datePickerVariants({ variant: computedVariant, inputSize }),
                            "flex items-center justify-between gap-2",
                            className
                        )}
                    >
                        <span className={cn(
                            "truncate",
                            !value && "text-zinc-400"
                        )}>
                            {value
                                ? format(value, "dd/MM/yyyy", { locale: ptBR })
                                : placeholder
                            }
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                            {clearable && value && !disabled && (
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
                            <Calendar className="h-4 w-4 text-zinc-500" />
                        </div>
                    </button>

                    {/* Calendar dropdown */}
                    {isOpen && (
                        <div className="absolute z-50 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-4 w-[280px]">
                            {/* Header with navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={() => setViewDate(subMonths(viewDate, 1))}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                <span className="text-sm font-semibold capitalize">
                                    {format(viewDate, "MMMM yyyy", { locale: ptBR })}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setViewDate(addMonths(viewDate, 1))}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {WEEKDAYS.map(day => (
                                    <div
                                        key={day}
                                        className="text-center text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 py-1"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, index) => {
                                    const isCurrentMonth = isSameMonth(day, viewDate);
                                    const isSelected = value && isSameDay(day, value);
                                    const isTodayDate = isToday(day);
                                    const isDisabled = isDateDisabled(day);

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => handleSelectDate(day)}
                                            className={cn(
                                                "h-8 w-8 flex items-center justify-center text-sm transition-colors",
                                                !isCurrentMonth && "text-zinc-300 dark:text-zinc-600",
                                                isCurrentMonth && !isSelected && "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                                isSelected && "bg-primary text-white font-semibold",
                                                isTodayDate && !isSelected && "border border-primary text-primary",
                                                isDisabled && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {format(day, "d")}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Today button */}
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    if (!isDateDisabled(today)) {
                                        handleSelectDate(today);
                                    }
                                }}
                                className="w-full mt-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors font-medium"
                            >
                                Hoje
                            </button>
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
DatePicker.displayName = "DatePicker";

// === DATE RANGE PICKER ===
export interface DateRange {
    start: Date | null;
    end: Date | null;
}

export interface DateRangePickerProps extends VariantProps<typeof datePickerVariants> {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    error?: string;
    className?: string;
    name?: string;
    id?: string;
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
    ({
        value = { start: null, end: null },
        onChange,
        placeholder = "Selecione um período",
        minDate,
        maxDate,
        disabled = false,
        error,
        className,
        variant,
        inputSize,
        name,
        id,
    }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [viewDate, setViewDate] = React.useState(value.start || new Date());
        const [selecting, setSelecting] = React.useState<"start" | "end">("start");
        const containerRef = React.useRef<HTMLDivElement>(null);

        const computedVariant = error ? "error" : variant;

        // Handle click outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handleSelectDate = (date: Date) => {
            if (selecting === "start") {
                onChange?.({ start: date, end: null });
                setSelecting("end");
            } else {
                if (value.start && isBefore(date, value.start)) {
                    onChange?.({ start: date, end: value.start });
                } else {
                    onChange?.({ ...value, end: date });
                }
                setSelecting("start");
                setIsOpen(false);
            }
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange?.({ start: null, end: null });
            setSelecting("start");
        };

        const isDateDisabled = (date: Date) => {
            if (minDate && isBefore(date, minDate)) return true;
            if (maxDate && isAfter(date, maxDate)) return true;
            return false;
        };

        const isInRange = (date: Date) => {
            if (!value.start || !value.end) return false;
            return isAfter(date, value.start) && isBefore(date, value.end);
        };

        // Generate calendar days
        const generateCalendarDays = () => {
            const monthStart = startOfMonth(viewDate);
            const monthEnd = endOfMonth(viewDate);
            const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
            const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

            const days: Date[] = [];
            let currentDate = calendarStart;

            while (currentDate <= calendarEnd) {
                days.push(currentDate);
                currentDate = addDays(currentDate, 1);
            }

            return days;
        };

        const days = generateCalendarDays();
        const hasValue = value.start || value.end;

        const getDisplayValue = () => {
            if (!value.start && !value.end) return null;
            if (value.start && !value.end) {
                return format(value.start, "dd/MM/yyyy", { locale: ptBR }) + " - ...";
            }
            if (value.start && value.end) {
                return `${format(value.start, "dd/MM/yyyy", { locale: ptBR })} - ${format(value.end, "dd/MM/yyyy", { locale: ptBR })}`;
            }
            return null;
        };

        return (
            <div ref={ref} className="relative w-full">
                <div ref={containerRef} className="relative">
                    {/* Hidden inputs for form submission */}
                    <input
                        type="hidden"
                        name={name ? `${name}_start` : undefined}
                        value={value.start ? format(value.start, "yyyy-MM-dd") : ""}
                    />
                    <input
                        type="hidden"
                        name={name ? `${name}_end` : undefined}
                        value={value.end ? format(value.end, "yyyy-MM-dd") : ""}
                    />

                    {/* Trigger button */}
                    <button
                        type="button"
                        id={id}
                        disabled={disabled}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className={cn(
                            datePickerVariants({ variant: computedVariant, inputSize }),
                            "flex items-center justify-between gap-2",
                            className
                        )}
                    >
                        <span className={cn(
                            "truncate",
                            !hasValue && "text-zinc-400"
                        )}>
                            {getDisplayValue() || placeholder}
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
                            <Calendar className="h-4 w-4 text-zinc-500" />
                        </div>
                    </button>

                    {/* Calendar dropdown */}
                    {isOpen && (
                        <div className="absolute z-50 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-4 w-[280px]">
                            {/* Selection indicator */}
                            <div className="text-[10px] font-black uppercase tracking-wider text-center mb-3 text-zinc-500">
                                {selecting === "start" ? "Selecione a data inicial" : "Selecione a data final"}
                            </div>

                            {/* Header with navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={() => setViewDate(subMonths(viewDate, 1))}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                <span className="text-sm font-semibold capitalize">
                                    {format(viewDate, "MMMM yyyy", { locale: ptBR })}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setViewDate(addMonths(viewDate, 1))}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {WEEKDAYS.map(day => (
                                    <div
                                        key={day}
                                        className="text-center text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 py-1"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, index) => {
                                    const isCurrentMonth = isSameMonth(day, viewDate);
                                    const isStartDate = value.start && isSameDay(day, value.start);
                                    const isEndDate = value.end && isSameDay(day, value.end);
                                    const isInRangeDate = isInRange(day);
                                    const isTodayDate = isToday(day);
                                    const isDisabled = isDateDisabled(day);

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => handleSelectDate(day)}
                                            className={cn(
                                                "h-8 w-8 flex items-center justify-center text-sm transition-colors",
                                                !isCurrentMonth && "text-zinc-300 dark:text-zinc-600",
                                                isCurrentMonth && !isStartDate && !isEndDate && "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                                (isStartDate || isEndDate) && "bg-primary text-white font-semibold",
                                                isInRangeDate && "bg-primary/20",
                                                isTodayDate && !isStartDate && !isEndDate && "border border-primary text-primary",
                                                isDisabled && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {format(day, "d")}
                                        </button>
                                    );
                                })}
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
DateRangePicker.displayName = "DateRangePicker";

export { DatePicker, DateRangePicker, datePickerVariants };
