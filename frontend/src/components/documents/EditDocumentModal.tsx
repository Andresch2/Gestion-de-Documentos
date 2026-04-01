import { useCategories } from '@/hooks/useCategories';
import { useUpdateDocument } from '@/hooks/useDocuments';
import type { Document } from '@/types';
import { Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    document: Document | null;
    isOpen: boolean;
    onClose: () => void;
}

export function EditDocumentModal({ document: doc, isOpen, onClose }: Props) {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [issuingAuthority, setIssuingAuthority] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [successMsg, setSuccessMsg] = useState('');

    const updateDoc = useUpdateDocument();
    const { data: categories } = useCategories();

    // Populate form when document changes
    useEffect(() => {
        if (doc) {
            setName(doc.name || '');
            setCategoryId(doc.categoryId || '');
            setDescription(doc.description || '');
            setExpiryDate(doc.expiryDate ? doc.expiryDate.split('T')[0] : '');
            setIssueDate(doc.issueDate ? doc.issueDate.split('T')[0] : '');
            setIssuingAuthority(doc.issuingAuthority || '');
            setDocumentNumber(doc.documentNumber || '');
            setTags(doc.tags?.map((t) => t.name) || []);
            setSuccessMsg('');
        }
    }, [doc]);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagsInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagsInput.trim())) {
                setTags([...tags, tagsInput.trim()]);
            }
            setTagsInput('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doc || !name) return;

        const data: Record<string, any> = {
            name,
            categoryId: categoryId || null,
            description: description || null,
            issuingAuthority: issuingAuthority || null,
            documentNumber: documentNumber || null,
            tags,
        };

        if (issueDate) data.issueDate = issueDate;
        if (expiryDate) data.expiryDate = expiryDate;

        try {
            await updateDoc.mutateAsync({ id: doc.id, data });
            setSuccessMsg('Documento actualizado exitosamente');
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    if (!isOpen || !doc) return null;

    const inputClass = 'w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-2xl shadow-2xl animate-fade-in m-4">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-400" />
                        <h2 className="text-lg font-semibold">Editar Documento</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Success message */}
                    {successMsg && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium text-center">
                            {successMsg}
                        </div>
                    )}

                    {/* Original file info (read-only) */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border">
                        <span className="text-2xl">{doc.category?.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Archivo original</p>
                            <p className="text-sm font-medium truncate">{doc.originalName}</p>
                        </div>
                    </div>

                    {/* Form fields */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre *</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Categoría</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                            <option value="">Sin categoría</option>
                            {categories?.map((c) => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha emisión</label>
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha vencimiento</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Entidad emisora</label>
                            <input
                                value={issuingAuthority}
                                onChange={(e) => setIssuingAuthority(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Número de documento</label>
                            <input
                                value={documentNumber}
                                onChange={(e) => setDocumentNumber(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tags</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {tags.map((t) => (
                                <span key={t} className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center gap-1">
                                    {t}
                                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Escribe y presiona Enter"
                            className={inputClass}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name || updateDoc.isPending}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
                    >
                        {updateDoc.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
