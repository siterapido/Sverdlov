'use client';

import { useState } from 'react';
import { FileText, Upload, Trash2, AlertCircle, Calendar } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    category: string;
    uploadedAt: Date;
    uploadedBy: string;
    fileSize: number;
    fileUrl: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [showUpload, setShowUpload] = useState(false);
    const [category, setCategory] = useState('general');

    const categories = [
        { value: 'general', label: 'Geral' },
        { value: 'minutes', label: 'Atas' },
        { value: 'financial', label: 'Financeiro' },
        { value: 'organizational', label: 'Organizacional' },
        { value: 'training', label: 'Formação' },
        { value: 'other', label: 'Outro' },
    ];

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black mb-2">Documentos</h1>
                    <p className="text-gray-600">Armazene e compartilhe documentos importantes</p>
                </div>
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="border-2 border-gray-900 bg-gray-900 text-white font-bold px-6 py-3 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Enviar Documento
                </button>
            </div>

            {showUpload && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Enviar Novo Documento</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Categoria</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border-2 border-gray-900 p-2"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Arquivo</label>
                            <input
                                type="file"
                                className="w-full border-2 border-gray-900 p-2"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.png"
                            />
                            <p className="text-xs text-gray-600 mt-2">
                                Formatos aceitos: PDF, Word, Excel, Texto, Imagens
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Descrição</label>
                            <textarea
                                className="w-full border-2 border-gray-900 p-2"
                                rows={3}
                                placeholder="Adicione uma descrição do documento..."
                            ></textarea>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 border-2 border-gray-900 bg-gray-900 text-white font-bold py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                Enviar
                            </button>
                            <button
                                onClick={() => setShowUpload(false)}
                                className="flex-1 border-2 border-gray-900 font-bold py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {documents.length === 0 ? (
                <div className="border-2 border-gray-900 p-12 text-center shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-600 mb-4">Nenhum documento enviado ainda</p>
                    <p className="text-sm text-gray-500">Clique em "Enviar Documento" para começar</p>
                </div>
            ) : (
                <div className="border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left font-bold py-3 px-4">Documento</th>
                                <th className="text-left font-bold py-3 px-4">Categoria</th>
                                <th className="text-left font-bold py-3 px-4">Tamanho</th>
                                <th className="text-left font-bold py-3 px-4">Enviado Por</th>
                                <th className="text-left font-bold py-3 px-4">Data</th>
                                <th className="text-center font-bold py-3 px-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id} className="border-b border-gray-200">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-600" />
                                            <span className="font-semibold">{doc.title}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{doc.category}</td>
                                    <td className="py-3 px-4 text-gray-600">{formatFileSize(doc.fileSize)}</td>
                                    <td className="py-3 px-4 text-gray-600">{doc.uploadedBy}</td>
                                    <td className="py-3 px-4 text-gray-600">{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button className="text-red-600 hover:font-bold">
                                            <Trash2 className="w-4 h-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
