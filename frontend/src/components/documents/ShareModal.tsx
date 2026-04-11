import { resolveApiUrl } from '@/api/client';
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
            setShareUrl(resolveApiUrl(`/shared-links/open/${result.token}`));
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
        setExpiresIn('24h');
        setIsOneTime(false);
        setShareUrl('');
        setCopied(false);
        onClose();
    };

    if (!isOpen || !doc) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
                    <h2 className="text-lg font-semibold text-slate-900">Compartir documento</h2>
                    <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-3.5 px-4 py-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{doc.originalName}</p>
                    </div>

                    {!shareUrl ? (
                        <>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Expiracion</label>
                                <select
                                    value={expiresIn}
                                    onChange={(e) => setExpiresIn(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="1h">1 hora</option>
                                    <option value="24h">24 horas</option>
                                    <option value="7d">7 dias</option>
                                    <option value="30d">30 dias</option>
                                    <option value="">Sin expiracion</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isOneTime}
                                    onChange={(e) => setIsOneTime(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500/20"
                                />
                                <span className="text-sm text-slate-700">Acceso unico (solo se puede abrir una vez)</span>
                            </label>

                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? 'Generando...' : 'Generar link'}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-green-700">Link creado exitosamente</p>
                            <div className="flex gap-2">
                                <input
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="rounded-lg bg-blue-50 px-3 py-2 text-blue-600 transition-colors hover:bg-blue-100"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
