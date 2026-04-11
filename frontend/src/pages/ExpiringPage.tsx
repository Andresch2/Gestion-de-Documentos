import { documentsApi } from '@/api/documents.api';
import { DocumentDetailSheet } from '@/components/documents/DocumentDetailSheet';
import { EditDocumentModal } from '@/components/documents/EditDocumentModal';
import { ShareModal } from '@/components/documents/ShareModal';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteDocument, useExpiringDocuments } from '@/hooks/useDocuments';
import { daysUntil, formatDate } from '@/lib/utils';
import type { Document } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function ExpiringPage() {
    const { data: expiring, isLoading } = useExpiringDocuments();
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [shareDoc, setShareDoc] = useState<Document | null>(null);
    const [editDoc, setEditDoc] = useState<Document | null>(null);
    const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<Document | null>(null);
    const deleteDoc = useDeleteDocument();

    const handleDownload = async (doc: Document) => {
        try {
            const response = await documentsApi.download(doc.id);
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    const documents = expiring || [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                    <div>
                        <p className="text-lg font-semibold text-slate-900">Documentos proximos a vencer</p>
                        <p className="text-slate-600">Los que vencen en los proximos 60 dias.</p>
                    </div>
                </div>
                <button className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100">
                    Enviar recordatorios
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-500">
                    No hay documentos proximos a vencer.
                </div>
            ) : (
                <div className="space-y-2">
                    {documents.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                <CategoryIcon
                                    name={doc.category?.icon || 'FileText'}
                                    className="h-5 w-5"
                                    style={{ color: doc.category?.color || '#94a3b8' }}
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-semibold text-slate-900">{doc.name}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                    <span className="font-semibold" style={{ color: doc.category?.color || '#64748b' }}>
                                        {doc.category?.name || 'Sin categoria'}
                                    </span>
                                    {' '}
                                    {doc.expiryDate ? formatDate(doc.expiryDate) : 'Sin fecha'}
                                </p>
                            </div>
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                                {(() => {
                                    const days = daysUntil(doc.expiryDate);
                                    if (days === null) return 'Sin fecha';
                                    if (days < 0) return 'Vencido';
                                    if (days === 0) return 'Vence hoy';
                                    return `Vence en ${days} dias`;
                                })()}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <DocumentDetailSheet
                document={selectedDoc}
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
                onDownload={handleDownload}
                onDelete={(d) => {
                    setConfirmDeleteDoc(d);
                    setSelectedDoc(null);
                }}
                onShare={setShareDoc}
                onEdit={setEditDoc}
            />
            <EditDocumentModal document={editDoc} isOpen={!!editDoc} onClose={() => setEditDoc(null)} />
            <ShareModal document={shareDoc} isOpen={!!shareDoc} onClose={() => setShareDoc(null)} />
            <ConfirmDialog
                isOpen={!!confirmDeleteDoc}
                title="Mover a la papelera"
                message={confirmDeleteDoc ? `Se movera "${confirmDeleteDoc.name}" a la papelera para que puedas restaurarlo despues.` : ''}
                confirmLabel="Mover"
                tone="warning"
                onClose={() => setConfirmDeleteDoc(null)}
                onConfirm={() => {
                    if (confirmDeleteDoc) {
                        deleteDoc.mutate(confirmDeleteDoc.id);
                    }
                    setConfirmDeleteDoc(null);
                }}
            />
        </div>
    );
}
