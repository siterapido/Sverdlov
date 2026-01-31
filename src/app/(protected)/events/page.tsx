'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, AlertCircle } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    description: string;
    type: 'meeting' | 'training' | 'assembly' | 'action' | 'other';
    startDate: Date;
    endDate?: Date;
    location?: string;
    maxParticipants?: number;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [showForm, setShowForm] = useState(false);

    const typeColors = {
        meeting: 'bg-blue-100 border-blue-600 text-blue-900',
        training: 'bg-green-100 border-green-600 text-green-900',
        assembly: 'bg-purple-100 border-purple-600 text-purple-900',
        action: 'bg-red-100 border-red-600 text-red-900',
        other: 'bg-gray-100 border-gray-600 text-gray-900',
    };

    const typeLabels = {
        meeting: 'Reunião',
        training: 'Formação',
        assembly: 'Assembleia',
        action: 'Ação',
        other: 'Outro',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black mb-2">Eventos</h1>
                    <p className="text-gray-600">Organize e gerencie eventos da organização</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="border-2 border-gray-900 bg-gray-900 text-white font-bold px-6 py-3 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                >
                    + Novo Evento
                </button>
            </div>

            {showForm && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Criar Novo Evento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Título</label>
                            <input type="text" className="w-full border-2 border-gray-900 p-2" placeholder="Nome do evento" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Tipo</label>
                            <select className="w-full border-2 border-gray-900 p-2">
                                <option value="meeting">Reunião</option>
                                <option value="training">Formação</option>
                                <option value="assembly">Assembleia</option>
                                <option value="action">Ação</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Data Início</label>
                            <input type="datetime-local" className="w-full border-2 border-gray-900 p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Data Fim</label>
                            <input type="datetime-local" className="w-full border-2 border-gray-900 p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Local</label>
                            <input type="text" className="w-full border-2 border-gray-900 p-2" placeholder="Endereço do evento" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Máx. Participantes</label>
                            <input type="number" className="w-full border-2 border-gray-900 p-2" placeholder="100" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold mb-1">Descrição</label>
                            <textarea className="w-full border-2 border-gray-900 p-2" rows={3} placeholder="Descrição do evento..."></textarea>
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                            <button className="flex-1 border-2 border-gray-900 bg-gray-900 text-white font-bold py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                Criar Evento
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 border-2 border-gray-900 font-bold py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {events.length === 0 ? (
                <div className="border-2 border-gray-900 p-12 text-center shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-600 mb-4">Nenhum evento criado ainda</p>
                    <p className="text-sm text-gray-500">Clique em "Novo Evento" para começar</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map(event => (
                        <div key={event.id} className="border-2 border-gray-900 p-4 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                            <div className={`inline-block px-3 py-1 border-2 font-bold text-sm mb-3 ${typeColors[event.type]}`}>
                                {typeLabels[event.type]}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-600" />
                                    <span>{new Date(event.startDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-600" />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                                {event.maxParticipants && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-600" />
                                        <span>Até {event.maxParticipants} pessoas</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
