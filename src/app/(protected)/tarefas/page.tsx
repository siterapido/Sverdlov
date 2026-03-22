'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllTasks, getProjects } from '@/app/actions/projects';
import { TaskKanbanBoard } from '@/components/projects/TaskKanbanBoard';
import { TaskFilters, applyTaskFilters, type TaskFilterState } from '@/components/projects/TaskFilters';
import { CheckSquare } from 'lucide-react';

export default function TarefasPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<TaskFilterState>({
        search: '',
        priority: [],
        category: [],
        assigneeIds: [],
    });
    const [selectedProject, setSelectedProject] = useState<string>('');

    useEffect(() => {
        const load = async () => {
            const [tasksResult, projectsResult] = await Promise.all([
                getAllTasks(),
                getProjects()
            ]);
            if (tasksResult.success) setTasks(tasksResult.data || []);
            if (projectsResult.success) setProjects(projectsResult.data || []);
            setLoading(false);
        };
        load();
    }, []);

    const filteredTasks = useMemo(() => {
        let result = tasks;
        if (selectedProject) {
            result = result.filter(t => t.projectId === selectedProject);
        }
        return applyTaskFilters(result, filters);
    }, [tasks, filters, selectedProject]);

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center">
                <div className="text-sm font-bold uppercase tracking-wider text-zinc-400">Carregando tarefas...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-8">
                <CheckSquare className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">Tarefas</h1>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-2">
                    Visão unificada de todos os projetos
                </span>
            </div>

            {/* Project filter */}
            <div className="mb-4">
                <select
                    value={selectedProject}
                    onChange={e => setSelectedProject(e.target.value)}
                    className="p-2 border-2 border-zinc-200 text-sm font-bold focus:border-zinc-900 focus:outline-none"
                >
                    <option value="">Todos os Projetos</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <TaskFilters onFilterChange={setFilters} />

            <TaskKanbanBoard
                tasks={filteredTasks}
                projectId={selectedProject || 'all'}
                showProjectBadge={!selectedProject}
            />
        </div>
    );
}
