'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createNucleus } from '@/app/actions/nuclei';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/input';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const BRAZILIAN_STATES = [
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

export default function NewNucleusPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        defaultValues: {
            type: 'territorial',
            status: 'in_formation',
        }
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createNucleus(data);
            if (res.success) {
                router.push('/members/nucleos');
            } else {
                setError(res.error || 'Erro ao criar núcleo');
            }
        } catch (err) {
            console.error(err);
            setError('Erro inesperado ao criar núcleo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Link href="/members/nucleos" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 font-bold uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" />
                Voltar
            </Link>

            <h1 className="text-3xl font-black uppercase text-zinc-900 mb-8 tracking-tighter">Novo Núcleo</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 border border-zinc-200 shadow-sm">
                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Nome do Núcleo *</Label>
                    <input
                        {...register('name', { required: 'Campo obrigatório' })}
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        placeholder="Núcleo Centro"
                    />
                    {errors.name && <span className="text-red-500 text-xs font-bold">Campo obrigatório</span>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Tipo *</Label>
                        <select
                            {...register('type', { required: true })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        >
                            <option value="territorial">Territorial</option>
                            <option value="thematic">Temático</option>
                        </select>
                        {errors.type && <span className="text-red-500 text-xs font-bold">Campo obrigatório</span>}
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Status *</Label>
                        <select
                            {...register('status', { required: true })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        >
                            <option value="dispersed">Disperso</option>
                            <option value="pre_nucleus">Pré-Núcleo</option>
                            <option value="in_formation">Em Formação</option>
                            <option value="active">Ativo</option>
                            <option value="consolidated">Consolidado</option>
                        </select>
                        {errors.status && <span className="text-red-500 text-xs font-bold">Campo obrigatório</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Estado *</Label>
                        <select
                            {...register('state', { required: true })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        >
                            <option value="">Selecione um estado</option>
                            {BRAZILIAN_STATES.map(state => (
                                <option key={state.code} value={state.code}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                        {errors.state && <span className="text-red-500 text-xs font-bold">Campo obrigatório</span>}
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Cidade *</Label>
                        <input
                            {...register('city', { required: true })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            placeholder="São Paulo"
                        />
                        {errors.city && <span className="text-red-500 text-xs font-bold">Campo obrigatório</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Zona</Label>
                    <input
                        {...register('zone')}
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        placeholder="Opcional - Ex: Zona Centro"
                    />
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest py-6 rounded-none"
                    >
                        {loading ? 'Criando...' : 'Criar Núcleo'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
