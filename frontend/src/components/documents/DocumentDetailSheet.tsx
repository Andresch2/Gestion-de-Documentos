import { daysUntil, formatBytes, formatDate, getExpiryColor } from '@/lib/utils';
import type { Document } from '@/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Building, Calendar, Download, FileText, Hash, Pencil, Share2, Trash2, X } from 'lucide-react';

interface Props {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
    onDownload?: (doc: Document) => void;
    onDelete?: (doc: Document) => void;
    onShare?: (doc: Document) => void;
    onEdit?: (doc: Document) => void;
}

export function DocumentDetailSheet({ document: doc, isOpen, onClose, onDownload, onDelete, onShare, onEdit }: Props) {
    if (!isOpen || !doc) return null;

    const days = daysUntil(doc.expiryDate);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
            <div className="relative w-full max-w-[400px] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl animate-slide-in">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
                    <h2 className="truncate text-lg font-semibold text-slate-900">{doc.name}</h2>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100">
                        <X className="h-4 w-4 text-slate-700" />
                    </button>
                </div>

                <div
                    className="flex h-40 items-center justify-center"
                    style={{ backgroundColor: doc.category?.color ? `${doc.category.color}15` : '#f1f5f9' }}
                >
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
                        <CategoryIcon
                            name={doc.category?.icon || 'FileText'}
                            className="h-14 w-14"
                            style={{ color: doc.category?.color || '#94a3b8' }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 border-b border-slate-200 p-4">
                    <button
                        onClick={() => onDownload?.(doc)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                    >
                        <Download className="h-4 w-4" /> Descargar
                    </button>
                    <button
                        onClick={() => onEdit?.(doc)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-50 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                    >
                        <Pencil className="h-4 w-4" /> Editar
                    </button>
                    <button
                        onClick={() => onShare?.(doc)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                    >
                        <Share2 className="h-4 w-4" /> Compartir
                    </button>
                    <button
                        onClick={() => onDelete?.(doc)}
                        className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-3.5 p-4">
                    {doc.category && (
                        <div className="flex items-center gap-2">
                            <span
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]"
                                style={{ backgroundColor: `${doc.category.color}20`, color: doc.category.color }}
                            >
                                <CategoryIcon name={doc.category.icon} className="h-3 w-3" /> {doc.category.name}
                            </span>
                        </div>
                    )}

                    {doc.description && (
                        <div>
                            <p className="mb-1 text-xs text-slate-500">Descripcion</p>
                            <p className="text-sm text-slate-800">{doc.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="mb-1 flex items-center gap-1 text-xs text-slate-500"><FileText className="h-3 w-3" /> Tamano</p>
                            <p className="text-sm font-medium text-slate-800">{formatBytes(doc.fileSizeBytes)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="mb-1 flex items-center gap-1 text-xs text-slate-500"><Calendar className="h-3 w-3" /> Creado</p>
                            <p className="text-sm font-medium text-slate-800">{formatDate(doc.createdAt)}</p>
                        </div>
                    </div>

                    {(doc.issueDate || doc.expiryDate) && (
                        <div className="grid grid-cols-2 gap-3">
                            {doc.issueDate && (
                                <div className="rounded-lg bg-slate-50 p-3">
                                    <p className="mb-1 text-xs text-slate-500">Emision</p>
                                    <p className="text-sm font-medium text-slate-800">{formatDate(doc.issueDate)}</p>
                                </div>
                            )}
                            {doc.expiryDate && (
                                <div className={`rounded-lg p-3 ${getExpiryColor(days)}`}>
                                    <p className="mb-1 text-xs opacity-70">Vencimiento</p>
                                    <p className="text-sm font-bold">{formatDate(doc.expiryDate)}</p>
                                    {days !== null && (
                                        <p className="mt-1 text-xs font-medium">{days < 0 ? 'Vencido' : `${days} dias restantes`}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {doc.issuingAuthority && (
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="mb-1 flex items-center gap-1 text-xs text-slate-500"><Building className="h-3 w-3" /> Entidad emisora</p>
                            <p className="text-sm font-medium text-slate-800">{doc.issuingAuthority}</p>
                        </div>
                    )}

                    {doc.documentNumber && (
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="mb-1 flex items-center gap-1 text-xs text-slate-500"><Hash className="h-3 w-3" /> Numero</p>
                            <p className="font-mono text-sm font-medium text-slate-800">{doc.documentNumber}</p>
                        </div>
                    )}

                    {doc.tags.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs text-slate-500">Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {doc.tags.map((t) => (
                                    <span key={t.id} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                        {t.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
