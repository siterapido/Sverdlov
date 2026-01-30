'use client';

import React from 'react';

type Props = {
    militantes: any[];
    projetos: any[];
    tarefas: any[];
    escalas: any[];
};

export function OverviewDashboard({ militantes, projetos, tarefas, escalas }: Props) {
    const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-100 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{militantes.length}</div>
                    <div className="text-sm text-gray-600">Militantes cadastrados</div>
                </div>
                <div className="bg-primary/20 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{tarefas.length}</div>
                    <div className="text-sm text-gray-600">Tarefas totais</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{escalas.length}</div>
                    <div className="text-sm text-gray-600">Escalas distribuídas</div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Escalas por Dia da Semana</h3>
                {diasSemana.map(dia => {
                    const escalasDia = escalas.filter(e => e.dia === dia);
                    return (
                        <div key={dia} className="mb-4">
                            <h4 className="font-semibold capitalize bg-gray-100 p-2 rounded">
                                {dia} ({escalasDia.length} escalas)
                            </h4>
                            {escalasDia.length > 0 ? (
                                <div className="ml-4 mt-2 space-y-2">
                                    {escalasDia.map(e => (
                                        <div key={e.id} className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded">
                                            <span 
                                                className="px-2 py-1 rounded text-white text-xs font-semibold"
                                                style={{ backgroundColor: e.tarefa?.projeto?.cor || '#ccc' }}
                                            >
                                                {e.tarefa?.projeto?.nome}
                                            </span>
                                            <span className="font-semibold">{e.tarefa?.nome}</span>
                                            <span className="capitalize text-gray-600">• {e.turno}</span>
                                            <span className="text-primary">→ {e.militante?.nome || 'Não atribuído'}</span>
                                            {e.observacao && (
                                                <span className="text-xs text-gray-500 italic">({e.observacao})</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="ml-4 mt-2 text-sm text-gray-500">Nenhuma escala definida</div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div>
                <h3 className="text-xl font-bold mb-3">Tarefas sem Militante Atribuído</h3>
                {tarefas.filter(t => !escalas.find(e => e.tarefaId === t.id)).map(tarefa => (
                    <div key={tarefa.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded mb-2">
                        <span 
                            className="px-2 py-1 rounded text-white text-xs font-semibold"
                            style={{ backgroundColor: tarefa.projeto?.cor }}
                        >
                            {tarefa.projeto?.nome}
                        </span>
                        <span className="font-semibold">{tarefa.nome}</span>
                        <span className="text-sm text-gray-600">({tarefa.frequencia})</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
