'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getNuclei } from '@/app/actions/nuclei';
import { createProject } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
    const router = useRouter();
    const [nuclei, setNuclei] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        getNuclei().then(res => {
            if (res.success) setNuclei(res.data || []);
        });
    }, []);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await createProject(data);
            if (res.success) {
                router.push('/projects');
            } else {
                alert('Erro ao criar projeto');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Link href="/projects" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 font-bold uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" />
                Voltar
            </Link>

            <h1 className="text-3xl font-black uppercase text-zinc-900 mb-8 tracking-tighter">Novo Projeto</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 border border-zinc-200 shadow-sm">
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Nome do Projeto</Label>
                    <input
                        {...register('name', { required: true })}
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                    />
                    {errors.name && <span className="text-red-500 text-xs font-bold">Campo obrigatório</span>}
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Descrição</Label>
                    <textarea
                        {...register('description')}
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none h-32 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Núcleo Responsável</Label>
                        <select
                            {...register('nucleusId', { required: true })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        >
                            <option value="">Selecione um Núcleo</option>
                            {nuclei.map(n => (
                                <option key={n.id} value={n.id}>{n.name}</option>
                            ))}
                        </select>
                        {errors.nucleusId && <span className="text-red-500 text-xs font-bold">Campo obrigatório</span>}
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Status</Label>
                        <select
                            {...register('status')}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        >
                            <option value="planned">Planejado</option>
                            <option value="active">Ativo</option>
                            <option value="paused">Pausado</option>
                            <option value="completed">Concluído</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Data de Início</Label>
                        <input
                            type="date"
                            {...register('startDate')}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Data de Término</Label>
                        <input
                            type="date"
                            {...register('endDate')}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Objetivos (Markdown)</Label>
                    <textarea
                        {...register('objectives')}
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none h-32 resize-none"
                        placeholder="- Objetivo 1..."
                    />
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest py-6 rounded-none"
                    >
                        {loading ? 'Criando...' : 'Criar Projeto'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
