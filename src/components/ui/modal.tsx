"use client";

import * as React from "react";
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={() => onOpenChange(false)}
            />

            {/* Content */}
            <div
                className="relative z-50 w-full animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
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
    full: "max-w-5xl",
};

export function ModalContent({ children, className, size = "md" }: ModalContentProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full rounded-none border-2 border-zinc-900 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]",
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
                "flex items-center justify-between p-8 pb-4 border-b border-zinc-100 mb-4",
                className
            )}
        >
            <div className="flex-1 space-y-2 text-left">{children}</div>
            {onClose && (
                <IconButton
                    icon={<X className="h-5 w-5" />}
                    aria-label="Close"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-zinc-100 rounded-none"
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
        <h2 className={cn("text-2xl font-black uppercase tracking-tighter text-zinc-900 leading-none", className)}>
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
        <p className={cn("text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-2", className)}>
            {children}
        </p>
    );
}

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
    return <div className={cn("p-8 pt-0", className)}>{children}</div>;
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-4 p-8 pt-4 border-t border-zinc-100 bg-zinc-50",
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
                    <ModalDescription>{description}</ModalDescription>
                </ModalHeader>
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
