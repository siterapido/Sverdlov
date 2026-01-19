"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormGroup, Label } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface MemberFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export const MemberForm = ({ initialData, isEditing = false }: MemberFormProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get("fullName"),
            socialName: formData.get("socialName"),
            cpf: formData.get("cpf"),
            voterTitle: formData.get("voterTitle"),
            dateOfBirth: formData.get("dateOfBirth"),
            gender: formData.get("gender"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            state: formData.get("state"),
            city: formData.get("city"),
            zone: formData.get("zone"),
            neighborhood: formData.get("neighborhood"),
        };

        try {
            const endpoint = isEditing ? `/api/members/${initialData.id}` : "/api/members";
            const method = isEditing ? "PATCH" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ao ${isEditing ? "atualizar" : "cadastrar"} membro`);
            }

            if (!isEditing) {
                e.currentTarget.reset();
            }
            router.refresh();
            // Dispatch a custom event or use a callback to close modal if needed
            // For now, let's assume the client component handles this via refresh
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-red-50 border-2 border-red-600 rounded-none text-red-600 flex items-center gap-4"
                >
                    <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-widest">{error}</span>
                </motion.div>
            )}

            <div className="space-y-8">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-zinc-900">
                    <div className="h-8 w-8 bg-zinc-900 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">Informações Estatutárias</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormGroup>
                        <Label required>Nome Civil Completo</Label>
                        <Input
                            name="fullName"
                            placeholder="EX: JOÃO DA SILVA"
                            defaultValue={initialData?.fullName}
                            leftIcon={<User className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Nome Social / Identidade</Label>
                        <Input
                            name="socialName"
                            placeholder="COMO PREFERE SER CHAMADO"
                            defaultValue={initialData?.socialName}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label required>Cadastro de Pessoa Física (CPF)</Label>
                        <Input
                            name="cpf"
                            placeholder="000.000.000-00"
                            defaultValue={initialData?.cpf}
                            leftIcon={<CreditCard className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Título de Eleitor</Label>
                        <Input
                            name="voterTitle"
                            placeholder="NÚMERO DO TÍTULO"
                            defaultValue={initialData?.voterTitle}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label required>Data de Nascimento</Label>
                        <Input
                            name="dateOfBirth"
                            type="date"
                            defaultValue={initialData?.dateOfBirth}
                            leftIcon={<Calendar className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label required>Telefone / Comunicação</Label>
                        <Input
                            name="phone"
                            placeholder="(11) 99999-9999"
                            defaultValue={initialData?.phone}
                            leftIcon={<Phone className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                        <Label required>Endereço de Correio Eletrônico (Email)</Label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="JOAO@EXEMPLO.COM"
                            defaultValue={initialData?.email}
                            leftIcon={<Mail className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>
                </div>
            </div>

            <div className="space-y-8 pt-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-zinc-900">
                    <div className="h-8 w-8 bg-zinc-900 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">Território e Localidade</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormGroup>
                        <Label required>Unidade Federativa (UF)</Label>
                        <select
                            name="state"
                            className="flex h-11 w-full rounded-none border-2 border-zinc-200 bg-white px-3 py-2 text-[13px] font-black uppercase tracking-tight focus:border-primary outline-none transition-all appearance-none"
                            defaultValue={initialData?.state || ""}
                            required
                        >
                            <option value="">SELECIONE O ESTADO...</option>
                            <option value="AC">ACRE</option>
                            <option value="AL">ALAGOAS</option>
                            <option value="AP">AMAPÁ</option>
                            <option value="AM">AMAZONAS</option>
                            <option value="BA">BAHIA</option>
                            <option value="CE">CEARÁ</option>
                            <option value="DF">DISTRITO FEDERAL</option>
                            <option value="ES">ESPÍRITO SANTO</option>
                            <option value="GO">GOIÁS</option>
                            <option value="MA">MARANHÃO</option>
                            <option value="MT">MATO GROSSO</option>
                            <option value="MS">MATO GROSSO DO SUL</option>
                            <option value="MG">MINAS GERAIS</option>
                            <option value="PA">PARÁ</option>
                            <option value="PB">PARAÍBA</option>
                            <option value="PR">PARANÁ</option>
                            <option value="PE">PERNAMBUCO</option>
                            <option value="PI">PIAUÍ</option>
                            <option value="RJ">RIO DE JANEIRO</option>
                            <option value="RN">RIO GRANDE DO NORTE</option>
                            <option value="RS">RIO GRANDE DO SUL</option>
                            <option value="RO">RONDÔNIA</option>
                            <option value="RR">RORAIMA</option>
                            <option value="SC">SANTA CATARINA</option>
                            <option value="SP">SÃO PAULO</option>
                            <option value="SE">SERGIPE</option>
                            <option value="TO">TOCANTINS</option>
                        </select>
                    </FormGroup>

                    <FormGroup>
                        <Label required>Cidade</Label>
                        <Input
                            name="city"
                            placeholder="EX: SÃO PAULO"
                            defaultValue={initialData?.city}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label required>Bairro / Comunidade</Label>
                        <Input
                            name="neighborhood"
                            placeholder="EX: PINHEIROS"
                            defaultValue={initialData?.neighborhood}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Zona Eleitoral (Se houver)</Label>
                        <Input
                            name="zone"
                            placeholder="EX: 001"
                            defaultValue={initialData?.zone}
                        />
                    </FormGroup>
                </div>
            </div>

            <div className="pt-10 flex items-center justify-end border-t border-zinc-100">
                <Button
                    type="submit"
                    disabled={loading}
                    variant="default"
                    size="lg"
                    className="w-full md:w-auto min-w-[240px] bg-primary hover:brightness-110 text-white font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,82,255,0.1)] active:translate-y-0.5 active:shadow-none"
                >
                    {loading ? "PROCESSANDO..." : (
                        <>
                            {isEditing ? "SALVAR ALTERAÇÕES" : "CADASTRAR FILIADO"}
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

