'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { createWorkSchool, updateWorkSchool, deleteWorkSchool } from '@/app/actions/projects';

interface WorkSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    school?: any; // If editing
}

export function WorkSchoolModal({ isOpen, onClose, projectId, school }: WorkSchoolModalProps) {
    const [name, setName] = useState(school?.nome || '');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!name) return;
        setLoading(true);
        try {
            if (school) {
                await updateWorkSchool(school.id, name);
            } else {
                await createWorkSchool(projectId, name);
            }
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta escola?')) return;
        setLoading(true);
        try {
            await deleteWorkSchool(school.id);
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
                className="bg-white w-full max-w-sm p-6 border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"
            >
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tight">
                        {school ? 'Editar Escola' : 'Nova Escola'}
                    </h2>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-2 border border-zinc-300"
                            placeholder="Ex: Formação Política"
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button onClick={handleSubmit} disabled={loading} className="flex-1 rounded-none font-black uppercase bg-primary text-white">
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                        {school && (
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
