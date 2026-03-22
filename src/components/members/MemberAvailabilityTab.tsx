'use client';

import { useState, useEffect } from 'react';
import { ShiftAvailabilityGrid, cellsToAvailability, availabilityToCells } from '@/components/schedules/ShiftAvailabilityGrid';
import { getShiftAvailability, saveShiftAvailability } from '@/app/actions/availability';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';

interface MemberAvailabilityTabProps {
    memberId: string;
}

export function MemberAvailabilityTab({ memberId }: MemberAvailabilityTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [initialCells, setInitialCells] = useState<any[]>([]);
    const [currentCells, setCurrentCells] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            const result = await getShiftAvailability(memberId);
            if (result.success && result.data) {
                const cells = availabilityToCells(result.data);
                setInitialCells(cells);
            }
            setLoading(false);
        };
        load();
    }, [memberId]);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const shifts = cellsToAvailability(currentCells, memberId);
            const result = await saveShiftAvailability(memberId, shifts);
            if (result.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="py-8 text-center text-sm text-zinc-400">Carregando disponibilidade...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                    Marque os turnos em que o membro está disponível para tarefas e escalas.
                </p>
                <ShiftAvailabilityGrid
                    value={initialCells}
                    onChange={(cells) => setCurrentCells(cells)}
                />
            </div>

            <div className="flex items-center gap-3">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-zinc-900 text-white rounded-none font-bold uppercase tracking-wider hover:bg-zinc-800"
                >
                    {saving ? (
                        'Salvando...'
                    ) : saved ? (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Salvo!
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Disponibilidade
                        </>
                    )}
                </Button>
                {saved && (
                    <span className="text-xs font-bold text-emerald-600 uppercase">Disponibilidade atualizada</span>
                )}
            </div>
        </div>
    );
}
