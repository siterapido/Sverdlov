'use client';

import { useState, useCallback } from 'react';
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
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskCard, type TaskData } from './TaskCard';
import { TaskModal } from './TaskModal';
import { updateTaskStatus } from '@/app/actions/projects';
import { CircleDashed, Timer, Eye, CheckCircle2, Plus } from 'lucide-react';

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

interface KanbanColumn {
    id: TaskStatus;
    title: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

const columns: KanbanColumn[] = [
    { id: 'todo', title: 'A Fazer', icon: <CircleDashed className="h-4 w-4" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { id: 'in_progress', title: 'Em Andamento', icon: <Timer className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'review', title: 'Revisão', icon: <Eye className="h-4 w-4" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'done', title: 'Concluída', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

interface TaskKanbanBoardProps {
    tasks: TaskData[];
    projectId: string;
    projectMembers?: any[];
    showProjectBadge?: boolean;
}

export function TaskKanbanBoard({ tasks: initialTasks, projectId, projectMembers, showProjectBadge }: TaskKanbanBoardProps) {
    const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskData | null>(null);
    const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const getTasksByStatus = useCallback(
        (status: TaskStatus) => tasks.filter(t => t.status === status),
        [tasks]
    );

    const getActiveItem = useCallback(
        () => tasks.find(t => t.id === activeId),
        [tasks, activeId]
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find(t => t.id === active.id);
        if (!activeTask) return;

        // Dragged over a column
        const overColumn = columns.find(col => col.id === over.id);
        if (overColumn && activeTask.status !== overColumn.id) {
            setTasks(prev =>
                prev.map(t => t.id === active.id ? { ...t, status: overColumn.id } : t)
            );
            return;
        }

        // Dragged over another task
        const overTask = tasks.find(t => t.id === over.id);
        if (overTask && activeTask.status !== overTask.status) {
            setTasks(prev =>
                prev.map(t => t.id === active.id ? { ...t, status: overTask.status } : t)
            );
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active } = event;
        setActiveId(null);

        const task = tasks.find(t => t.id === active.id);
        const originalTask = initialTasks.find(t => t.id === active.id);

        if (!task || !originalTask) return;

        if (task.status !== originalTask.status) {
            setIsUpdating(true);
            try {
                const result = await updateTaskStatus(task.id, task.status || 'todo');
                if (!result.success) {
                    // Revert on failure
                    setTasks(prev =>
                        prev.map(t => t.id === task.id ? { ...t, status: originalTask.status } : t)
                    );
                }
            } catch {
                setTasks(prev =>
                    prev.map(t => t.id === task.id ? { ...t, status: originalTask.status } : t)
                );
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const openNewTask = (status: TaskStatus = 'todo') => {
        setEditingTask(null);
        setDefaultStatus(status);
        setModalOpen(true);
    };

    const openEditTask = (task: TaskData) => {
        setEditingTask(task);
        setDefaultStatus(task.status as TaskStatus);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingTask(null);
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map(column => (
                        <KanbanColumnComponent
                            key={column.id}
                            column={column}
                            tasks={getTasksByStatus(column.id)}
                            onTaskClick={openEditTask}
                            onAddTask={() => openNewTask(column.id)}
                            showProjectBadge={showProjectBadge}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <TaskCard task={getActiveItem()!} isDragging showProject={showProjectBadge} />
                    ) : null}
                </DragOverlay>

                {isUpdating && (
                    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
                        <div className="bg-white px-6 py-3 shadow-lg border-2 border-zinc-900 text-sm font-bold uppercase tracking-wider">
                            Movendo tarefa...
                        </div>
                    </div>
                )}
            </DndContext>

            <TaskModal
                open={modalOpen}
                onOpenChange={handleModalClose}
                projectId={projectId}
                task={editingTask}
                defaultStatus={defaultStatus}
                projectMembers={projectMembers}
            />
        </>
    );
}

// ==========================================
// Kanban Column
// ==========================================

interface KanbanColumnProps {
    column: KanbanColumn;
    tasks: TaskData[];
    onTaskClick: (task: TaskData) => void;
    onAddTask: () => void;
    showProjectBadge?: boolean;
}

function KanbanColumnComponent({ column, tasks, onTaskClick, onAddTask, showProjectBadge }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useSortable({
        id: column.id,
        data: { type: 'column' },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-72 flex flex-col",
                "bg-white border-2 border-zinc-200",
                isOver && "ring-2 ring-primary ring-offset-2"
            )}
        >
            {/* Column Header */}
            <div className={cn("px-4 py-3 border-b-2 border-zinc-200", column.bgColor)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={column.color}>{column.icon}</span>
                        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                            {column.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs rounded-none font-bold">
                            {tasks.length}
                        </Badge>
                        <button
                            onClick={onAddTask}
                            className="h-6 w-6 flex items-center justify-center hover:bg-white/50 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5 text-zinc-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards Container */}
            <SortableContext
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto">
                    {tasks.length === 0 ? (
                        <div className="text-center py-8 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                            Nenhuma tarefa
                        </div>
                    ) : (
                        tasks.map(task => (
                            <SortableTaskCard
                                key={task.id}
                                task={task}
                                onClick={() => onTaskClick(task)}
                                showProject={showProjectBadge}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// ==========================================
// Sortable Task Card Wrapper
// ==========================================

interface SortableTaskCardProps {
    task: TaskData;
    onClick: () => void;
    showProject?: boolean;
}

function SortableTaskCard({ task, onClick, showProject }: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} onClick={onClick} isDragging={isDragging} showProject={showProject} />
        </div>
    );
}
