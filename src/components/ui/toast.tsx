"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
}

// Context
const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

// Provider
interface ToastProviderProps {
    children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).slice(2);
        const duration = toast.duration ?? 5000;
        const newToast: Toast = { ...toast, id, duration };
        setToasts((prev) => [...prev, newToast]);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Container
interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

// Toast Item
interface ToastItemProps {
    toast: Toast;
    onClose: () => void;
}

const toastStyles: Record<ToastType, { icon: React.ReactNode; colorClass: string }> = {
    success: {
        icon: <CheckCircle className="h-5 w-5" />,
        colorClass: "text-emerald-500 dark:text-emerald-400",
    },
    error: {
        icon: <AlertCircle className="h-5 w-5" />,
        colorClass: "text-red-500 dark:text-red-400",
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5" />,
        colorClass: "text-amber-500 dark:text-amber-400",
    },
    info: {
        icon: <Info className="h-5 w-5" />,
        colorClass: "text-primary dark:text-primary/70",
    },
};

function ToastItem({ toast, onClose }: ToastItemProps) {
    const style = toastStyles[toast.type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
                "pointer-events-auto flex items-start gap-4 rounded-none p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] min-w-[320px] max-w-[420px] border-2",
                "bg-white border-zinc-900"
            )}
        >
            <span className={cn("shrink-0 mt-0.5", style.colorClass)}>{style.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="font-black uppercase tracking-tighter text-sm text-zinc-900">{toast.title}</p>
                {toast.description && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mt-1.5 leading-relaxed">{toast.description}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="shrink-0 rounded-none p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 absolute right-2 top-2 transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
        </motion.div>
    );
}

// Convenience functions
export function toast(options: Omit<Toast, "id">) {
    // This will be used with the ToastProvider context
    console.warn("toast() called outside of ToastProvider. Use useToast() hook instead.");
}

export const toastSuccess = (title: string, description?: string) =>
    ({ type: "success" as const, title, description });

export const toastError = (title: string, description?: string) =>
    ({ type: "error" as const, title, description });

export const toastWarning = (title: string, description?: string) =>
    ({ type: "warning" as const, title, description });

export const toastInfo = (title: string, description?: string) =>
    ({ type: "info" as const, title, description });
