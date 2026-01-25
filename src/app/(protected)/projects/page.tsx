import React from 'react';
import Link from 'next/link';
import { getProjects } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, Plus, Calendar, Target } from 'lucide-react';

export default async function ProjectsPage() {
    const { data: projects } = await getProjects();

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-primary flex items-center justify-center">
                            <FolderKanban className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Gestão Estratégica</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                        Projetos
                    </h1>
                    <p className="text-zinc-500 font-medium text-sm">
                        Gerenciamento de iniciativas, objetivos e escolas de trabalho.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/projects/new">
                        <Button variant="default" size="sm" className="bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(155,17,30,0.1)] transition-all" leftIcon={<Plus className="w-4 h-4" />}>
                            NOVO PROJETO
                        </Button>
                    </Link>
                </div>
            </div>

            {/* List */}
            {!projects || projects.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                    <div className="w-16 h-16 mx-auto mb-6 bg-white border-2 border-zinc-100 flex items-center justify-center">
                        <FolderKanban className="w-8 h-8 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-2">
                        Nenhum projeto encontrado
                    </h3>
                    <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                        Crie seu primeiro projeto para começar a gerenciar tarefas e objetivos.
                    </p>
                    <Link href="/projects/new">
                        <Button variant="outline" className="text-xs font-bold uppercase tracking-widest">
                            Criar Projeto
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: any) => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                            <div className="group h-full bg-white border border-zinc-200 hover:border-primary/50 hover:shadow-lg transition-all p-6 flex flex-col cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="outline" className="rounded-none font-bold uppercase text-[10px] tracking-wider border-zinc-200 text-zinc-500">
                                        {project.type || 'Geral'}
                                    </Badge>
                                    <Badge className={`rounded-none font-bold uppercase text-[10px] tracking-wider ${project.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                            project.status === 'completed' ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' :
                                                'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                        }`}>
                                        {project.status === 'planned' ? 'Planejado' :
                                            project.status === 'active' ? 'Ativo' :
                                                project.status === 'completed' ? 'Concluído' : project.status}
                                    </Badge>
                                </div>

                                <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-primary transition-colors">
                                    {project.name}
                                </h3>

                                <p className="text-sm text-zinc-500 line-clamp-2 mb-6 flex-1">
                                    {project.description || "Sem descrição definida."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        <Target className="w-4 h-4" />
                                        <span>{project.goals?.length || 0} Metas</span>
                                    </div>
                                    {project.nucleus && (
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider truncate max-w-[120px]">
                                            {project.nucleus.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
