'use client';

import React, { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { MilitantList } from './MilitantList';
import { ProjectBoard } from './ProjectBoard';
import { ScheduleGrid } from './ScheduleGrid';
import { OverviewDashboard } from './OverviewDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

type Props = {
    initialData: {
        militantes: any[];
        projetos: any[];
        tarefas: any[];
        escalas: any[];
    }
};

export function EscolaContainer({ initialData }: Props) {
    // For export/import, we could implement client-side JSON handling like in the prototype.
    const exportarDados = () => {
        const dados = {
            militantes: initialData.militantes,
            escalas: initialData.escalas,
            projetos: initialData.projetos,
            tarefas: initialData.tarefas,
            dataExportacao: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escola-trabalho-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-zinc-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Escola de Trabalho</h1>
                        <p className="text-zinc-600">Organização de militantes, projetos e escalas - Unidade Popular</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button
                            variant="success"
                            onClick={exportarDados}
                            leftIcon={<Download size={16} />}
                        >
                            Exportar Dados
                        </Button>
                        <Button variant="secondary" disabled leftIcon={<Upload size={16} />}>
                            Importar Dados
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="militantes" className="w-full">
                <TabsList className="mb-4 bg-transparent border-b border-zinc-200 w-full justify-start h-12 p-0 gap-0">
                    <TabsTrigger value="militantes" className="px-6 h-full data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none bg-transparent">Militantes</TabsTrigger>
                    <TabsTrigger value="tarefas" className="px-6 h-full data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none bg-transparent">Tarefas por Projeto</TabsTrigger>
                    <TabsTrigger value="escalas" className="px-6 h-full data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none bg-transparent">Distribuição de Escalas</TabsTrigger>
                    <TabsTrigger value="visao-geral" className="px-6 h-full data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none bg-transparent">Visão Geral</TabsTrigger>
                </TabsList>

                <TabsContent value="militantes">
                    <MilitantList militantes={initialData.militantes} />
                </TabsContent>
                <TabsContent value="tarefas">
                    <ProjectBoard projetos={initialData.projetos} />
                </TabsContent>
                <TabsContent value="escalas">
                    <ScheduleGrid escalas={initialData.escalas} tarefas={initialData.tarefas} militantes={initialData.militantes} />
                </TabsContent>
                <TabsContent value="visao-geral">
                    <OverviewDashboard {...initialData} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
