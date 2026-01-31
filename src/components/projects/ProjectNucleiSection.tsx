'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MapPin, Star, Trash2 } from 'lucide-react';
import { unlinkProjectFromNucleus, setPrimaryNucleus } from '@/app/actions/projects';

interface ProjectNuclei {
    id: string;
    projectId: string;
    nucleusId: string;
    isPrimary: boolean | null;
    nucleus?: {
        id: string;
        name: string;
        state: string;
        city: string;
        type: string;
        status: string;
    };
}

interface ProjectNucleiSectionProps {
    projectId: string;
    nuclei: ProjectNuclei[];
    canManage: boolean;
}

export function ProjectNucleiSection({ projectId, nuclei, canManage }: ProjectNucleiSectionProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleUnlink = async (linkId: string) => {
        if (!confirm('Deseja desvincular este núcleo do projeto?')) return;

        setLoading(linkId);
        try {
            const result = await unlinkProjectFromNucleus(linkId);
            if (result.success) {
                alert('Núcleo desvinculado com sucesso');
            } else {
                alert(result.error || 'Falha ao desvincular');
            }
        } finally {
            setLoading(null);
        }
    };

    const handleSetPrimary = async (nucleusId: string) => {
        setLoading(nucleusId);
        try {
            const result = await setPrimaryNucleus(projectId, nucleusId);
            if (result.success) {
                alert('Núcleo primário atualizado com sucesso');
            } else {
                alert(result.error || 'Falha ao atualizar');
            }
        } finally {
            setLoading(null);
        }
    };

    if (!nuclei || nuclei.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Núcleos do Projeto
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 text-center">Nenhum núcleo vinculado a este projeto</p>
                        {canManage && (
                            <Button className="mt-4" variant="outline">
                                Vincular Núcleo
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Núcleos do Projeto ({nuclei.length})
                    </CardTitle>
                    <CardDescription>Localidades vinculadas a este projeto</CardDescription>
                </div>
                {canManage && (
                    <Button variant="outline" size="sm">
                        Vincular Núcleo
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nuclei.map((link) => (
                        <div
                            key={link.id}
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors relative"
                        >
                            {link.isPrimary && (
                                <div className="absolute top-2 right-2">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                </div>
                            )}

                            <Link
                                href={`/nucleos/${link.nucleusId}`}
                                className="font-semibold hover:underline text-blue-600 block mb-2"
                            >
                                {link.nucleus?.name || 'Núcleo desconhecido'}
                            </Link>

                            <div className="space-y-1 mb-3">
                                <p className="text-sm text-gray-600">
                                    📍 {link.nucleus?.city}, {link.nucleus?.state}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Tipo: {link.nucleus?.type} • Status: {link.nucleus?.status}
                                </p>
                            </div>

                            {canManage && (
                                <div className="flex gap-2 mt-3">
                                    {!link.isPrimary && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSetPrimary(link.nucleusId)}
                                            disabled={loading === link.nucleusId}
                                            className="flex-1 text-xs"
                                        >
                                            <Star className="h-3 w-3 mr-1" />
                                            Definir Primário
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleUnlink(link.id)}
                                        disabled={loading === link.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
