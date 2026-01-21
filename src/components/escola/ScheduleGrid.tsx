'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createEscala, deleteEscala, updateEscala } from '@/app/actions/escola';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

type Escala = {
    id: string;
    tarefaId: string;
    militanteId: string | null;
    dia: string;
    turno: string;
    observacao: string | null;
    tarefa: {
        nome: string;
        projeto: {
            nome: string;
            cor: string;
        };
    };
    militante: {
        nome: string;
        tipo: string;
        habilidades: string | null;
        disponibilidade: unknown;
    } | null;
};

type Props = {
    escalas: Escala[];
    tarefas: any[];
    militantes: any[];
};

export function ScheduleGrid({ escalas, tarefas, militantes }: Props) {
    const [isPending, startTransition] = React.useTransition();
    const [showForm, setShowForm] = useState(false);
    const [newEscala, setNewEscala] = useState({ tarefaId: '', dia: '', turno: '', militanteId: '', observacao: '' });

    const turnos = ['manha', 'tarde', 'noite'];
    const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

    const handleSaveNew = async () => {
        if (!newEscala.tarefaId || !newEscala.dia || !newEscala.turno) {
            alert('Preencha tarefa, dia e turno');
            return;
        }
        startTransition(async () => {
            await createEscala({
                tarefaId: newEscala.tarefaId,
                dia: newEscala.dia,
                turno: newEscala.turno,
                militanteId: newEscala.militanteId || undefined,
                observacao: newEscala.observacao
            });
            setShowForm(false);
            setNewEscala({ tarefaId: '', dia: '', turno: '', militanteId: '', observacao: '' });
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteEscala(id);
        });
    };

    const handleUpdate = (id: string, field: string, value: any) => {
        startTransition(async () => {
            await updateEscala(id, { [field]: value });
        });
    };

    const getMilitantesDisponiveis = (dia: string, turno: string) => {
        return militantes.filter(m => {
            const disp = m.disponibilidade as Record<string, string[]> || {};
            return disp[dia]?.includes(turno);
        });
    };

    // Helper for select styling
    const selectClass = "flex h-10 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900">Distribuição de Escalas</h2>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-md"
                    leftIcon={<Plus size={16} />}
                >
                    Adicionar Escala
                </Button>
            </div>

            {showForm && (
                <Card className="bg-white border-zinc-200 border-2 border-red-100">
                    <div className="flex justify-between items-center p-6 pb-2">
                        <h3 className="text-lg font-bold text-red-600">Nova Escala</h3>
                    </div>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <Label>Tarefa</Label>
                                <select 
                                    className={selectClass}
                                    value={newEscala.tarefaId}
                                    onChange={e => setNewEscala({...newEscala, tarefaId: e.target.value})}
                                >
                                    <option value="">Selecione uma tarefa</option>
                                    {tarefas.map(t => (
                                        <option key={t.id} value={t.id}>{t.projeto.nome} - {t.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Dia</Label>
                                <select 
                                    className={selectClass}
                                    value={newEscala.dia}
                                    onChange={e => setNewEscala({...newEscala, dia: e.target.value})}
                                >
                                    <option value="">Selecione o dia</option>
                                    {diasSemana.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Turno</Label>
                                <select 
                                    className={selectClass}
                                    value={newEscala.turno}
                                    onChange={e => setNewEscala({...newEscala, turno: e.target.value})}
                                >
                                    <option value="">Selecione o turno</option>
                                    {turnos.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Militante</Label>
                                <select 
                                    className={selectClass}
                                    value={newEscala.militanteId}
                                    onChange={e => setNewEscala({...newEscala, militanteId: e.target.value})}
                                >
                                    <option value="">Selecione o militante</option>
                                    {(newEscala.dia && newEscala.turno ? getMilitantesDisponiveis(newEscala.dia, newEscala.turno) : militantes).map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.nome}
                                            {newEscala.dia && newEscala.turno && !getMilitantesDisponiveis(newEscala.dia, newEscala.turno).includes(m) ? ' (Indisponível)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label>Observações</Label>
                            <Input 
                                placeholder="Informações adicionais"
                                value={newEscala.observacao}
                                onChange={e => setNewEscala({...newEscala, observacao: e.target.value})}
                                className="bg-white"
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                             <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                             <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSaveNew}>Salvar</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {escalas.map((escala, idx) => (
                <Card key={escala.id} className="bg-white border-zinc-200">
                    <div className="flex justify-between items-center p-6 pb-2">
                        <h3 className="text-lg font-bold">Escala #{idx + 1}</h3>
                        <button
                            onClick={() => handleDelete(escala.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <Label>Tarefa</Label>
                                <div className={selectClass + " bg-zinc-50 flex items-center text-zinc-600"}>
                                    {escala.tarefa?.projeto?.nome} - {escala.tarefa?.nome}
                                </div>
                            </div>
                            <div>
                                <Label>Dia</Label>
                                <select 
                                    className={selectClass}
                                    value={escala.dia}
                                    onChange={(e) => handleUpdate(escala.id, 'dia', e.target.value)}
                                >
                                    <option value="">Selecione o dia</option>
                                    {diasSemana.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Turno</Label>
                                <select 
                                    className={selectClass}
                                    value={escala.turno}
                                    onChange={(e) => handleUpdate(escala.id, 'turno', e.target.value)}
                                >
                                    <option value="">Selecione o turno</option>
                                    {turnos.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Militante</Label>
                                <select
                                    value={escala.militanteId || ''}
                                    onChange={(e) => handleUpdate(escala.id, 'militanteId', e.target.value || null)}
                                    className={selectClass}
                                >
                                    <option value="">Selecione o militante</option>
                                    {getMilitantesDisponiveis(escala.dia, escala.turno).map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.nome}
                                        </option>
                                    ))}
                                    <optgroup label="Outros (Indisponíveis/Geral)">
                                        {militantes
                                            .filter(m => !getMilitantesDisponiveis(escala.dia, escala.turno).find(d => d.id === m.id))
                                            .map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.nome} *
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label>Observações</Label>
                            <Input
                                value={escala.observacao || ''}
                                onChange={(e) => handleUpdate(escala.id, 'observacao', e.target.value)}
                                placeholder="Informações adicionais"
                                className="bg-white"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
