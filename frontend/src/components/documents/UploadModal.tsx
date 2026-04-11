import { useCategories } from '@/hooks/useCategories';
import { useUploadDocument } from '@/hooks/useDocuments';
import { formatBytes } from '@/lib/utils';
import { File as FileIcon, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialFile?: File;
}

export function UploadModal({ isOpen, onClose, initialFile }: Props) {
    const [file, setFile] = useState<File | null>(initialFile || null);
    const [name, setName] = useState(initialFile ? initialFile.name.replace(/\.[^.]+$/, '') : '');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [issuingAuthority, setIssuingAuthority] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const upload = useUploadDocument();
    const { data: categories } = useCategories();

    useEffect(() => {
        if (!isOpen) return;
        setFile(initialFile || null);
        setName(initialFile ? initialFile.name.replace(/\.[^.]+$/, '') : '');
    }, [initialFile, isOpen]);

    const onDrop = useCallback((files: File[]) => {
        if (files[0]) {
            setFile(files[0]);
            setName((currentName) => currentName || files[0].name.replace(/\.[^.]+$/, ''));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 25 * 1024 * 1024,
        multiple: false,
    });

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagsInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagsInput.trim())) {
                setTags([...tags, tagsInput.trim()]);
            }
            setTagsInput('');
        }
    };

    const resetForm = () => {
        setFile(null);
        setName('');
        setCategoryId('');
        setDescription('');
        setExpiryDate('');
        setIssueDate('');
        setIssuingAuthority('');
        setDocumentNumber('');
        setTagsInput('');
        setTags([]);
        setProgress(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name.trim()) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name.trim());
        if (categoryId) formData.append('categoryId', categoryId);
        if (description) formData.append('description', description);
        if (expiryDate) formData.append('expiryDate', expiryDate);
        if (issueDate) formData.append('issueDate', issueDate);
        if (issuingAuthority) formData.append('issuingAuthority', issuingAuthority);
        if (documentNumber) formData.append('documentNumber', documentNumber);
        if (tags.length) formData.append('tags', JSON.stringify(tags));

        try {
            await upload.mutateAsync({
                formData,
                onProgress: setProgress,
            });
            resetForm();
            onClose();
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const handleClose = () => {
        if (upload.isPending) return;
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
                    <h2 className="text-lg font-semibold text-slate-900">Subir documento</h2>
                    <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 px-4 py-4">
                    {!file ? (
                        <div
                            {...getRootProps()}
                            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${isDragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                            <p className="text-sm text-slate-600">
                                {isDragActive ? 'Suelta el archivo aqui' : 'Arrastra un archivo o haz clic para seleccionar'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG, DOCX (max. 25MB)</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <FileIcon className="h-8 w-8 text-blue-600" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                            </div>
                            <button type="button" onClick={() => setFile(null)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-200">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Nombre *</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">Sin categoria</option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha emision</label>
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha vencimiento</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Entidad emisora</label>
                            <input
                                value={issuingAuthority}
                                onChange={(e) => setIssuingAuthority(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Numero de documento</label>
                            <input
                                value={documentNumber}
                                onChange={(e) => setDocumentNumber(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Descripcion</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {upload.isPending && progress > 0 && (
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!file || !name.trim() || upload.isPending}
                        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {upload.isPending ? `Subiendo... ${progress}%` : 'Subir documento'}
                    </button>
                </form>
            </div>
        </div>
    );
}
