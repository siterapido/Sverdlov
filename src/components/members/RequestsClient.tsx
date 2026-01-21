'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateMemberStatus } from '@/app/actions/members';
import { Check, X, User, Phone, Mail, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingMember {
    id: string;
    fullName: string;
    socialName: string | null;
    email: string;
    phone: string;
    state: string;
    city: string;
    status: string;
    createdAt: Date;
}

interface RequestsClientProps {
    initialRequests: PendingMember[];
}

export function RequestsClient({ initialRequests }: RequestsClientProps) {
    const [requests, setRequests] = useState(initialRequests);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAction = async (id: string, status: 'in_formation' | 'inactive') => {
        setProcessingId(id);
        try {
            const result = await updateMemberStatus(id, status);
            if (result.success) {
                setRequests(prev => prev.filter(r => r.id !== id));
            } else {
                alert(result.error);
            }
        } catch (err) {
            alert('Erro ao processar solicitação');
        } finally {
            setProcessingId(null);
        }
    };

    if (requests.length === 0) {
        return (
            <div className="bg-white border-2 border-zinc-100 p-12 text-center">
                <div className="h-16 w-16 bg-zinc-50 flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-zinc-300" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900">Nenhuma solicitação pendente</h3>
                <p className="text-zinc-500 text-sm mt-1">Todos os interessados foram processados.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {requests.map((request) => (
                <div key={request.id} className="bg-white border-2 border-zinc-900 p-6 flex flex-col md:flex-row justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900 leading-none mb-1">
                                    {request.fullName}
                                </h3>
                                {request.socialName && (
                                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest italic">
                                        Nome Social: {request.socialName}
                                    </p>
                                )}
                            </div>
                            <Badge className="bg-amber-500 text-white rounded-none font-black uppercase tracking-widest text-[9px] border-none px-2 py-0.5">
                                INTERESSADO
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                            <div className="flex items-center gap-2 text-zinc-600">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">{request.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-600">
                                <Phone className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">{request.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-600">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase">{request.city} - {request.state}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-tight">
                                    Recebido em {format(new Date(request.createdAt), "dd 'de' MMMM", { locale: ptBR })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center md:flex-col justify-end gap-3 md:border-l-2 md:border-zinc-100 md:pl-6">
                        <Button 
                            onClick={() => handleAction(request.id, 'in_formation')}
                            disabled={!!processingId}
                            className="flex-1 md:w-full bg-primary hover:brightness-110 text-white rounded-none font-black uppercase tracking-widest text-[10px] h-10 px-6 border-2 border-primary transition-all active:translate-y-0.5"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            APROVAR
                        </Button>
                        <Button 
                            onClick={() => handleAction(request.id, 'inactive')}
                            disabled={!!processingId}
                            variant="outline"
                            className="flex-1 md:w-full border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[10px] h-10 px-6 transition-all hover:bg-zinc-50 active:translate-y-0.5"
                        >
                            <X className="h-4 w-4 mr-2" />
                            REJEITAR
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
