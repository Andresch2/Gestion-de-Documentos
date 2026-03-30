import { DocumentCard } from '@/components/documents/DocumentCard';
import { useDocuments, usePermanentDeleteDocument, useRestoreDocument } from '@/hooks/useDocuments';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

export function TrashPage() {
    const { data: docsData, isLoading } = useDocuments({ isDeleted: true, limit: 50 });
    const restoreDoc = useRestoreDocument();
    const permanentDelete = usePermanentDeleteDocument();

    const documents = docsData?.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Trash2 className="w-6 h-6 text-red-400" /> Papelera
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Los documentos se eliminan permanentemente después de 30 días</p>
            </div>

            {documents.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Los elementos en la papelera se eliminan automáticamente tras 30 días</span>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-56 rounded-xl border border-border bg-card/50 animate-pulse" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-16">
                    <Trash2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">La papelera está vacía</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="relative">
                            <DocumentCard
                                document={doc}
                                isTrash
                                onRestore={(d) => restoreDoc.mutate(d.id)}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => restoreDoc.mutate(doc.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" /> Restaurar
                                </button>
                                <button
                                    onClick={() => { if (confirm('¿Eliminar permanentemente? Esta acción no se puede deshacer.')) permanentDelete.mutate(doc.id); }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
