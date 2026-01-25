import React from 'react';
import { getProjectById } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Target, Calendar, CheckSquare, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProjectManagement } from '@/components/projects/ProjectManagement';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: project, success } = await getProjectById(id);

    if (!success || !project) {
        return <div className="p-10 text-center">Projeto não encontrado</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Link href="/projects" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 font-bold uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Projetos
            </Link>

            <div className="bg-white border border-zinc-200 shadow-sm p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex gap-2 mb-2">
                            <Badge variant="outline" className="rounded-none font-bold uppercase text-[10px] tracking-wider border-zinc-200 text-zinc-500">
                                {project.type || 'Geral'}
                            </Badge>
                            <Badge className="rounded-none font-bold uppercase text-[10px] tracking-wider bg-black text-white">
                                {project.status}
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black uppercase text-zinc-900 tracking-tighter mb-4">{project.name}</h1>
                        <p className="text-zinc-600 max-w-2xl">{project.description}</p>
                    </div>
                </div>

                <div className="flex gap-8 border-t border-zinc-100 pt-6">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Metas Definidas: {(project.goals as any[])?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                            Início: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Não definido'}
                        </span>
                    </div>
                    {project.nucleus && (
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Núcleo: {project.nucleus.name}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tasks & Goals */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Target className="w-5 h-5 text-zinc-400" />
                        Objetivos e Metas
                    </h2>
                    <div className="bg-white p-6 border border-zinc-200">
                        {project.objectives && (
                            <div className="prose prose-sm mb-6">
                                <h3 className="text-xs font-black uppercase tracking-wider mb-2">Objetivos Estratégicos</h3>
                                <p>{project.objectives}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider mb-2">Metas Quantitativas</h3>
                            {(!project.goals || (project.goals as any[]).length === 0) && (
                                <p className="text-xs text-zinc-400 italic">Nenhuma meta definida.</p>
                            )}
                            {/* Goals Rendering Placeholder */}
                        </div>
                    </div>
                </div>

                {/* Work Schools / Tasks */}
                <ProjectManagement project={project} />
            </div>
        </div>
    );
}
