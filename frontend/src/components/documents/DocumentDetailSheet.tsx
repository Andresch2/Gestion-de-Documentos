import { daysUntil, formatBytes, formatDate, getExpiryColor } from '@/lib/utils';
import type { Document } from '@/types';
import { Building, Calendar, Download, FileText, Hash, Share2, Trash2, X } from 'lucide-react';

interface Props {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
    onDownload?: (doc: Document) => void;
    onDelete?: (doc: Document) => void;
    onShare?: (doc: Document) => void;
}

export function DocumentDetailSheet({ document: doc, isOpen, onClose, onDownload, onDelete, onShare }: Props) {
    if (!isOpen || !doc) return null;

    const days = daysUntil(doc.expiryDate);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl animate-slide-in overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
                    <h2 className="text-lg font-semibold truncate">{doc.name}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Preview area */}
                <div
                    className="h-48 flex items-center justify-center"
                    style={{ backgroundColor: doc.category?.color ? `${doc.category.color}15` : '#1e2536' }}
                >
                    <span className="text-6xl">{doc.category?.icon || '📄'}</span>
                </div>

                {/* Actions */}
                <div className="p-5 flex gap-2 border-b border-border">
                    <button
                        onClick={() => onDownload?.(doc)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium"
                    >
                        <Download className="w-4 h-4" /> Descargar
                    </button>
                    <button
                        onClick={() => onShare?.(doc)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium"
                    >
                        <Share2 className="w-4 h-4" /> Compartir
                    </button>
                    <button
                        onClick={() => onDelete?.(doc)}
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4">
                    {doc.category && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: `${doc.category.color}20`, color: doc.category.color }}>
                                {doc.category.icon} {doc.category.name}
                            </span>
                        </div>
                    )}

                    {doc.description && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                            <p className="text-sm">{doc.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-accent/30">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Tamaño</p>
                            <p className="text-sm font-medium">{formatBytes(doc.fileSizeBytes)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-accent/30">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Creado</p>
                            <p className="text-sm font-medium">{formatDate(doc.createdAt)}</p>
                        </div>
                    </div>

                    {(doc.issueDate || doc.expiryDate) && (
                        <div className="grid grid-cols-2 gap-3">
                            {doc.issueDate && (
                                <div className="p-3 rounded-lg bg-accent/30">
                                    <p className="text-xs text-muted-foreground mb-1">Emisión</p>
                                    <p className="text-sm font-medium">{formatDate(doc.issueDate)}</p>
                                </div>
                            )}
                            {doc.expiryDate && (
                                <div className={`p-3 rounded-lg ${getExpiryColor(days)}`}>
                                    <p className="text-xs opacity-70 mb-1">Vencimiento</p>
                                    <p className="text-sm font-bold">{formatDate(doc.expiryDate)}</p>
                                    {days !== null && (
                                        <p className="text-xs mt-1 font-medium">{days < 0 ? 'Vencido' : `${days} días restantes`}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {doc.issuingAuthority && (
                        <div className="p-3 rounded-lg bg-accent/30">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Building className="w-3 h-3" /> Entidad emisora</p>
                            <p className="text-sm font-medium">{doc.issuingAuthority}</p>
                        </div>
                    )}

                    {doc.documentNumber && (
                        <div className="p-3 rounded-lg bg-accent/30">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Número</p>
                            <p className="text-sm font-medium font-mono">{doc.documentNumber}</p>
                        </div>
                    )}

                    {doc.tags.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {doc.tags.map((t) => (
                                    <span key={t.id} className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
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
