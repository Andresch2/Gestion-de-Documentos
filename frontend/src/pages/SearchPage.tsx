import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentDetailSheet } from '@/components/documents/DocumentDetailSheet';
import { ShareModal } from '@/components/documents/ShareModal';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteDocument, useDocuments } from '@/hooks/useDocuments';
import type { Document } from '@/types';
import { FileText, Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';

export function SearchPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [shareDoc, setShareDoc] = useState<Document | null>(null);
    const [timer, setTimer] = useState<NodeJS.Timeout>();

    const { data: categories } = useCategories();
    const { data: docsData, isLoading } = useDocuments({
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        limit: 50,
    });
    const deleteDoc = useDeleteDocument();

    const handleSearch = (val: string) => {
        setSearch(val);
        if (timer) clearTimeout(timer);
        setTimer(setTimeout(() => setDebouncedSearch(val), 300));
    };

    const documents = docsData?.data || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Buscar Documentos</h1>

            <div className="flex gap-3">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar por nombre, descripción, entidad o número..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-border text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-slate-800/50 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="">Todas</option>
                    {categories?.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-56 rounded-xl border border-border bg-card/50 animate-pulse" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">
                        {debouncedSearch ? 'No se encontraron documentos' : 'Escribe para buscar'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documents.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            onView={setSelectedDoc}
                            onDownload={(d) => window.open(`/api/documents/${d.id}/download`, '_blank')}
                            onDelete={(d) => { if (confirm(`¿Mover "${d.name}" a la papelera?`)) deleteDoc.mutate(d.id); }}
                            onShare={setShareDoc}
                        />
                    ))}
                </div>
            )}

            <DocumentDetailSheet document={selectedDoc} isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)}
                onDownload={(d) => window.open(`/api/documents/${d.id}/download`, '_blank')}
                onDelete={(d) => { if (confirm(`¿Eliminar?`)) deleteDoc.mutate(d.id); setSelectedDoc(null); }}
                onShare={setShareDoc} />
            <ShareModal document={shareDoc} isOpen={!!shareDoc} onClose={() => setShareDoc(null)} />
        </div>
    );
}
