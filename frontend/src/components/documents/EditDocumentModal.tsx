import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useCategories } from '@/hooks/useCategories';
import { useUpdateDocument } from '@/hooks/useDocuments';
import type { Document as AppDocument } from '@/types';
import { Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    document: AppDocument | null;
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

    useEffect(() => {
        if (!doc) return;
        setName(doc.name || '');
        setCategoryId(doc.categoryId || '');
        setDescription(doc.description || '');
        setExpiryDate(doc.expiryDate ? `${doc.expiryDate}`.split('T')[0] : '');
        setIssueDate(doc.issueDate ? `${doc.issueDate}`.split('T')[0] : '');
        setIssuingAuthority(doc.issuingAuthority || '');
        setDocumentNumber(doc.documentNumber || '');
        setTags(doc.tags?.map((tag) => tag.name) || []);
        setTagsInput('');
        setSuccessMsg('');
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
        if (!doc || !name.trim()) return;

        const data: Record<string, any> = {
            name: name.trim(),
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
            setTimeout(() => onClose(), 800);
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    if (!isOpen || !doc) return null;

    const inputClass =
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" onClick={onClose} />
            <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4 text-blue-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Editar documento</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 px-4 py-4">
                    {successMsg && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-700">
                            {successMsg}
                        </div>
                    )}

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600">
                            <CategoryIcon name={doc.category?.icon || 'FileText'} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500">Archivo original</p>
                            <p className="truncate text-sm font-medium text-slate-800">{doc.originalName}</p>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Nombre *</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                            <option value="">Sin categoria</option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha emision</label>
                            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha vencimiento</label>
                            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Entidad emisora</label>
                            <input value={issuingAuthority} onChange={(e) => setIssuingAuthority(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Numero de documento</label>
                            <input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Descripcion</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                                <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                    {tag}
                                    <button type="button" onClick={() => setTags(tags.filter((value) => value !== tag))}>
                                        <X className="h-3 w-3" />
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
                        disabled={!name.trim() || updateDoc.isPending}
                        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {updateDoc.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
