import { sharedLinksApi } from '@/api/shared-links.api';
import type { Document } from '@/types';
import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareModal({ document: doc, isOpen, onClose }: Props) {
    const [expiresIn, setExpiresIn] = useState('24h');
    const [isOneTime, setIsOneTime] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCreate = async () => {
        if (!doc) return;
        setLoading(true);
        try {
            const { data } = await sharedLinksApi.create({
                documentId: doc.id,
                expiresIn: expiresIn || undefined,
                isOneTime,
            });
            const result = data.data || data;
            setShareUrl(result.accessUrl);
        } catch (err) {
            console.error('Failed to create share link:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setShareUrl('');
        setCopied(false);
        onClose();
    };

    if (!isOpen || !doc) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl animate-fade-in m-4">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-lg font-semibold">Compartir Documento</h2>
                    <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="p-3 rounded-lg bg-accent/30">
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.originalName}</p>
                    </div>

                    {!shareUrl ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Expiración</label>
                                <select
                                    value={expiresIn}
                                    onChange={(e) => setExpiresIn(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="1h">1 hora</option>
                                    <option value="24h">24 horas</option>
                                    <option value="7d">7 días</option>
                                    <option value="30d">30 días</option>
                                    <option value="">Sin expiración</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isOneTime}
                                    onChange={(e) => setIsOneTime(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                                />
                                <span className="text-sm">Acceso único (solo se puede abrir una vez)</span>
                            </label>

                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
                            >
                                {loading ? 'Generando...' : 'Generar Link'}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-green-400 font-medium">✅ Link creado exitosamente</p>
                            <div className="flex gap-2">
                                <input
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
