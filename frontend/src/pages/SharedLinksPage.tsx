import { sharedLinksApi } from '@/api/shared-links.api';
import { formatDate } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function SharedLinksPage() {
    const queryClient = useQueryClient();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { data: linksRes, isLoading } = useQuery({
        queryKey: ['shared-links'],
        queryFn: async () => {
            const { data } = await sharedLinksApi.getAll();
            return data.data || data;
        },
    });

    const deleteLink = useMutation({
        mutationFn: (id: string) => sharedLinksApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-links'] }),
    });

    const links = linksRes || [];

    const handleCopy = async (token: string, id: string) => {
        const url = `${window.location.origin}/shared/${token}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Share2 className="h-5 w-5 text-emerald-500" /> Links compartidos
                </h1>
                <p className="mt-1 text-sm text-slate-500">Gestiona los links de acceso publico a tus documentos.</p>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 rounded-xl border border-slate-200 bg-white animate-pulse" />
                    ))}
                </div>
            ) : links.length === 0 ? (
                <div className="py-14 text-center">
                    <Share2 className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                    <p className="text-base font-medium text-slate-600">No hay links compartidos</p>
                    <p className="mt-1 text-sm text-slate-500">Comparte documentos desde el dashboard.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {links.map((link: any) => (
                        <div key={link.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">{link.document?.name}</p>
                                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                                    <span>Creado: {formatDate(link.createdAt)}</span>
                                    {link.expiresAt && <span>Expira: {formatDate(link.expiresAt)}</span>}
                                    {link.isOneTime && <span className="text-amber-600">Uso unico</span>}
                                    <span>Accesos: {link.accessCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCopy(link.token, link.id)}
                                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                    title="Copiar link"
                                >
                                    {copiedId === link.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Revocar este link?')) deleteLink.mutate(link.id);
                                    }}
                                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                    title="Revocar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
