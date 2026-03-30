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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Share2 className="w-6 h-6 text-green-400" /> Links Compartidos
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Gestiona los links de acceso público a tus documentos</p>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 rounded-xl border border-border bg-card/50 animate-pulse" />
                    ))}
                </div>
            ) : links.length === 0 ? (
                <div className="text-center py-16">
                    <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">No hay links compartidos</p>
                    <p className="text-sm text-muted-foreground mt-1">Comparte documentos desde el dashboard</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {links.map((link: any) => (
                        <div key={link.id} className="p-4 rounded-xl border border-border bg-card/50 hover:border-blue-500/30 transition-all flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{link.document?.name}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span>Creado: {formatDate(link.createdAt)}</span>
                                    {link.expiresAt && <span>Expira: {formatDate(link.expiresAt)}</span>}
                                    {link.isOneTime && <span className="text-amber-400">Uso único</span>}
                                    <span>Accesos: {link.accessCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCopy(link.token, link.id)}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                    title="Copiar link"
                                >
                                    {copiedId === link.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => { if (confirm('¿Revocar este link?')) deleteLink.mutate(link.id); }}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Revocar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
