'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
    onFilterChange: (filters: TaskFilterState) => void;
    members?: { id: string; fullName: string }[];
}

export interface TaskFilterState {
    search: string;
    priority: string[];
    category: string[];
    assigneeIds: string[];
    projectId?: string;
}

const priorities = [
    { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'medium', label: 'Média', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 'low', label: 'Baixa', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const categories = [
    { value: 'vigilancia', label: 'Vigilância' },
    { value: 'formacao', label: 'Formação' },
    { value: 'agitacao', label: 'Agitação' },
    { value: 'administrativa', label: 'Admin' },
    { value: 'financeira', label: 'Financeira' },
    { value: 'outras', label: 'Outras' },
];

export function TaskFilters({ onFilterChange, members }: TaskFiltersProps) {
    const [filters, setFilters] = useState<TaskFilterState>({
        search: '',
        priority: [],
        category: [],
        assigneeIds: [],
    });

    const updateFilters = (update: Partial<TaskFilterState>) => {
        const newFilters = { ...filters, ...update };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const toggleArrayFilter = (key: 'priority' | 'category' | 'assigneeIds', value: string) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        updateFilters({ [key]: updated });
    };

    const hasFilters = filters.search || filters.priority.length > 0 || filters.category.length > 0 || filters.assigneeIds.length > 0;

    const clearFilters = () => {
        const empty = { search: '', priority: [], category: [], assigneeIds: [] };
        setFilters(empty);
        onFilterChange(empty);
    };

    return (
        <div className="space-y-3 mb-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Buscar tarefas..."
                    value={filters.search}
                    onChange={e => updateFilters({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border-2 border-zinc-200 text-sm font-medium focus:border-zinc-900 focus:outline-none transition-colors"
                />
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 items-center">
                <Filter className="h-4 w-4 text-zinc-400" />

                {/* Priority filters */}
                {priorities.map(p => (
                    <button
                        key={p.value}
                        onClick={() => toggleArrayFilter('priority', p.value)}
                        className={cn(
                            "text-[10px] font-bold uppercase px-2 py-1 border-2 transition-all",
                            filters.priority.includes(p.value)
                                ? p.color + ' border-current'
                                : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
                        )}
                    >
                        {p.label}
                    </button>
                ))}

                <span className="text-zinc-300">|</span>

                {/* Category filters */}
                {categories.map(c => (
                    <button
                        key={c.value}
                        onClick={() => toggleArrayFilter('category', c.value)}
                        className={cn(
                            "text-[10px] font-bold uppercase px-2 py-1 border-2 transition-all",
                            filters.category.includes(c.value)
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
                        )}
                    >
                        {c.label}
                    </button>
                ))}

                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-[10px] font-bold uppercase px-2 py-1 text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                        <X className="h-3 w-3" />
                        Limpar
                    </button>
                )}
            </div>
        </div>
    );
}

export function applyTaskFilters(tasks: any[], filters: TaskFilterState) {
    return tasks.filter(task => {
        // Search
        if (filters.search) {
            const search = filters.search.toLowerCase();
            if (!task.title.toLowerCase().includes(search) &&
                !(task.description || '').toLowerCase().includes(search)) {
                return false;
            }
        }

        // Priority
        if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
            return false;
        }

        // Category
        if (filters.category.length > 0 && !filters.category.includes(task.category || 'outras')) {
            return false;
        }

        // Assignees
        if (filters.assigneeIds.length > 0) {
            const taskAssigneeIds = (task.assignees || []).map((a: any) => a.memberId);
            if (!filters.assigneeIds.some(id => taskAssigneeIds.includes(id))) {
                return false;
            }
        }

        // Project
        if (filters.projectId && task.projectId !== filters.projectId) {
            return false;
        }

        return true;
    });
}
