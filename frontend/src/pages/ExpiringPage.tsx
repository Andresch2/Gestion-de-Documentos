import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentDetailSheet } from '@/components/documents/DocumentDetailSheet';
import { EditDocumentModal } from '@/components/documents/EditDocumentModal';
import { ShareModal } from '@/components/documents/ShareModal';
import { documentsApi } from '@/api/documents.api';
import { useDeleteDocument, useExpiringDocuments } from '@/hooks/useDocuments';
import type { Document } from '@/types';
import { Clock } from 'lucide-react';
import { useState } from 'react';

export function ExpiringPage() {
    const { data: expiring, isLoading } = useExpiringDocuments();
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [shareDoc, setShareDoc] = useState<Document | null>(null);
    const [editDoc, setEditDoc] = useState<Document | null>(null);
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

    const handleEdit = (doc: Document) => {
        setEditDoc(doc);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="w-6 h-6 text-amber-400" /> Documentos por Vencer
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Documentos que vencen en los próximos 60 días</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-56 rounded-xl border border-border bg-card/50 animate-pulse" />
                    ))}
                </div>
            ) : !expiring?.length ? (
                <div className="text-center py-16">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">No hay documentos por vencer</p>
                    <p className="text-sm text-muted-foreground mt-1">Todos tus documentos están vigentes</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {expiring.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            onView={setSelectedDoc}
                            onDownload={handleDownload}
                            onDelete={(d) => { if (confirm(`¿Mover "${d.name}" a la papelera?`)) deleteDoc.mutate(d.id); }}
                            onShare={setShareDoc}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            <DocumentDetailSheet
                document={selectedDoc}
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
                onDownload={handleDownload}
                onDelete={(d) => { if (confirm(`¿Eliminar?`)) deleteDoc.mutate(d.id); setSelectedDoc(null); }}
                onShare={setShareDoc}
                onEdit={handleEdit}
            />
            <EditDocumentModal document={editDoc} isOpen={!!editDoc} onClose={() => setEditDoc(null)} />
            <ShareModal document={shareDoc} isOpen={!!shareDoc} onClose={() => setShareDoc(null)} />
        </div>
    );
}
