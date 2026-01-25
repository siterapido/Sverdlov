'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, CheckSquare, Layers } from 'lucide-react';
import { WorkSchoolModal } from './WorkSchoolModal';
import { TaskModal } from './TaskModal';

interface ProjectManagementProps {
    project: any;
}

export function ProjectManagement({ project }: ProjectManagementProps) {
    const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState<any>(null);
    const [editingTask, setEditingTask] = useState<any>(null);

    const openNewSchool = () => {
        setEditingSchool(null);
        setIsSchoolModalOpen(true);
    };

    const openEditSchool = (school: any) => {
        setEditingSchool(school);
        setIsSchoolModalOpen(true);
    };

    const openNewTask = () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    const openEditTask = (task: any) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-zinc-400" />
                Escolas de Trabalho e Tarefas
            </h2>

            <div className="bg-white border border-zinc-200">
                {/* Work Schools List */}
                <div className="p-6 border-b border-zinc-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">Escolas de Trabalho</h3>
                        <Button variant="ghost" size="sm" onClick={openNewSchool} className="text-primary text-[10px] font-bold uppercase tracking-wider">
                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                        </Button>
                    </div>

                    {!project.workSchools || project.workSchools.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic">Nenhuma escola de trabalho criada.</p>
                    ) : (
                        <ul className="space-y-2">
                            {project.workSchools.map((school: any) => (
                                <li key={school.id} className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 group hover:border-zinc-300 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: school.cor || '#3b82f6' }} />
                                        <span className="text-sm font-bold text-zinc-700">{school.nome}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => openEditSchool(school)} className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                        <Edit2 className="w-3 h-3 text-zinc-500" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Tasks List */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">Tarefas do Projeto</h3>
                        <Button variant="ghost" size="sm" onClick={openNewTask} className="text-primary text-[10px] font-bold uppercase tracking-wider">
                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                        </Button>
                    </div>
                    {!project.tasks || project.tasks.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic">Nenhuma tarefa criada.</p>
                    ) : (
                        <ul className="space-y-2">
                            {project.tasks.map((task: any) => (
                                <li key={task.id} className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 group hover:border-zinc-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded-sm border ${task.status === 'done' ? 'bg-green-100 border-green-300' : 'bg-white border-zinc-300'}`}>
                                            <CheckSquare className={`w-3 h-3 ${task.status === 'done' ? 'text-green-600' : 'text-zinc-300'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${task.status === 'done' ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                        task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-[10px] text-zinc-400 font-medium">
                                                        Vence: {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => openEditTask(task)} className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                        <Edit2 className="w-3 h-3 text-zinc-500" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <WorkSchoolModal
                isOpen={isSchoolModalOpen}
                onClose={() => setIsSchoolModalOpen(false)}
                projectId={project.id}
                school={editingSchool}
            />

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                projectId={project.id}
                task={editingTask}
            />
        </div>
    );
}
