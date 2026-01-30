'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createProjeto, createTarefa } from '@/app/actions/escola';

type Projeto = {
    id: string;
    nome: string;
    cor: string;
    tarefas: Tarefa[];
};

type Tarefa = {
    id: string;
    nome: string;
    frequencia: string;
    dia: string | null;
    turno: string | null;
    projetoId: string;
};

export function ProjectBoard({ projetos }: { projetos: Projeto[] }) {
    const [isPending, startTransition] = React.useTransition();
    const [newProjectName, setNewProjectName] = React.useState('');
    const [newTaskName, setNewTaskName] = React.useState('');
    const [selectedProject, setSelectedProject] = React.useState<string>('');

    const handleAddProject = () => {
        if (!newProjectName) return;
        startTransition(async () => {
            await createProjeto({ nome: newProjectName, cor: '#' + Math.floor(Math.random()*16777215).toString(16) });
            setNewProjectName('');
        });
    };

    const handleAddTask = (projetoId: string) => {
        const name = prompt('Nome da tarefa:');
        if (!name) return;
        const freq = prompt('Frequencia (semanal, mensal...):') || 'semanal';
        
        startTransition(async () => {
            await createTarefa({
                projetoId,
                nome: name,
                frequencia: freq
            });
        });
    };

    return (
        <div>
            <div className="flex gap-4 mb-6">
                <input 
                    type="text" 
                    value={newProjectName} 
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="Novo Projeto"
                    className="border p-2 rounded"
                />
                <button 
                    onClick={handleAddProject}
                    disabled={isPending}
                    className="bg-primary text-white px-4 py-2 rounded"
                >
                    Criar Projeto
                </button>
            </div>

            {projetos.map(projeto => (
                <div key={projeto.id} className="mb-6 border p-4 rounded bg-white shadow-sm">
                    <div className="flex justify-between items-center border-b pb-2 mb-2" style={{ borderColor: projeto.cor }}>
                        <h3 
                            className="text-xl font-bold"
                            style={{ color: projeto.cor }}
                        >
                            {projeto.nome}
                        </h3>
                        <button
                            onClick={() => handleAddTask(projeto.id)}
                            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded flex items-center gap-1"
                        >
                            <Plus size={14} /> Nova Tarefa
                        </button>
                    </div>
                    <div className="grid gap-2">
                        {projeto.tarefas.map(tarefa => (
                            <div key={tarefa.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                                <div className="flex-1">
                                    <span className="font-semibold">{tarefa.nome}</span>
                                    <span className="text-sm text-gray-600 ml-3">
                                        ({tarefa.frequencia})
                                    </span>
                                </div>
                                {(tarefa.dia || tarefa.turno) && (
                                    <span className="text-sm bg-primary/20 px-2 py-1 rounded capitalize">
                                        {tarefa.dia} - {tarefa.turno}
                                    </span>
                                )}
                            </div>
                        ))}
                        {projeto.tarefas.length === 0 && (
                            <p className="text-gray-400 text-sm italic">Nenhuma tarefa cadastrada.</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
