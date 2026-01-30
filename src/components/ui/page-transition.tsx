"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// === Fade In Animation Wrapper ===
interface FadeInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.4, className }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay, duration }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// === Slide Up Animation Wrapper ===
interface SlideUpProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function SlideUp({ children, delay = 0, duration = 0.4, className }: SlideUpProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay,
                duration,
                type: "spring",
                stiffness: 100,
                damping: 15,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// === Scale In Animation Wrapper ===
interface ScaleInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function ScaleIn({ children, delay = 0, duration = 0.3, className }: ScaleInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                delay,
                duration,
                type: "spring",
                stiffness: 200,
                damping: 20,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// === Stagger Container ===
interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1
}: StaggerContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: staggerDelay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// === Stagger Item (use inside StaggerContainer) ===
interface StaggerItemProps {
    children: ReactNode;
    className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// === Hover Scale Wrapper ===
interface HoverScaleProps {
    children: ReactNode;
    scale?: number;
    className?: string;
}

export function HoverScale({ children, scale = 1.02, className }: HoverScaleProps) {
    return (
        <motion.div
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// === Animated List ===
interface AnimatedListProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
    return (
        <AnimatePresence mode="popLayout">
            <motion.ul className={className} layout>
                {children}
            </motion.ul>
        </AnimatePresence>
    );
}

interface AnimatedListItemProps {
    children: ReactNode;
    className?: string;
    layoutId?: string;
}

export function AnimatedListItem({ children, className, layoutId }: AnimatedListItemProps) {
    return (
        <motion.li
            layout
            layoutId={layoutId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
            }}
            className={className}
        >
            {children}
        </motion.li>
    );
}
