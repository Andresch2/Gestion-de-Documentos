import { DocumentCard } from '@/components/documents/DocumentCard';
import { useDocuments, usePermanentDeleteDocument, useRestoreDocument } from '@/hooks/useDocuments';
import { Trash2 } from 'lucide-react';

export function TrashPage() {
    const { data: docsData, isLoading } = useDocuments({ isDeleted: true, limit: 50 });
    const restoreDoc = useRestoreDocument();
    const permanentDelete = usePermanentDeleteDocument();

    const documents = docsData?.data || [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5">
                <div>
                    <p className="text-lg font-semibold text-red-600">Papelera de reciclaje</p>
                    <p className="text-slate-600">Los documentos se borran permanentemente tras 30 dias.</p>
                </div>
                <button className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
                    Vaciar papelera
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-56 rounded-xl border border-slate-200 bg-white animate-pulse" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="py-16 text-center">
                    <Trash2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-xl font-semibold text-slate-900">Papelera vacia</p>
                    <p className="mt-1 text-base text-slate-500">Los documentos eliminados apareceran aqui.</p>
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
                                    className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                                >
                                    Restaurar
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Eliminar permanentemente? Esta accion no se puede deshacer.')) permanentDelete.mutate(doc.id);
                                    }}
                                    className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
