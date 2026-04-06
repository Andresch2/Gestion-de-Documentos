import { useCategories } from '@/hooks/useCategories';
import { useUploadDocument } from '@/hooks/useDocuments';
import { formatBytes } from '@/lib/utils';
import { File as FileIcon, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
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

    const onDrop = useCallback((files: File[]) => {
        if (files[0]) {
            setFile(files[0]);
            if (!name) setName(files[0].name.replace(/\.[^.]+$/, ''));
        }
    }, [name]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
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
            onClose();
            // Reset form
            setFile(null); setName(''); setCategoryId(''); setDescription('');
            setExpiryDate(''); setIssueDate(''); setIssuingAuthority('');
            setDocumentNumber(''); setTags([]); setProgress(0);
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-2xl shadow-2xl animate-fade-in m-4">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-lg font-semibold">Subir Documento</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Drop zone */}
                    {!file ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-blue-500/50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOCX (máx. 25MB)</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                            <FileIcon className="w-8 h-8 text-blue-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                            </div>
                            <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-accent rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Form fields */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre *</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required
                            className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Categoría</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option value="">Sin categoría</option>
                            {categories?.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha emisión</label>
                            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha vencimiento</label>
                            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Entidad emisora</label>
                            <input value={issuingAuthority} onChange={(e) => setIssuingAuthority(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Número de documento</label>
                            <input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
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
                            className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>

                    {/* Progress bar */}
                    {upload.isPending && progress > 0 && (
                        <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!file || !name || upload.isPending}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
                    >
                        {upload.isPending ? `Subiendo... ${progress}%` : 'Subir Documento'}
                    </button>
                </form>
            </div>
        </div>
    );
}
