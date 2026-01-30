'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { createProjectTask, updateProjectTask, deleteProjectTask } from '@/app/actions/projects';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    task?: any; // If editing
}

export function TaskModal({ isOpen, onClose, projectId, task }: TaskModalProps) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'medium');
    const [status, setStatus] = useState(task?.status || 'todo');
    const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!title) return;
        setLoading(true);
        try {
            const data = {
                title,
                description,
                priority,
                status,
                dueDate,
                projectId
            };

            if (task) {
                await updateProjectTask(task.id, data);
            } else {
                await createProjectTask(data);
            }
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        setLoading(true);
        try {
            await deleteProjectTask(task.id);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-md p-6 border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"
            >
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tight">
                        {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </h2>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Título</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-2 border border-zinc-300"
                            placeholder="Título da tarefa..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full p-2 border border-zinc-300 h-20 resize-none"
                            placeholder="Detalhes..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Prioridade</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border border-zinc-300">
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border border-zinc-300">
                                <option value="todo">A Fazer</option>
                                <option value="in_progress">Em Andamento</option>
                                <option value="review">Revisão</option>
                                <option value="done">Concluída</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Data de Vencimento</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="w-full p-2 border border-zinc-300"
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button onClick={handleSubmit} disabled={loading} className="flex-1 rounded-none font-black uppercase bg-primary text-white">
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                        {task && (
                            <Button onClick={handleDelete} disabled={loading} variant="destructive" className="rounded-none">
                                Excluir
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
