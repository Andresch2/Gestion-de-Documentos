import { daysUntil, formatBytes, formatDate, getExpiryColor, getFileIcon } from '@/lib/utils';
import type { Document } from '@/types';
import { Download, RotateCcw, Share2, Trash2 } from 'lucide-react';

interface Props {
    document: Document;
    onDownload?: (doc: Document) => void;
    onDelete?: (doc: Document) => void;
    onRestore?: (doc: Document) => void;
    onShare?: (doc: Document) => void;
    onView?: (doc: Document) => void;
    isTrash?: boolean;
}

export function DocumentCard({ document: doc, onDownload, onDelete, onRestore, onShare, onView, isTrash }: Props) {
    const days = daysUntil(doc.expiryDate);
    const expiryClass = getExpiryColor(days);
    const fileType = getFileIcon(doc.mimeType);

    return (
        <div
            className="group relative rounded-xl border border-border bg-[#171c27] hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer overflow-hidden"
            onClick={() => onView?.(doc)}
        >
            {/* Preview area */}
            <div
                className="h-32 flex items-center justify-center relative"
                style={{ backgroundColor: doc.category?.color ? `${doc.category.color}15` : '#1e2536' }}
            >
                <span className="text-4xl">{doc.category?.icon || '📄'}</span>

                {/* File type badge */}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/40 text-white/80 backdrop-blur-sm">
                    {fileType}
                </span>

                {/* Action buttons on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    {!isTrash && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDownload?.(doc); }}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Descargar"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onShare?.(doc); }}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Compartir"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete?.(doc); }}
                                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/30 text-white transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    {isTrash && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRestore?.(doc); }}
                            className="p-2 rounded-lg bg-white/10 hover:bg-green-500/30 text-white transition-colors"
                            title="Restaurar"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="text-sm font-medium text-foreground truncate">{doc.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    {doc.category && (
                        <span
                            className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{ backgroundColor: `${doc.category.color}20`, color: doc.category.color }}
                        >
                            {doc.category.name}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">{formatBytes(doc.fileSizeBytes)}</span>
                </div>

                {/* Expiry badge */}
                {doc.expiryDate && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded-md inline-block font-medium ${expiryClass}`}>
                        {days !== null && days < 0
                            ? 'Vencido'
                            : days !== null && days === 0
                                ? 'Vence hoy'
                                : `Vence en ${days} días`}
                    </div>
                )}

                {/* Life progress bar */}
                {doc.issueDate && doc.expiryDate && (
                    <div className="mt-2">
                        <div className="w-full h-1 rounded-full bg-slate-700 overflow-hidden">
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

                <p className="text-xs text-muted-foreground mt-2">{formatDate(doc.createdAt)}</p>
            </div>
        </div>
    );
}
