"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { updateMemberStatus } from "@/app/actions/members";
import {
    User,
    GraduationCap,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Phone,
    Mail,
    MapPin,
} from "lucide-react";

type MemberStatus = "interested" | "in_formation" | "active" | "inactive";

interface MemberData {
    id: string;
    fullName: string;
    socialName?: string | null;
    email?: string | null;
    phone?: string | null;
    state?: string | null;
    city?: string | null;
    status: MemberStatus;
    createdAt: Date;
}

interface Column {
    id: MemberStatus;
    title: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

const columns: Column[] = [
    {
        id: "interested",
        title: "Interessados",
        icon: <User className="h-4 w-4" />,
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
        id: "in_formation",
        title: "Em Formacao",
        icon: <GraduationCap className="h-4 w-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
        id: "active",
        title: "Ativos",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
        id: "inactive",
        title: "Inativos",
        icon: <XCircle className="h-4 w-4" />,
        color: "text-zinc-500",
        bgColor: "bg-zinc-50 dark:bg-zinc-800/50",
    },
];

interface MembersPipelineProps {
    members: MemberData[];
    onMemberClick?: (member: MemberData) => void;
    onStatusChange?: (memberId: string, newStatus: MemberStatus) => void;
}

export function MembersPipeline({
    members: initialMembers,
    onMemberClick,
    onStatusChange,
}: MembersPipelineProps) {
    const [members, setMembers] = useState<MemberData[]>(initialMembers);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getMembersByStatus = useCallback(
        (status: MemberStatus) => {
            return members.filter((m) => m.status === status);
        },
        [members]
    );

    const getActiveItem = useCallback(() => {
        return members.find((m) => m.id === activeId);
    }, [members, activeId]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeItem = members.find((m) => m.id === active.id);
        if (!activeItem) return;

        // Check if dragged over a column
        const overColumn = columns.find((col) => col.id === over.id);
        if (overColumn && activeItem.status !== overColumn.id) {
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === active.id ? { ...m, status: overColumn.id } : m
                )
            );
        }

        // Check if dragged over another member
        const overMember = members.find((m) => m.id === over.id);
        if (overMember && activeItem.status !== overMember.status) {
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === active.id ? { ...m, status: overMember.status } : m
                )
            );
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const member = members.find((m) => m.id === active.id);
        const originalMember = initialMembers.find((m) => m.id === active.id);

        if (!member || !originalMember) return;

        // If status changed, update in backend
        if (member.status !== originalMember.status) {
            setIsUpdating(true);
            try {
                const result = await updateMemberStatus(member.id, member.status);
                if (result.success) {
                    onStatusChange?.(member.id, member.status);
                } else {
                    // Revert on failure
                    setMembers((prev) =>
                        prev.map((m) =>
                            m.id === member.id ? { ...m, status: originalMember.status } : m
                        )
                    );
                }
            } catch (error) {
                // Revert on error
                setMembers((prev) =>
                    prev.map((m) =>
                        m.id === member.id ? { ...m, status: originalMember.status } : m
                    )
                );
            } finally {
                setIsUpdating(false);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4">
                {columns.map((column) => (
                    <PipelineColumn
                        key={column.id}
                        column={column}
                        members={getMembersByStatus(column.id)}
                        onMemberClick={onMemberClick}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeId ? (
                    <MemberCard
                        member={getActiveItem()!}
                        isDragging
                    />
                ) : null}
            </DragOverlay>

            {isUpdating && (
                <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
                    <div className="bg-white px-6 py-3 shadow-lg text-sm font-medium">
                        Atualizando status...
                    </div>
                </div>
            )}
        </DndContext>
    );
}

interface PipelineColumnProps {
    column: Column;
    members: MemberData[];
    onMemberClick?: (member: MemberData) => void;
}

function PipelineColumn({ column, members, onMemberClick }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useSortable({
        id: column.id,
        data: { type: "column" },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-72 flex flex-col",
                "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
                isOver && "ring-2 ring-primary ring-offset-2"
            )}
        >
            {/* Column Header */}
            <div
                className={cn(
                    "px-4 py-3 border-b border-zinc-200 dark:border-zinc-700",
                    column.bgColor
                )}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={column.color}>{column.icon}</span>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {column.title}
                        </h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {members.length}
                    </Badge>
                </div>
            </div>

            {/* Cards Container */}
            <SortableContext
                items={members.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto">
                    {members.length === 0 ? (
                        <div className="text-center py-8 text-sm text-zinc-400">
                            Nenhum membro
                        </div>
                    ) : (
                        members.map((member) => (
                            <SortableMemberCard
                                key={member.id}
                                member={member}
                                onClick={() => onMemberClick?.(member)}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

interface SortableMemberCardProps {
    member: MemberData;
    onClick?: () => void;
}

function SortableMemberCard({ member, onClick }: SortableMemberCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: member.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <MemberCard member={member} onClick={onClick} isDragging={isDragging} />
        </div>
    );
}

interface MemberCardProps {
    member: MemberData;
    onClick?: () => void;
    isDragging?: boolean;
}

function MemberCard({ member, onClick, isDragging }: MemberCardProps) {
    const displayName = member.socialName || member.fullName;
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div
            className={cn(
                "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3",
                "cursor-grab active:cursor-grabbing",
                "hover:border-primary/50 hover:shadow-sm transition-all",
                isDragging && "opacity-50 rotate-2 shadow-lg"
            )}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                <Avatar
                    name={displayName}
                    size="sm"
                    className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {displayName}
                    </h4>
                    {member.email && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{member.email}</span>
                        </div>
                    )}
                    {member.city && member.state && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-500">
                            <MapPin className="h-3 w-3" />
                            <span>
                                {member.city}, {member.state}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MembersPipeline;
