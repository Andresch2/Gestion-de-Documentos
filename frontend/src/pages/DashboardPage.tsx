import { documentsApi } from '@/api/documents.api';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentDetailSheet } from '@/components/documents/DocumentDetailSheet';
import { EditDocumentModal } from '@/components/documents/EditDocumentModal';
import { ShareModal } from '@/components/documents/ShareModal';
import { UploadModal } from '@/components/documents/UploadModal';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteDocument, useDocuments, useDocumentStats, useExpiringDocuments } from '@/hooks/useDocuments';
import type { Document, DocumentQueryParams } from '@/types';
import { Clock, FileText, FolderOpen, Grid3X3, Link as LinkIcon, List, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSearchParams } from 'react-router-dom';

export function DashboardPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [shareDoc, setShareDoc] = useState<Document | null>(null);
    const [editDoc, setEditDoc] = useState<Document | null>(null);
    const [initialFile, setInitialFile] = useState<File | undefined>();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);

    const params: DocumentQueryParams = {
        page,
        limit: 20,
        categoryId: selectedCategory || undefined,
    };

    const { data: docsData, isLoading } = useDocuments(params);
    const { data: stats } = useDocumentStats();
    const { data: expiring } = useExpiringDocuments();
    const { data: categories } = useCategories();
    const deleteDoc = useDeleteDocument();

    useEffect(() => {
        const handler = () => {
            setInitialFile(undefined);
            setUploadOpen(true);
        };
        window.addEventListener('open-upload-modal', handler);
        return () => window.removeEventListener('open-upload-modal', handler);
    }, []);

    useEffect(() => {
        if (searchParams.get('openUpload') !== '1') return;
        setInitialFile(undefined);
        setUploadOpen(true);
        setSearchParams({}, { replace: true });
    }, [searchParams, setSearchParams]);

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

    const handleDelete = (doc: Document) => {
        if (confirm(`Mover "${doc.name}" a la papelera?`)) {
            deleteDoc.mutate(doc.id);
        }
    };

    const documents = docsData?.data || [];
    const meta = docsData?.meta;
    const quickCategories = (categories || []).slice(0, 5);

    const categoryShort = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('ident')) return 'ID';
        if (n.includes('finan')) return 'FIN';
        if (n.includes('salud')) return 'SAL';
        if (n.includes('legal')) return 'LEG';
        if (n.includes('prop')) return 'PROP';
        return name.slice(0, 4).toUpperCase();
    };

    return (
        <div {...getRootProps()} className="space-y-4">
            <input {...getInputProps()} />

            {isDragActive && (
                <div className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                    <div className="rounded-2xl border-2 border-dashed border-blue-500 bg-white p-6">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-blue-500" />
                        <p className="text-base font-medium text-blue-600">Suelta el archivo para subirlo</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-[2rem] leading-none font-extrabold text-slate-900">{stats?.totalDocs || 0}</p>
                    <p className="mt-1.5 text-[13px] text-slate-500">Total documentos</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FolderOpen className="w-5 h-5" />
                    </div>
                    <p className="text-[2rem] leading-none font-extrabold text-slate-900">{stats?.totalCategories || 0}</p>
                    <p className="mt-1.5 text-[13px] text-slate-500">Categorias activas</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-[2rem] leading-none font-extrabold text-slate-900">{stats?.expiringDocs || 0}</p>
                    <p className="mt-1.5 text-[13px] text-slate-500">Por vencer (30d)</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <LinkIcon className="w-5 h-5" />
                    </div>
                    <p className="text-[2rem] leading-none font-extrabold text-slate-900">0</p>
                    <p className="mt-1.5 text-[13px] text-slate-500">Links activos</p>
                </div>
            </div>

            {expiring && expiring.length > 0 && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
                    <div>
                        <p className="text-sm font-semibold text-amber-900">{expiring.length} documento(s) vencen pronto</p>
                        <p className="text-sm text-amber-700 mt-1 line-clamp-1">
                            {expiring.slice(0, 5).map((d) => d.name).join(' · ')}
                        </p>
                    </div>
                    <button className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-amber-800 transition-colors hover:bg-amber-100">
                        Ver todos
                    </button>
                </div>
            )}

            <div className="flex h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 px-4 text-center">
                <p className="mb-2 text-2xl leading-none">☁</p>
                <p className="text-lg font-semibold text-slate-800">Arrastra documentos aqui</p>
                <p className="mt-1 text-sm text-slate-500">
                    PDF, JPG, PNG, DOCX · max. 25 MB ·{' '}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setInitialFile(undefined);
                            setUploadOpen(true);
                        }}
                        className="font-medium text-blue-600 hover:text-blue-700"
                    >
                        o haz click para seleccionar
                    </button>
                </p>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <h2 className="text-[1.75rem] font-semibold text-slate-900">Documentos</h2>
                    <span className="text-[13px] text-slate-500">{meta?.total || documents.length} archivos</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-white">
                        <button
                            onClick={() => {
                                setSelectedCategory('');
                                setPage(1);
                            }}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedCategory === '' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Todos
                        </button>
                        {quickCategories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    setSelectedCategory(c.id);
                                    setPage(1);
                                }}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedCategory === c.id ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                title={c.name}
                            >
                                {categoryShort(c.name)}
                            </button>
                        ))}
                    </div>
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'} transition-colors`}
                            title="Vista cuadricula"
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'} transition-colors`}
                            title="Vista lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-56 rounded-xl border border-slate-200 bg-white animate-pulse" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                    <p className="text-base font-medium text-slate-600">No hay documentos</p>
                    <p className="text-sm text-slate-500 mt-1">Sube tu primer documento para empezar</p>
                </div>
            ) : (
                <>
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4' : 'space-y-3'}>
                        {documents.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onView={setSelectedDoc}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                                onShare={setShareDoc}
                                onEdit={setEditDoc}
                            />
                        ))}
                    </div>

                    {meta && meta.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            {[...Array(meta.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} initialFile={initialFile} />
            <DocumentDetailSheet
                document={selectedDoc}
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onShare={setShareDoc}
                onEdit={setEditDoc}
            />
            <EditDocumentModal document={editDoc} isOpen={!!editDoc} onClose={() => setEditDoc(null)} />
            <ShareModal document={shareDoc} isOpen={!!shareDoc} onClose={() => setShareDoc(null)} />
        </div>
    );
}
