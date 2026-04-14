import { documentsApi } from '@/api/documents.api';
import { DocumentDetailSheet } from '@/components/documents/DocumentDetailSheet';
import { EditDocumentModal } from '@/components/documents/EditDocumentModal';
import { ShareModal } from '@/components/documents/ShareModal';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteDocument, useDocuments } from '@/hooks/useDocuments';
import { formatBytes } from '@/lib/utils';
import type { Document } from '@/types';
import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
    const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
    const [sortBy, setSortBy] = useState<'createdAt' | 'name'>('createdAt');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [shareDoc, setShareDoc] = useState<Document | null>(null);
    const [editDoc, setEditDoc] = useState<Document | null>(null);
    const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<Document | null>(null);
    const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>();

    const { data: categories } = useCategories();
    const { data: docsData } = useDocuments({
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        limit: 50,
    });
    const deleteDoc = useDeleteDocument();

    useEffect(() => {
        const urlCategoryId = searchParams.get('categoryId') || '';
        const urlQuery = searchParams.get('q') || '';
        setCategoryId(urlCategoryId);
        setSearch(urlQuery);
        setDebouncedSearch(urlQuery);
    }, [searchParams]);

    const handleSearch = (value: string) => {
        setSearch(value);
        if (timer) clearTimeout(timer);
        setTimer(setTimeout(() => {
            setDebouncedSearch(value);
            const nextParams = new URLSearchParams(searchParams);
            if (value.trim()) nextParams.set('q', value.trim());
            else nextParams.delete('q');
            setSearchParams(nextParams);
        }, 300));
    };

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

    const documents = useMemo(() => {
        const list = [...(docsData?.data || [])];
        list.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return list;
    }, [docsData?.data, sortBy]);

    const isExpired = (doc: Document) => doc.expiryDate && new Date(doc.expiryDate).getTime() < Date.now();

    const onCategoryChange = (value: string) => {
        setCategoryId(value);
        const nextParams = new URLSearchParams(searchParams);
        if (value) nextParams.set('categoryId', value);
        else nextParams.delete('categoryId');
        setSearchParams(nextParams);
    };

    return (
        <div className="space-y-5">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                    <label htmlFor="search-documents-input" className="text-xs font-semibold tracking-[0.12em] uppercase text-slate-600">
                        Buscar
                    </label>
                    <div className="relative mt-2">
                        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="search-documents-input"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Nombre, categoria, etiqueta..."
                            aria-label="Buscar documentos por nombre, categoria o etiqueta"
                            className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                        <label htmlFor="search-category-filter" className="mb-2 block text-xs font-semibold tracking-[0.12em] uppercase text-slate-600">
                            Categoria
                        </label>
                        <select
                            id="search-category-filter"
                            value={categoryId}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            aria-label="Filtrar por categoria"
                            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">Todas</option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="search-sort-filter" className="mb-2 block text-xs font-semibold tracking-[0.12em] uppercase text-slate-600">
                            Ordenar por
                        </label>
                        <select
                            id="search-sort-filter"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'name')}
                            aria-label="Ordenar resultados"
                            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="createdAt">Mas reciente</option>
                            <option value="name">Nombre</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-slate-900">
                    Resultados <span className="text-sm font-normal text-slate-600">{documents.length} encontrados</span>
                </h2>

                <div className="mt-4 space-y-2">
                    {documents.length === 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
                            No se encontraron documentos.
                        </div>
                    )}

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
                                <p className="mt-1 text-sm text-slate-600">
                                    <span className="font-medium" style={{ color: doc.category?.color || '#64748b' }}>
                                        {doc.category?.name || 'Sin categoria'}
                                    </span>
                                    {' - '}
                                    {formatBytes(doc.fileSizeBytes)}
                                    {' - '}
                                    {new Date(doc.createdAt).toISOString().slice(0, 10)}
                                </p>
                            </div>

                            {isExpired(doc) && (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                                    Vencido
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <DocumentDetailSheet
                document={selectedDoc}
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
                onDownload={handleDownload}
                onDelete={(doc) => {
                    setConfirmDeleteDoc(doc);
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
