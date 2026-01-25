'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNuclei, createNucleus, updateNucleus } from '@/app/actions/nuclei';
import { Plus, Users, MapPin, Search, Filter, Layers } from 'lucide-react';

interface Nucleus {
    id: string;
    name: string;
    type: 'territorial' | 'thematic';
    state: string;
    city: string;
    status: string;
    memberCount: number;
}

interface NucleiClientProps {
    initialNuclei: Nucleus[];
}

export function NucleiClient({ initialNuclei }: NucleiClientProps) {
    const [nuclei, setNuclei] = useState(initialNuclei);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'territorial' | 'thematic'>('all');

    const filteredNuclei = nuclei.filter(n => {
        const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
            n.city.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || n.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50 border-2 border-zinc-900 p-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou cidade..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="notion-input w-full pl-10 h-10 bg-white"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex border-2 border-zinc-900 overflow-hidden">
                        <button
                            onClick={() => setTypeFilter('all')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${typeFilter === 'all' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'}`}
                        >
                            TUDO
                        </button>
                        <button
                            onClick={() => setTypeFilter('territorial')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-l-2 border-zinc-900 transition-colors ${typeFilter === 'territorial' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'}`}
                        >
                            TERRITORIAL
                        </button>
                        <button
                            onClick={() => setTypeFilter('thematic')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-l-2 border-zinc-900 transition-colors ${typeFilter === 'thematic' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'}`}
                        >
                            TEMÁTICO
                        </button>
                    </div>
                </div>
            </div>

            {/* Nuclei Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNuclei.map((n) => (
                    <div key={n.id} className="bg-white border-2 border-zinc-900 p-6 flex flex-col justify-between group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start justify-between">
                                <div className="h-10 w-10 bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                    <Layers className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                </div>
                                <Badge className="bg-zinc-100 text-zinc-500 rounded-none font-black uppercase tracking-widest text-[8px] border-none px-2 py-0.5">
                                    {n.status}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900 leading-none mb-1">
                                    {n.name}
                                </h3>
                                <div className="flex items-center gap-1 text-zinc-400">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{n.city} / {n.state}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">{n.memberCount} FILIADOS</span>
                                </div>
                                <div className="h-4 w-[1px] bg-zinc-100" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{n.type}</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[9px] h-9 transition-all hover:bg-zinc-900 hover:text-white"
                            asChild
                        >
                            <a href={`/members/nucleos/${n.id}`}>GERENCIAR NÚCLEO</a>
                        </Button>
                    </div>
                ))}

                {/* Create New Card */}
                <button className="bg-zinc-50 border-2 border-dashed border-zinc-300 p-6 flex flex-col items-center justify-center gap-4 transition-colors hover:bg-zinc-100 hover:border-zinc-400 min-h-[220px]">
                    <div className="h-12 w-12 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-zinc-300" />
                    </div>
                    <div className="text-center">
                        <p className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Novo Núcleo</p>
                        <p className="text-[9px] font-bold text-zinc-300 uppercase mt-1">Clique para expandir a organização</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
