'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserMinus, Shield, MapPin, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface NucleusMember {
    id: string;
    fullName: string;
    status: string;
    militancyLevel: string;
}

interface NucleusDetail {
    id: string;
    name: string;
    type: string;
    state: string;
    city: string;
    status: string;
    members: NucleusMember[];
}

interface NucleusDetailClientProps {
    nucleus: NucleusDetail;
}

export function NucleusDetailClient({ nucleus }: NucleusDetailClientProps) {
    return (
        <div className="space-y-12">
            {/* Header / Info Card */}
            <div className="bg-white border-2 border-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary text-white rounded-none font-black uppercase tracking-widest text-[9px]">
                                {nucleus.type}
                            </Badge>
                            <Badge className="bg-zinc-100 text-zinc-500 rounded-none font-black uppercase tracking-widest text-[9px] border-none">
                                {nucleus.status}
                            </Badge>
                        </div>
                        <h2 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none">{nucleus.name}</h2>
                        <div className="flex items-center gap-2 text-zinc-400 mt-2">
                            <MapPin className="h-4 w-4" />
                            <span className="font-bold uppercase tracking-widest text-xs">{nucleus.city} / {nucleus.state}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4 border-t border-zinc-100">
                        <div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Membros</p>
                            <p className="text-2xl font-black text-zinc-900">{nucleus.members.length}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Militantes</p>
                            <p className="text-2xl font-black text-zinc-900">{nucleus.members.filter(m => m.militancyLevel === 'militant').length}</p>
                        </div>
                    </div>
                </div>

                <div className="flex md:flex-col gap-3 justify-end md:border-l-2 md:border-zinc-100 md:pl-8">
                    <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-none font-black uppercase tracking-widest text-[9px] h-10 px-6">
                        EDITAR NÚCLEO
                    </Button>
                    <Button variant="outline" className="border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[9px] h-10 px-6">
                        RELATÓRIO DO NÚCLEO
                    </Button>
                </div>
            </div>

            {/* Members List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Composição do Núcleo</h3>
                    <Button className="bg-primary text-white hover:brightness-110 rounded-none font-black uppercase tracking-widest text-[9px] h-8 px-4">
                        ADICIONAR FILIADO
                    </Button>
                </div>

                <div className="bg-white border-2 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-4">Filiado</th>
                                <th className="px-6 py-4">Militância</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-zinc-100">
                            {nucleus.members.map((member) => (
                                <tr key={member.id} className="hover:bg-zinc-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                                <Users className="h-4 w-4 text-zinc-400" />
                                            </div>
                                            <Link href={`/members/${member.id}`} className="font-black text-zinc-900 uppercase text-xs hover:text-primary transition-colors">
                                                {member.fullName}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-500">{member.militancyLevel}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge className="bg-zinc-100 text-zinc-600 rounded-none font-black uppercase tracking-widest text-[8px] border-none">
                                            {member.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-zinc-300 hover:text-red-500 transition-colors">
                                            <UserMinus className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {nucleus.members.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                                        Nenhum filiado vinculado a este núcleo.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
