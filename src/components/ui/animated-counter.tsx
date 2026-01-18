"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    formatOptions?: Intl.NumberFormatOptions;
    prefix?: string;
    suffix?: string;
    className?: string;
    triggerOnView?: boolean;
}

export function AnimatedCounter({
    value,
    duration = 1.5,
    formatOptions,
    prefix = "",
    suffix = "",
    className,
    triggerOnView = true,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hasAnimated, setHasAnimated] = useState(!triggerOnView);

    const springValue = useSpring(0, {
        stiffness: 50,
        damping: 20,
        duration: duration * 1000,
    });

    const displayValue = useTransform(springValue, (latest) => {
        const formatter = new Intl.NumberFormat("pt-BR", {
            ...formatOptions,
        });
        return `${prefix}${formatter.format(Math.round(latest))}${suffix}`;
    });

    useEffect(() => {
        if (triggerOnView && isInView && !hasAnimated) {
            springValue.set(value);
            setHasAnimated(true);
        } else if (!triggerOnView) {
            springValue.set(value);
        }
    }, [isInView, value, triggerOnView, hasAnimated, springValue]);

    return (
        <motion.span ref={ref} className={cn("tabular-nums", className)}>
            {displayValue}
        </motion.span>
    );
}

// === ANIMATED PERCENTAGE ===
interface AnimatedPercentageProps {
    value: number;
    duration?: number;
    className?: string;
    showSign?: boolean;
}

export function AnimatedPercentage({
    value,
    duration = 1,
    className,
    showSign = true,
}: AnimatedPercentageProps) {
    return (
        <AnimatedCounter
            value={value}
            duration={duration}
            prefix={showSign && value > 0 ? "+" : ""}
            suffix="%"
            className={className}
            formatOptions={{ maximumFractionDigits: 1 }}
        />
    );
}

// === ANIMATED CURRENCY ===
interface AnimatedCurrencyProps {
    value: number;
    currency?: string;
    duration?: number;
    className?: string;
}

export function AnimatedCurrency({
    value,
    currency = "BRL",
    duration = 1.5,
    className,
}: AnimatedCurrencyProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hasAnimated, setHasAnimated] = useState(false);

    const springValue = useSpring(0, {
        stiffness: 50,
        damping: 20,
    });

    const displayValue = useTransform(springValue, (latest) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency,
        }).format(latest);
    });

    useEffect(() => {
        if (isInView && !hasAnimated) {
            springValue.set(value);
            setHasAnimated(true);
        }
    }, [isInView, value, hasAnimated, springValue]);

    return (
        <motion.span ref={ref} className={cn("tabular-nums", className)}>
            {displayValue}
        </motion.span>
    );
}

// === COUNTER WITH TREND ===
interface CounterWithTrendProps {
    value: number;
    previousValue: number;
    formatOptions?: Intl.NumberFormatOptions;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export function CounterWithTrend({
    value,
    previousValue,
    formatOptions,
    prefix = "",
    suffix = "",
    className,
}: CounterWithTrendProps) {
    const percentageChange = previousValue !== 0
        ? ((value - previousValue) / previousValue) * 100
        : 0;
    const isPositive = percentageChange >= 0;

    return (
        <div className={cn("flex items-baseline gap-2", className)}>
            <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                formatOptions={formatOptions}
                className="text-3xl font-bold"
            />
            <span
                className={cn(
                    "flex items-center text-sm font-medium",
                    isPositive ? "text-success-500" : "text-danger-500"
                )}
            >
                <span className="mr-0.5">{isPositive ? "↑" : "↓"}</span>
                <AnimatedPercentage value={Math.abs(percentageChange)} showSign={false} />
            </span>
        </div>
    );
}
