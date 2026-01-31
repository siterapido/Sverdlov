"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { FolderOpen, Search, FileQuestion, Users, Calendar, Inbox } from "lucide-react";

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: "default" | "outline" | "secondary";
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    size?: "sm" | "default" | "lg";
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({
        icon,
        title,
        description,
        action,
        secondaryAction,
        className,
        size = "default",
    }, ref) => {
        const sizeClasses = {
            sm: {
                container: "py-8 px-4",
                icon: "h-10 w-10",
                iconWrapper: "h-16 w-16",
                title: "text-sm",
                description: "text-xs",
            },
            default: {
                container: "py-12 px-6",
                icon: "h-12 w-12",
                iconWrapper: "h-20 w-20",
                title: "text-base",
                description: "text-sm",
            },
            lg: {
                container: "py-16 px-8",
                icon: "h-16 w-16",
                iconWrapper: "h-24 w-24",
                title: "text-lg",
                description: "text-base",
            },
        };

        const classes = sizeClasses[size];

        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col items-center justify-center text-center",
                    classes.container,
                    className
                )}
            >
                {/* Icon */}
                {icon && (
                    <div className={cn(
                        "flex items-center justify-center mb-4",
                        "bg-zinc-100 dark:bg-zinc-800 rounded-full",
                        classes.iconWrapper
                    )}>
                        <div className={cn("text-zinc-400 dark:text-zinc-500", classes.icon)}>
                            {icon}
                        </div>
                    </div>
                )}

                {/* Title */}
                <h3 className={cn(
                    "font-semibold text-zinc-900 dark:text-zinc-100",
                    classes.title
                )}>
                    {title}
                </h3>

                {/* Description */}
                {description && (
                    <p className={cn(
                        "mt-2 text-zinc-500 dark:text-zinc-400 max-w-sm",
                        classes.description
                    )}>
                        {description}
                    </p>
                )}

                {/* Actions */}
                {(action || secondaryAction) && (
                    <div className="mt-6 flex items-center gap-3">
                        {action && (
                            <Button
                                variant={action.variant || "default"}
                                onClick={action.onClick}
                                size={size === "sm" ? "sm" : "default"}
                            >
                                {action.label}
                            </Button>
                        )}
                        {secondaryAction && (
                            <Button
                                variant="ghost"
                                onClick={secondaryAction.onClick}
                                size={size === "sm" ? "sm" : "default"}
                            >
                                {secondaryAction.label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    }
);
EmptyState.displayName = "EmptyState";

// === PRESET EMPTY STATES ===

interface PresetEmptyStateProps {
    onAction?: () => void;
    className?: string;
}

// No results found (search)
function EmptySearchResults({ onAction, className }: PresetEmptyStateProps) {
    return (
        <EmptyState
            icon={<Search />}
            title="Nenhum resultado encontrado"
            description="Tente ajustar os filtros ou usar termos diferentes na busca."
            action={onAction ? {
                label: "Limpar busca",
                onClick: onAction,
                variant: "outline",
            } : undefined}
            className={className}
        />
    );
}

// No data (generic)
function EmptyData({ onAction, className }: PresetEmptyStateProps & { title?: string; description?: string }) {
    return (
        <EmptyState
            icon={<Inbox />}
            title="Nenhum dado disponível"
            description="Não há informações para exibir no momento."
            action={onAction ? {
                label: "Atualizar",
                onClick: onAction,
                variant: "outline",
            } : undefined}
            className={className}
        />
    );
}

// Empty folder/files
function EmptyFiles({ onAction, className }: PresetEmptyStateProps) {
    return (
        <EmptyState
            icon={<FolderOpen />}
            title="Nenhum arquivo"
            description="Esta pasta está vazia. Adicione arquivos para começar."
            action={onAction ? {
                label: "Adicionar arquivo",
                onClick: onAction,
            } : undefined}
            className={className}
        />
    );
}

// No members
function EmptyMembers({ onAction, className }: PresetEmptyStateProps) {
    return (
        <EmptyState
            icon={<Users />}
            title="Nenhum membro encontrado"
            description="Adicione membros para começar a organizar sua equipe."
            action={onAction ? {
                label: "Adicionar membro",
                onClick: onAction,
            } : undefined}
            className={className}
        />
    );
}

// No events/schedules
function EmptySchedule({ onAction, className }: PresetEmptyStateProps) {
    return (
        <EmptyState
            icon={<Calendar />}
            title="Nenhum evento agendado"
            description="Não há eventos programados para este período."
            action={onAction ? {
                label: "Criar evento",
                onClick: onAction,
            } : undefined}
            className={className}
        />
    );
}

// Not found / 404
function NotFound({ onAction, className }: PresetEmptyStateProps) {
    return (
        <EmptyState
            icon={<FileQuestion />}
            title="Página não encontrada"
            description="O conteúdo que você procura não existe ou foi removido."
            action={onAction ? {
                label: "Voltar ao início",
                onClick: onAction,
            } : undefined}
            className={className}
        />
    );
}

export {
    EmptyState,
    EmptySearchResults,
    EmptyData,
    EmptyFiles,
    EmptyMembers,
    EmptySchedule,
    NotFound,
};
