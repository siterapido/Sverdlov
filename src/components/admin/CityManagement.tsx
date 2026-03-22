'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCity, deleteCity } from '@/app/actions/cities';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

const STATES = [
    { code: 'AC', name: 'Acre' },
    { code: 'AL', name: 'Alagoas' },
    { code: 'AP', name: 'Amapá' },
    { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' },
    { code: 'CE', name: 'Ceará' },
    { code: 'DF', name: 'Distrito Federal' },
    { code: 'ES', name: 'Espírito Santo' },
    { code: 'GO', name: 'Goiás' },
    { code: 'MA', name: 'Maranhão' },
    { code: 'MT', name: 'Mato Grosso' },
    { code: 'MS', name: 'Mato Grosso do Sul' },
    { code: 'MG', name: 'Minas Gerais' },
    { code: 'PA', name: 'Pará' },
    { code: 'PB', name: 'Paraíba' },
    { code: 'PR', name: 'Paraná' },
    { code: 'PE', name: 'Pernambuco' },
    { code: 'PI', name: 'Piauí' },
    { code: 'RJ', name: 'Rio de Janeiro' },
    { code: 'RN', name: 'Rio Grande do Norte' },
    { code: 'RS', name: 'Rio Grande do Sul' },
    { code: 'RO', name: 'Rondônia' },
    { code: 'RR', name: 'Roraima' },
    { code: 'SC', name: 'Santa Catarina' },
    { code: 'SP', name: 'São Paulo' },
    { code: 'SE', name: 'Sergipe' },
    { code: 'TO', name: 'Tocantins' },
];

interface City {
    id: string;
    name: string;
    state: string;
    createdAt: Date;
}

export default function CityManagement({ initialCities }: { initialCities: City[] }) {
    const { addToast } = useToast();
    const router = useRouter();
    const [selectedState, setSelectedState] = useState('');
    const [cityName, setCityName] = useState('');
    const [loading, setLoading] = useState(false);

    // Group cities by state
    const citiesByState: Record<string, City[]> = {};
    for (const city of initialCities) {
        if (!citiesByState[city.state]) citiesByState[city.state] = [];
        citiesByState[city.state].push(city);
    }

    // Filter: show only selected state or all
    const statesToShow = selectedState
        ? STATES.filter(s => s.code === selectedState)
        : STATES.filter(s => citiesByState[s.code]?.length);

    const handleAddCity = async () => {
        if (!selectedState || !cityName.trim()) {
            addToast({ title: 'Selecione um estado e informe o nome da cidade', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const result = await createCity({ name: cityName.trim(), state: selectedState });
            if (result.success) {
                addToast({ title: 'Cidade cadastrada com sucesso', type: 'success' });
                setCityName('');
                router.refresh();
            } else {
                addToast({ title: result.error || 'Erro ao cadastrar cidade', type: 'error' });
            }
        } catch {
            addToast({ title: 'Erro ao cadastrar cidade', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cityId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta cidade?')) return;
        try {
            const result = await deleteCity(cityId);
            if (result.success) {
                addToast({ title: 'Cidade excluída', type: 'success' });
                router.refresh();
            } else {
                addToast({ title: result.error || 'Erro ao excluir', type: 'error' });
            }
        } catch {
            addToast({ title: 'Erro ao excluir cidade', type: 'error' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cidades por Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Add city form */}
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-zinc-50 border border-zinc-200">
                    <select
                        className="flex h-10 rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                    >
                        <option value="">Selecione o Estado...</option>
                        {STATES.map(s => (
                            <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                        ))}
                    </select>
                    <Input
                        placeholder="Nome da Cidade"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                    />
                    <Button onClick={handleAddCity} disabled={loading || !selectedState || !cityName.trim()}>
                        <Plus className="h-4 w-4 mr-1" />
                        {loading ? 'Salvando...' : 'Adicionar'}
                    </Button>
                </div>

                {/* Cities list grouped by state */}
                {statesToShow.length === 0 && !selectedState && (
                    <p className="text-center text-zinc-500 py-8">
                        Nenhuma cidade cadastrada. Selecione um estado e adicione cidades acima.
                    </p>
                )}

                {selectedState && !citiesByState[selectedState]?.length && (
                    <p className="text-center text-zinc-400 py-4 text-sm">
                        Nenhuma cidade cadastrada para {STATES.find(s => s.code === selectedState)?.name || selectedState}.
                    </p>
                )}

                {statesToShow.map(state => {
                    const stateCities = citiesByState[state.code] || [];
                    if (stateCities.length === 0) return null;

                    return (
                        <div key={state.code} className="border border-zinc-200">
                            <div className="bg-zinc-100 px-4 py-2 font-bold text-sm uppercase tracking-wider text-zinc-700">
                                {state.code} - {state.name}
                                <span className="ml-2 text-zinc-400 font-normal normal-case">
                                    ({stateCities.length} {stateCities.length === 1 ? 'cidade' : 'cidades'})
                                </span>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {stateCities.map(city => (
                                    <div key={city.id} className="flex items-center justify-between px-4 py-2 hover:bg-zinc-50">
                                        <span className="text-sm">{city.name}</span>
                                        <button
                                            onClick={() => handleDelete(city.id)}
                                            className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                            title="Excluir cidade"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
