'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createMilitante, deleteMilitante, updateMilitante } from '@/app/actions/escola';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/input'; // Using Label from input.tsx or separate label component

type Militante = {
    id: string;
    nome: string;
    tipo: 'voluntario' | 'profissional';
    habilidades: string | null;
    disponibilidade: Record<string, string[]> | null;
};

export function MilitantList({ militantes }: { militantes: Militante[] }) {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();

    const turnos = ['manha', 'tarde', 'noite'];
    const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

    const handleAdd = () => {
        startTransition(async () => {
            await createMilitante({
                nome: 'Novo Militante',
                tipo: 'voluntario',
                habilidades: '',
                disponibilidade: {}
            });
        });
    };

    const handleUpdate = (id: string, field: string, value: any) => {
        startTransition(async () => {
            await updateMilitante(id, { [field]: value });
        });
    };

    const handleToggleDisponibilidade = (militante: Militante, dia: string, turno: string) => {
        const currentDisp = (militante.disponibilidade as Record<string, string[]>) || {};
        const diaTurnos = currentDisp[dia] || [];
        
        let newDiaTurnos;
        if (diaTurnos.includes(turno)) {
            newDiaTurnos = diaTurnos.filter(t => t !== turno);
        } else {
            newDiaTurnos = [...diaTurnos, turno];
        }

        const newDisp = { ...currentDisp, [dia]: newDiaTurnos };
        handleUpdate(militante.id, 'disponibilidade', newDisp);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza?')) {
            startTransition(async () => {
                await deleteMilitante(id);
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900">Cadastro de Militantes</h2>
                <Button
                    onClick={handleAdd}
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-md"
                    leftIcon={<Plus size={16} />}
                >
                    Adicionar Militante
                </Button>
            </div>

            {militantes.map((militante, idx) => (
                <Card key={militante.id} className="bg-white border-zinc-200">
                    <div className="flex justify-between items-center p-6 pb-2">
                        <h3 className="text-lg font-bold">Militante #{idx + 1}</h3>
                        <button
                            onClick={() => handleDelete(militante.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <Label>Nome</Label>
                                <Input
                                    value={militante.nome}
                                    onChange={(e) => handleUpdate(militante.id, 'nome', e.target.value)}
                                    placeholder="Nome do militante"
                                    className="bg-white"
                                />
                            </div>
                            <div>
                                <Label>Tipo</Label>
                                <select
                                    value={militante.tipo}
                                    onChange={(e) => handleUpdate(militante.id, 'tipo', e.target.value)}
                                    className="flex h-10 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="voluntario">Voluntário</option>
                                    <option value="profissional">Profissional</option>
                                </select>
                            </div>
                            <div>
                                <Label>Habilidades</Label>
                                <Input
                                    value={militante.habilidades || ''}
                                    onChange={(e) => handleUpdate(militante.id, 'habilidades', e.target.value)}
                                    placeholder="Ex: design, programação"
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="mb-4 block">Disponibilidade de Horários</Label>
                            <div className="overflow-hidden rounded-lg border border-zinc-200">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-zinc-100/50">
                                            <th className="p-3 text-left font-semibold text-zinc-900 w-1/4">Dia</th>
                                            {turnos.map(turno => (
                                                <th key={turno} className="p-3 text-center font-semibold text-zinc-900 capitalize w-1/4">{turno}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200">
                                        {diasSemana.map(dia => (
                                            <tr key={dia} className="bg-white hover:bg-zinc-50/50">
                                                <td className="p-3 font-medium text-zinc-900 capitalize">{dia}</td>
                                                {turnos.map(turno => (
                                                    <td key={turno} className="p-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={((militante.disponibilidade as Record<string, string[]>) || {})[dia]?.includes(turno) || false}
                                                            onChange={() => handleToggleDisponibilidade(militante, dia, turno)}
                                                            className="h-5 w-5 rounded border-zinc-300 text-red-600 focus:ring-red-600 cursor-pointer"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
