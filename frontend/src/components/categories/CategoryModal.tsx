import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useCategories, useCreateCategory } from '@/hooks/useCategories';
import { Folder, Home, Receipt, Scale, Shield, Heart, Briefcase, Car, GraduationCap, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const categoryIcons = [
    'Folder',
    'Home',
    'Receipt',
    'Scale',
    'Shield',
    'Heart',
    'Briefcase',
    'Car',
    'GraduationCap',
];

const previewIcons = [Folder, Home, Receipt, Scale, Shield, Heart, Briefcase, Car, GraduationCap];

export function CategoryModal({ isOpen, onClose }: Props) {
    const createCategory = useCreateCategory();
    const { data: categories } = useCategories();
    const [name, setName] = useState('');
    const [color, setColor] = useState('#4f8ef7');
    const [icon, setIcon] = useState('Folder');
    const [parentId, setParentId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setName('');
        setColor('#4f8ef7');
        setIcon('Folder');
        setParentId('');
        setError('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await createCategory.mutateAsync({
                name: name.trim(),
                color,
                icon,
                parentId: parentId || undefined,
            });
            onClose();
        } catch (err: any) {
            const message = err?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(', ') : message || 'No se pudo crear la categoria');
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Nueva categoria</h2>
                        <p className="text-sm text-slate-500">Crea una categoria personalizada para tus documentos.</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 px-4 py-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-xl border"
                                style={{ backgroundColor: `${color}18`, color, borderColor: `${color}40` }}
                            >
                                <CategoryIcon name={icon} className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{name.trim() || 'Nueva categoria'}</p>
                                <p className="text-xs text-slate-500">Vista previa</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            placeholder="Ej: Impuestos"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Categoría padre (Opcional)</label>
                        <select
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                        >
                            <option value="">Sin categoría padre</option>
                            {categories?.filter((c) => !c.parentId).map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Color</label>
                            <input
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                            />
                        </div>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-10 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Icono</label>
                        <div className="grid grid-cols-5 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            {categoryIcons.map((iconName, index) => {
                                const PreviewIcon = previewIcons[index];

                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setIcon(iconName)}
                                        className={`flex h-10 w-full items-center justify-center rounded-xl border transition-colors ${icon === iconName
                                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                            }`}
                                        title={iconName}
                                    >
                                        <PreviewIcon className="h-4 w-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || createCategory.isPending}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createCategory.isPending ? 'Creando...' : 'Crear categoria'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
