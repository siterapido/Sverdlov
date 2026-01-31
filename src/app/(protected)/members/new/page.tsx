'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createMemberAction } from '@/app/actions/members';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/input';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
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

export default function NewMemberPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        defaultValues: {
            interest: 'support',
        }
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createMemberAction(data);
            if (res.success) {
                router.push('/members');
            } else {
                setError(res.error || 'Erro ao criar membro');
            }
        } catch (err) {
            console.error(err);
            setError('Erro inesperado ao criar membro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Link href="/members" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8 font-bold uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" />
                Voltar
            </Link>

            <h1 className="text-3xl font-black uppercase text-zinc-900 mb-8 tracking-tighter">Novo Membro</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 border border-zinc-200 shadow-sm">
                {/* Personal Information */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold uppercase text-zinc-900 border-b pb-2">Informações Pessoais</h2>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Nome Completo *</Label>
                        <input
                            {...register('fullName', { required: 'Campo obrigatório' })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            placeholder="João da Silva"
                        />
                        {errors.fullName && <span className="text-red-500 text-xs font-bold">{errors.fullName.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Nome Social</Label>
                        <input
                            {...register('socialName')}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            placeholder="Opcional"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">CPF *</Label>
                            <input
                                {...register('cpf', { required: 'Campo obrigatório' })}
                                placeholder="000.000.000-00"
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            />
                            {errors.cpf && <span className="text-red-500 text-xs font-bold">{errors.cpf.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Data de Nascimento *</Label>
                            <input
                                type="date"
                                {...register('dateOfBirth', { required: 'Campo obrigatório' })}
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            />
                            {errors.dateOfBirth && <span className="text-red-500 text-xs font-bold">{errors.dateOfBirth.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Gênero</Label>
                            <select
                                {...register('gender')}
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            >
                                <option value="">Selecione...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                                <option value="NB">Não-binário</option>
                                <option value="Other">Outro</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Título de Eleitor</Label>
                            <input
                                {...register('voterTitle')}
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                                placeholder="Opcional"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold uppercase text-zinc-900 border-b pb-2">Contato</h2>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Email *</Label>
                        <input
                            type="email"
                            {...register('email', { required: 'Campo obrigatório' })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            placeholder="email@example.com"
                        />
                        {errors.email && <span className="text-red-500 text-xs font-bold">{errors.email.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Telefone *</Label>
                        <input
                            {...register('phone', { required: 'Campo obrigatório' })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            placeholder="(11) 99999-9999"
                        />
                        {errors.phone && <span className="text-red-500 text-xs font-bold">{errors.phone.message}</span>}
                    </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold uppercase text-zinc-900 border-b pb-2">Localização</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Estado *</Label>
                            <select
                                {...register('state', { required: 'Campo obrigatório' })}
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            >
                                <option value="">Selecione um estado</option>
                                {BRAZILIAN_STATES.map(state => (
                                    <option key={state.code} value={state.code}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            {errors.state && <span className="text-red-500 text-xs font-bold">{errors.state.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Cidade *</Label>
                            <input
                                {...register('city', { required: 'Campo obrigatório' })}
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                                placeholder="São Paulo"
                            />
                            {errors.city && <span className="text-red-500 text-xs font-bold">{errors.city.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Bairro *</Label>
                            <input
                                {...register('neighborhood', { required: 'Campo obrigatório' })}
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                                placeholder="Centro"
                            />
                            {errors.neighborhood && <span className="text-red-500 text-xs font-bold">{errors.neighborhood.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Zona</Label>
                            <input
                                {...register('zone')}
                                className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                                placeholder="Opcional"
                            />
                        </div>
                    </div>
                </div>

                {/* Interest */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold uppercase text-zinc-900 border-b pb-2">Interesse</h2>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Como você conheceu a UP? *</Label>
                        <input
                            {...register('howDidYouHear')}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                            placeholder="Através de um amigo, redes sociais, etc."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-black tracking-wider text-zinc-500">Tipo de Interesse *</Label>
                        <select
                            {...register('interest', { required: 'Campo obrigatório' })}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 focus:border-primary outline-none"
                        >
                            <option value="support">Apoio</option>
                            <option value="militancy">Militância</option>
                            <option value="education">Educação/Formação</option>
                        </select>
                        {errors.interest && <span className="text-red-500 text-xs font-bold">{errors.interest.message}</span>}
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest py-6 rounded-none"
                    >
                        {loading ? 'Criando...' : 'Criar Membro'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
