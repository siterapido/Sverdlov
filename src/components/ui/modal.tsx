"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "./button";

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
    // Close on escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };
        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, onOpenChange]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => onOpenChange(false)}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative z-10 w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

interface ModalContentProps {
    children: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
};

export function ModalContent({ children, className, size = "md" }: ModalContentProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full rounded-2xl border border-border-subtle",
                "bg-bg-secondary shadow-2xl",
                sizeClasses[size],
                className
            )}
        >
            {children}
        </div>
    );
}

interface ModalHeaderProps {
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
}

export function ModalHeader({ children, className, onClose }: ModalHeaderProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between p-6 border-b border-border-subtle",
                className
            )}
        >
            <div className="flex-1">{children}</div>
            {onClose && (
                <IconButton
                    icon={<X className="h-5 w-5" />}
                    aria-label="Close"
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                />
            )}
        </div>
    );
}

interface ModalTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalTitle({ children, className }: ModalTitleProps) {
    return (
        <h2 className={cn("text-lg font-semibold text-fg-primary", className)}>
            {children}
        </h2>
    );
}

interface ModalDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
    return (
        <p className={cn("text-sm text-fg-secondary mt-1", className)}>
            {children}
        </p>
    );
}

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
    return <div className={cn("p-6", className)}>{children}</div>;
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-end gap-3 p-6 border-t border-border-subtle",
                className
            )}
        >
            {children}
        </div>
    );
}

// === Confirm Dialog ===
interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "default";
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onConfirm,
    variant = "default",
    loading = false,
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        if (!loading) onOpenChange(false);
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent size="sm">
                <ModalHeader onClose={() => onOpenChange(false)}>
                    <ModalTitle>{title}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <p className="text-fg-secondary">{description}</p>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        loading={loading}
                    >
                        {confirmLabel}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
