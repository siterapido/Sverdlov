'use client';

import { useState } from 'react';
import UserManagement from './UserManagement';
import CityManagement from './CityManagement';

interface AdminPanelProps {
    initialUsers: any[];
    initialCities: any[];
}

export default function AdminPanel({ initialUsers, initialCities }: AdminPanelProps) {
    const [activeTab, setActiveTab] = useState<'users' | 'cities'>('users');

    return (
        <div className="space-y-4">
            <div className="flex gap-0 border-b-2 border-zinc-200">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                        activeTab === 'users'
                            ? 'border-b-2 border-zinc-900 text-zinc-900 -mb-[2px]'
                            : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                >
                    Usuários
                </button>
                <button
                    onClick={() => setActiveTab('cities')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                        activeTab === 'cities'
                            ? 'border-b-2 border-zinc-900 text-zinc-900 -mb-[2px]'
                            : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                >
                    Cidades
                </button>
            </div>

            {activeTab === 'users' && (
                <UserManagement initialUsers={initialUsers} initialCities={initialCities} />
            )}
            {activeTab === 'cities' && (
                <CityManagement initialCities={initialCities} />
            )}
        </div>
    );
}
