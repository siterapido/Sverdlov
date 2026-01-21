'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/app/actions/users';
import { getNuclei } from '@/app/actions/nuclei';
import { updateMemberOrg } from '@/app/actions/members';
import { Shield, Users, Save, Loader2, Check, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface MemberOrgTabProps {
    memberId: string;
    initialData: {
        nucleusId: string | null;
        politicalResponsibleId: string | null;
        requestDate: Date;
        approvalDate: Date | null;
        affiliationDate: string | null;
        militancyLevel: string;
    };
}

export function MemberOrgTab({ memberId, initialData }: MemberOrgTabProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [nuclei, setNuclei] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [nucleusId, setNucleusId] = useState(initialData.nucleusId || '');
    const [responsibleId, setResponsibleId] = useState(initialData.politicalResponsibleId || '');
    const [militancyLevel, setMilitancyLevel] = useState(initialData.militancyLevel);

    useEffect(() => {
        const fetchData = async () => {
            const [usersRes, nucleiRes] = await Promise.all([
                getUsers(),
                getNuclei()
            ]);
            
            if (usersRes.success) setUsers(usersRes.data || []);
            if (nucleiRes.success) setNuclei(nucleiRes.data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateMemberOrg(memberId, {
                nucleusId: nucleusId || null,
                politicalResponsibleId: responsibleId || null,
                militancyLevel: militancyLevel as any
            });
            if (result.success) {
                alert('Organização atualizada com sucesso');
            } else {
                alert(result.error);
            }
        } catch (err) {
            alert('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Carregando dados organizacionais...</div>;

    return (
        <div className="space-y-12">
            <div className="border-2 border-zinc-900 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="px-8 py-5 border-b-2 border-zinc-900 bg-zinc-900 flex justify-between items-center">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Vínculos e Responsabilidades</h3>
                    <Button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-none font-black uppercase tracking-widest text-[9px] h-7 px-3"
                    >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                        SALVAR ALTERAÇÕES
                    </Button>
                </div>
                
                <div className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-primary" />
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Núcleo / Unidade de Base</label>
                            </div>
                            <select 
                                value={nucleusId}
                                onChange={(e) => setNucleusId(e.target.value)}
                                className="notion-input w-full font-bold uppercase tracking-tight text-sm"
                            >
                                <option value="">Nenhum núcleo atribuído</option>
                                {nuclei.map(n => (
                                    <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Responsável Político</label>
                            </div>
                            <select 
                                value={responsibleId}
                                onChange={(e) => setResponsibleId(e.target.value)}
                                className="notion-input w-full font-bold uppercase tracking-tight text-sm"
                            >
                                <option value="">Nenhum responsável</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-primary" />
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nível de Militância</label>
                            </div>
                            <select 
                                value={militancyLevel}
                                onChange={(e) => setMilitancyLevel(e.target.value)}
                                className="notion-input w-full font-bold uppercase tracking-tight text-sm"
                            >
                                <option value="supporter">Apoiador (Supporter)</option>
                                <option value="militant">Militante (Militant)</option>
                                <option value="leader">Quadro / Liderança (Leader)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline / Histórico */}
            <div className="border-2 border-zinc-900 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="px-8 py-5 border-b-2 border-zinc-900 bg-zinc-100">
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em]">Linha do Tempo Estatutária</h3>
                </div>
                <div className="p-10">
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                        {/* Solicitação */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-none bg-white border-2 border-zinc-900 text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <CalendarIcon className="h-4 w-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-zinc-50 border border-zinc-100">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Solicitação Recebida</div>
                                    <time className="font-bold text-zinc-400 text-[9px] uppercase tracking-tighter">
                                        {format(new Date(initialData.requestDate), "dd/MM/yyyy")}
                                    </time>
                                </div>
                                <div className="text-zinc-500 text-xs font-medium">Interesse manifestado via formulário público.</div>
                            </div>
                        </div>

                        {/* Aprovação */}
                        {initialData.approvalDate && (
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-none bg-primary border-2 border-zinc-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <Check className="h-4 w-4" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-zinc-50 border border-zinc-100">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-black text-primary uppercase text-[10px] tracking-widest">Aprovação de Ingresso</div>
                                        <time className="font-bold text-zinc-400 text-[9px] uppercase tracking-tighter">
                                            {format(new Date(initialData.approvalDate), "dd/MM/yyyy")}
                                        </time>
                                    </div>
                                    <div className="text-zinc-500 text-xs font-medium">Filiado aprovado para iniciar formação política.</div>
                                </div>
                            </div>
                        )}

                        {/* Afiliação */}
                        {initialData.affiliationDate && (
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-none bg-zinc-900 border-2 border-zinc-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-zinc-50 border border-zinc-100">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Filiação Estatutária</div>
                                        <time className="font-bold text-zinc-400 text-[9px] uppercase tracking-tighter">
                                            {format(new Date(initialData.affiliationDate), "dd/MM/yyyy")}
                                        </time>
                                    </div>
                                    <div className="text-zinc-500 text-xs font-medium">Registro formalizado nos órgãos eleitorais.</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
