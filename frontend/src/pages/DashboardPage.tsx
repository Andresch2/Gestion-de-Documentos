import { documentsApi } from '@/api/documents.api';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentDetailSheet } from '@/components/documents/DocumentDetailSheet';
import { EditDocumentModal } from '@/components/documents/EditDocumentModal';
import { ShareModal } from '@/components/documents/ShareModal';
import { UploadModal } from '@/components/documents/UploadModal';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteDocument, useDocuments, useDocumentStats, useExpiringDocuments } from '@/hooks/useDocuments';
import { formatBytes } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { Document, DocumentQueryParams } from '@/types';
import { ArrowUpDown, Calendar, Clock, FileText, Filter, FolderOpen, Grid3X3, List, Plus, Search, Tag as TagIcon, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [shareDoc, setShareDoc] = useState<Document | null>(null);
    const [editDoc, setEditDoc] = useState<Document | null>(null);
    const [initialFile, setInitialFile] = useState<File | undefined>();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);

    // Advanced filters state
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [tagsQuery, setTagsQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const params: DocumentQueryParams = {
        page,
        limit: 20,
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        tags: tagsQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
    };

    const { data: docsData, isLoading } = useDocuments(params);
    const { data: stats } = useDocumentStats();
    const { data: expiring } = useExpiringDocuments();
    const { data: categories } = useCategories();
    const deleteDoc = useDeleteDocument();

    const onDrop = useCallback((files: File[]) => {
        if (files[0]) {
            setInitialFile(files[0]);
            setUploadOpen(true);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
    });

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

    const handleDelete = (doc: Document) => {
        if (confirm(`¿Mover "${doc.name}" a la papelera?`)) {
            deleteDoc.mutate(doc.id);
        }
    };

    // Debounced search
    const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout>();
    const handleSearch = (value: string) => {
        if (searchTimer) clearTimeout(searchTimer);
        const timer = setTimeout(() => setSearchQuery(value), 300);
        setSearchTimer(timer);
    };

    const documents = docsData?.data || [];
    const meta = docsData?.meta;

    const statCards = [
        { label: 'Total Documentos', value: stats?.totalDocs || 0, icon: FileText, color: 'from-blue-500 to-blue-700' },
        { label: 'Por Vencer', value: stats?.expiringDocs || 0, icon: Clock, color: 'from-amber-500 to-orange-600' },
        { label: 'En Papelera', value: stats?.deletedDocs || 0, icon: Trash2, color: 'from-red-500 to-red-700' },
        { label: 'Categorías', value: stats?.totalCategories || 0, icon: FolderOpen, color: 'from-purple-500 to-purple-700' },
    ];

    return (
        <div {...getRootProps()} className="space-y-6">
            <input {...getInputProps()} />

            {/* Drag overlay */}
            {isDragActive && (
                <div className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                    <div className="p-8 rounded-2xl border-2 border-dashed border-blue-500 bg-card/80">
                        <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-lg font-medium text-blue-400">Suelta el archivo para subirlo</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Bienvenido, {user?.name?.split(' ')[0]} </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Usando {formatBytes(user?.storageUsedBytes || '0')} de {formatBytes(user?.storageQuotaBytes || '1073741824')}
                    </p>
                </div>
                <button
                    onClick={() => { setInitialFile(undefined); setUploadOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-4 h-4" /> Subir Documento
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl border border-border bg-card/50 hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                                <stat.icon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Expiring banner */}
            {expiring && expiring.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <p className="text-sm font-medium text-amber-400">
                            {expiring.length} documento{expiring.length > 1 ? 's' : ''} por vencer en los próximos 60 días
                        </p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto py-1">
                        {expiring.slice(0, 5).map((d) => (
                            <span key={d.id} className="text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 whitespace-nowrap">
                                {d.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar documentos..."
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-border text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg bg-slate-800/50 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option value="">Todas las categorías</option>
                        {categories?.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${showAdvanced ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-800/50 border-border text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Filter className="w-4 h-4" /> Filtros {showAdvanced ? 'Ocultar' : 'Más'}
                    </button>
                    <div className="flex rounded-lg border border-border overflow-hidden ml-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-muted-foreground hover:bg-accent'} transition-colors`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-muted-foreground hover:bg-accent'} transition-colors`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvanced && (
                    <div className="p-4 rounded-xl border border-border bg-card/30 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                <TagIcon className="w-3 h-3" /> Etiquetas (por coma)
                            </label>
                            <input
                                type="text"
                                placeholder="factura, 2024..."
                                value={tagsQuery}
                                onChange={(e) => { setTagsQuery(e.target.value); setPage(1); }}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> Desde
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> Hasta
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                <ArrowUpDown className="w-3 h-3" /> Ordenar por
                            </label>
                            <div className="flex gap-1">
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                    className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                >
                                    <option value="createdAt">Fecha Subida</option>
                                    <option value="issueDate">Fecha Emisión</option>
                                    <option value="name">Nombre</option>
                                    <option value="fileSizeBytes">Tamaño</option>
                                </select>
                                <button
                                    onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setPage(1); }}
                                    className="px-2 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700 text-muted-foreground hover:text-white transition-colors"
                                >
                                    {sortOrder === 'asc' ? 'ASC' : 'DESC'}
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-3 lg:col-span-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setTagsQuery('');
                                    setStartDate('');
                                    setEndDate('');
                                    setSortBy('createdAt');
                                    setSortOrder('desc');
                                    setPage(1);
                                }}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Documents grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-56 rounded-xl border border-border bg-card/50 animate-pulse" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">No hay documentos</p>
                    <p className="text-sm text-muted-foreground mt-1">Sube tu primer documento para empezar</p>
                </div>
            ) : (
                <>
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                        : 'space-y-2'
                    }>
                        {documents.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onView={setSelectedDoc}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                                onShare={setShareDoc}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            {[...Array(meta.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:bg-accent'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} initialFile={initialFile} />
            <DocumentDetailSheet
                document={selectedDoc}
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onShare={setShareDoc}
                onEdit={handleEdit}
            />
            <EditDocumentModal document={editDoc} isOpen={!!editDoc} onClose={() => setEditDoc(null)} />
            <ShareModal document={shareDoc} isOpen={!!shareDoc} onClose={() => setShareDoc(null)} />
        </div>
    );
}
