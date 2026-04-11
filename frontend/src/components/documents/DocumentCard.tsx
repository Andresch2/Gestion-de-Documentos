import { daysUntil, formatBytes, formatDate, getExpiryColor, getFileIcon } from '@/lib/utils';
import type { Document } from '@/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Download, Pencil, RotateCcw, Share2, Trash2 } from 'lucide-react';

interface Props {
    document: Document;
    onDownload?: (doc: Document) => void;
    onDelete?: (doc: Document) => void;
    onRestore?: (doc: Document) => void;
    onShare?: (doc: Document) => void;
    onEdit?: (doc: Document) => void;
    onView?: (doc: Document) => void;
    isTrash?: boolean;
}

export function DocumentCard({ document: doc, onDownload, onDelete, onRestore, onShare, onEdit, onView, isTrash }: Props) {
    const days = daysUntil(doc.expiryDate);
    const expiryClass = getExpiryColor(days);
    const fileType = getFileIcon(doc.mimeType);

    return (
        <div
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-md"
            onClick={() => onView?.(doc)}
        >
            <div
                className="relative flex h-28 items-center justify-center"
                style={{ backgroundColor: doc.category?.color ? `${doc.category.color}14` : '#eff3f9' }}
            >
                <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm">
                    <CategoryIcon
                        name={doc.category?.icon || 'FileText'}
                        className="h-10 w-10"
                        style={{ color: doc.category?.color || '#94a3b8' }}
                    />
                </div>

                <span className="absolute right-2 top-2 rounded border border-slate-200 bg-white/90 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                    {fileType}
                </span>

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {!isTrash && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDownload?.(doc); }}
                                className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                title="Descargar"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit?.(doc); }}
                                className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                title="Editar"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onShare?.(doc); }}
                                className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                title="Compartir"
                            >
                                <Share2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete?.(doc); }}
                                className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-red-500/30"
                                title="Eliminar"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    {isTrash && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRestore?.(doc); }}
                            className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-green-500/30"
                            title="Restaurar"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-3">
                <h3 className="truncate text-sm font-medium text-slate-900">{doc.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                    {doc.category && (
                        <span
                            className="rounded-md px-1.5 py-0.5 text-xs"
                            style={{ backgroundColor: `${doc.category.color}20`, color: doc.category.color }}
                        >
                            {doc.category.name}
                        </span>
                    )}
                    <span className="text-xs text-slate-500">{formatBytes(doc.fileSizeBytes)}</span>
                </div>

                {doc.expiryDate && (
                    <div className={`mt-2 inline-block rounded-md px-2 py-1 text-xs font-medium ${expiryClass}`}>
                        {days !== null && days < 0
                            ? 'Vencido'
                            : days !== null && days === 0
                                ? 'Vence hoy'
                                : `Vence en ${days} dias`}
                    </div>
                )}

                {doc.issueDate && doc.expiryDate && (
                    <div className="mt-2">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                                style={{
                                    width: `${Math.max(0, Math.min(100,
                                        ((Date.now() - new Date(doc.issueDate).getTime()) /
                                            (new Date(doc.expiryDate).getTime() - new Date(doc.issueDate).getTime())) * 100
                                    ))}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                <p className="mt-2 text-xs text-slate-500">{formatDate(doc.createdAt)}</p>
            </div>
        </div>
    );
}
