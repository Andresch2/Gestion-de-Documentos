import { usersApi } from '@/api/users.api';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories';
import { formatBytes } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { Category, User } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Bell, Download, FolderOpen, HardDrive, Pencil, Plus, Settings, Shield, Trash2, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type SettingsTab = 'profile' | 'categories' | 'security' | 'notifications' | 'storage';

const categoryIcons = [
    'Folder',
    'Receipt',
    'Briefcase',
    'Shield',
    'Heart',
    'Car',
    'Scale',
    'GraduationCap',
    'Home',
];

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof UserIcon }> = [
    { id: 'profile', label: 'Perfil', icon: UserIcon },
    { id: 'categories', label: 'Categorias', icon: FolderOpen },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'storage', label: 'Almacenamiento', icon: HardDrive },
];

function extractErrorMessage(err: any, fallback: string) {
    const message = err?.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || fallback;
}

export function SettingsPage() {
    const storedUser = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [name, setName] = useState(storedUser?.name || '');
    const [email, setEmail] = useState(storedUser?.email || '');
    const [profileMsg, setProfileMsg] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [emailExpiry, setEmailExpiry] = useState(() => localStorage.getItem('notif-expiry') !== 'false');
    const [emailUpload, setEmailUpload] = useState(() => localStorage.getItem('notif-upload') !== 'false');
    const [emailShare, setEmailShare] = useState(() => localStorage.getItem('notif-share') !== 'false');

    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [catName, setCatName] = useState('');
    const [catColor, setCatColor] = useState('#4f8ef7');
    const [catIcon, setCatIcon] = useState('Folder');
    const [catParentId, setCatParentId] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [categoryMsg, setCategoryMsg] = useState('');

    const { data: me } = useQuery({
        queryKey: ['users', 'me'],
        queryFn: async () => {
            const { data } = await usersApi.getMe();
            return (data.data || data) as User;
        },
    });

    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();

    useEffect(() => {
        if (!me) return;
        updateUser({
            name: me.name,
            email: me.email,
            storageUsedBytes: me.storageUsedBytes,
            storageQuotaBytes: me.storageQuotaBytes,
        });
        setName(me.name || '');
        setEmail(me.email || '');
    }, [me, updateUser]);

    const currentUser = me || storedUser;
    const usedBytes = Number(currentUser?.storageUsedBytes || 0);
    const quotaBytes = Number(currentUser?.storageQuotaBytes || 1073741824);
    const usagePercent = quotaBytes > 0 ? Math.min(100, (usedBytes / quotaBytes) * 100) : 0;

    const resetCategoryForm = () => {
        setEditingCatId(null);
        setIsAdding(false);
        setCatName('');
        setCatColor('#4f8ef7');
        setCatIcon('Folder');
        setCatParentId('');
        setCategoryMsg('');
    };

    const handleSaveProfile = async () => {
        setProfileLoading(true);
        setProfileMsg('');

        try {
            const { data } = await usersApi.updateMe({ name: name.trim(), email: email.trim() });
            const result = (data.data || data) as User;
            updateUser({
                name: result.name,
                email: result.email,
                storageUsedBytes: result.storageUsedBytes,
                storageQuotaBytes: result.storageQuotaBytes,
            });
            await queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
            setProfileMsg('Perfil actualizado correctamente');
        } catch (err) {
            setProfileMsg(extractErrorMessage(err, 'No se pudo actualizar el perfil'));
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordMsg('');

        if (newPassword !== confirmNewPassword) {
            setPasswordMsg('Las contrasenas no coinciden');
            return;
        }

        setPasswordLoading(true);
        try {
            await usersApi.changePassword({ currentPassword, newPassword });
            setPasswordMsg('Contrasena actualizada correctamente');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setPasswordMsg(extractErrorMessage(err, 'No se pudo cambiar la contrasena'));
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!catName.trim()) return;
        setCategoryMsg('');

        try {
            await createCategory.mutateAsync({
                name: catName.trim(),
                color: catColor,
                icon: catIcon,
                parentId: catParentId || undefined,
            });
            resetCategoryForm();
        } catch (err) {
            setCategoryMsg(extractErrorMessage(err, 'No se pudo crear la categoria'));
        }
    };

    const handleUpdateCategory = async (id: string) => {
        if (!catName.trim()) return;
        setCategoryMsg('');

        try {
            await updateCategory.mutateAsync({
                id,
                data: {
                    name: catName.trim(),
                    color: catColor,
                    icon: catIcon,
                    parentId: catParentId || undefined,
                },
            });
            resetCategoryForm();
        } catch (err) {
            setCategoryMsg(extractErrorMessage(err, 'No se pudo actualizar la categoria'));
        }
    };

    const handleDeleteCategory = async (category: Category) => {
        if (!confirm(`Eliminar la categoria "${category.name}"?`)) return;
        try {
            await deleteCategory.mutateAsync(category.id);
        } catch (err) {
            setCategoryMsg(extractErrorMessage(err, 'No se pudo eliminar la categoria'));
        }
    };

    const startEdit = (category: Category) => {
        setEditingCatId(category.id);
        setIsAdding(false);
        setCatName(category.name);
        setCatColor(category.color);
        setCatIcon(category.icon || 'Folder');
        setCatParentId(category.parentId || '');
        setCategoryMsg('');
    };

    const startCreate = () => {
        setIsAdding(true);
        setEditingCatId(null);
        setCatName('');
        setCatColor('#4f8ef7');
        setCatIcon('Folder');
        setCatParentId('');
        setCategoryMsg('');
    };

    const handleExport = async () => {
        try {
            const { data } = await usersApi.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gestordoc-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const savePreference = (key: string, value: boolean, setter: (value: boolean) => void) => {
        setter(value);
        localStorage.setItem(key, String(value));
    };

    const panelClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
    const inputClass =
        'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300';

    return (
        <div className="mx-auto max-w-[1080px] space-y-5">
            <div>
                <h1 className="flex items-center gap-2.5 text-[1.9rem] font-bold tracking-tight text-slate-900">
                    <Settings className="h-6 w-6 text-slate-400" />
                    Configuracion
                </h1>
                <p className="mt-1 text-sm text-slate-500">Administra tu perfil, categorias, seguridad y preferencias.</p>
            </div>

            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && (
                <div className={panelClass}>
                    <div className="mb-5 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-500 text-xl font-bold text-white">
                            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{currentUser?.name || 'Usuario'}</h2>
                            <p className="text-sm text-slate-500">{currentUser?.email || 'Sin correo'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="settings-profile-name" className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</label>
                            <input id="settings-profile-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="settings-profile-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                            <input id="settings-profile-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} />
                        </div>
                    </div>

                    {profileMsg && (
                        <p className={`mt-4 text-sm font-medium ${profileMsg.toLowerCase().includes('no se pudo') || profileMsg.toLowerCase().includes('error')
                            ? 'text-red-600'
                            : 'text-emerald-600'
                            }`}>
                            {profileMsg}
                        </p>
                    )}

                    <button
                        onClick={handleSaveProfile}
                        disabled={profileLoading}
                        className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {profileLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Tus categorias</h2>
                        {!isAdding && !editingCatId && (
                            <button
                                onClick={startCreate}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                            >
                                <Plus className="h-4 w-4" />
                                Nueva categoria
                            </button>
                        )}
                    </div>

                    {(isAdding || editingCatId) && (
                        <div className={`${panelClass} space-y-4`}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-slate-900">{isAdding ? 'Crear categoria' : 'Editar categoria'}</h3>
                                <button onClick={resetCategoryForm} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                                    Cancelar
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                                <div>
                                    <label htmlFor="settings-category-name" className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</label>
                                    <input
                                        id="settings-category-name"
                                        value={catName}
                                        onChange={(e) => setCatName(e.target.value)}
                                        placeholder="Ej: Impuestos"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Color</label>
                                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                        <input
                                            type="color"
                                            value={catColor}
                                            onChange={(e) => setCatColor(e.target.value)}
                                            className="h-9 w-11 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                                        />
                                        <span className="text-sm font-medium text-slate-600">{catColor}</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Categoría padre (Opcional)</label>
                                    <select
                                        value={catParentId}
                                        onChange={(e) => setCatParentId(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Sin categoría padre</option>
                                        {categories?.filter((c) => !c.parentId && c.id !== editingCatId).map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Icono</label>
                                <div className="grid grid-cols-5 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-9">
                                    {categoryIcons.map((iconName) => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setCatIcon(iconName)}
                                            className={`flex h-10 items-center justify-center rounded-xl border transition-colors ${catIcon === iconName
                                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                                }`}
                                            aria-label={`Seleccionar icono ${iconName}`}
                                        >
                                            <CategoryIcon name={iconName} className="h-4 w-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {categoryMsg && (
                                <p className={`text-sm font-medium ${categoryMsg.toLowerCase().includes('no se pudo') || categoryMsg.toLowerCase().includes('ya existe')
                                    ? 'text-red-600'
                                    : 'text-emerald-600'
                                    }`}>
                                    {categoryMsg}
                                </p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={() => (isAdding ? handleCreateCategory() : handleUpdateCategory(editingCatId!))}
                                    disabled={!catName.trim()}
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isAdding ? 'Crear categoria' : 'Guardar cambios'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-3 md:grid-cols-2">
                        {categoriesLoading ? (
                            [...Array(4)].map((_, index) => (
                                <div key={index} className="h-20 rounded-2xl border border-slate-200 bg-white animate-pulse" />
                            ))
                        ) : categories?.length ? (
                            (() => {
                                const organized = categories.filter((c) => !c.parentId).map((parent) => [
                                    parent,
                                    ...categories.filter((c) => c.parentId === parent.id)
                                ]).flat();

                                // Include any orphans if they somehow exist
                                const orphanIds = organized.map(c => c.id);
                                const orphans = categories.filter(c => !orphanIds.includes(c.id));
                                const allToRender = [...organized, ...orphans];

                                return allToRender.map((category) => (
                                    <div key={category.id} className={`${panelClass} flex items-center justify-between ${category.parentId ? 'ml-8 bg-slate-50 border-slate-200/60 shadow-none' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            {category.parentId && <span className="text-slate-400">↳</span>}
                                            <div
                                                className={`flex items-center justify-center rounded-2xl border ${category.parentId ? 'h-9 w-9' : 'h-11 w-11'}`}
                                                style={{
                                                    backgroundColor: `${category.color}18`,
                                                    color: category.color,
                                                    borderColor: `${category.color}40`,
                                                }}
                                            >
                                                <CategoryIcon name={category.icon || 'Folder'} className={`${category.parentId ? 'h-4 w-4' : 'h-5 w-5'}`} />
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-semibold text-slate-900">{category.name}</p>
                                                <p className="text-sm text-slate-500">{category._count?.documents || 0} documentos</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => startEdit(category)}
                                                className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                                title="Editar"
                                                aria-label={`Editar categoria ${category.name}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category)}
                                                className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
                                                title="Eliminar"
                                                aria-label={`Eliminar categoria ${category.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ));
                            })()
                        ) : (
                            <div className={`${panelClass} md:col-span-2 text-center`}>
                                <p className="text-sm text-slate-500">No tienes categorias personalizadas todavia.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className={panelClass}>
                    <h2 className="text-lg font-semibold text-slate-900">Cambiar contrasena</h2>
                    <div className="mt-5 space-y-4">
                        <div>
                            <label htmlFor="settings-current-password" className="mb-1.5 block text-sm font-medium text-slate-700">Contrasena actual</label>
                            <input id="settings-current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="settings-new-password" className="mb-1.5 block text-sm font-medium text-slate-700">Nueva contrasena</label>
                            <input id="settings-new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="settings-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirmar nueva contrasena</label>
                            <input id="settings-confirm-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} type="password" className={inputClass} />
                        </div>
                    </div>

                    {passwordMsg && (
                        <p className={`mt-4 text-sm font-medium ${passwordMsg.toLowerCase().includes('correctamente')
                            ? 'text-emerald-600'
                            : 'text-red-600'
                            }`}>
                            {passwordMsg}
                        </p>
                    )}

                    <button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {passwordLoading ? 'Actualizando...' : 'Cambiar contrasena'}
                    </button>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex items-center gap-2 text-slate-800">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-semibold">Autenticacion de dos factores</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">Proximamente disponible.</p>
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className={panelClass}>
                    <h2 className="text-lg font-semibold text-slate-900">Preferencias de notificacion</h2>
                    <div className="mt-5 space-y-3">
                        {[
                            {
                                key: 'notif-expiry',
                                label: 'Vencimiento de documentos',
                                desc: 'Recibir alertas cuando tus documentos esten por vencer',
                                value: emailExpiry,
                                setter: setEmailExpiry,
                            },
                            {
                                key: 'notif-upload',
                                label: 'Subida exitosa',
                                desc: 'Notificar cuando se suba un documento correctamente',
                                value: emailUpload,
                                setter: setEmailUpload,
                            },
                            {
                                key: 'notif-share',
                                label: 'Acceso a links compartidos',
                                desc: 'Notificar cuando alguien acceda a un link compartido',
                                value: emailShare,
                                setter: setEmailShare,
                            },
                        ].map((item) => (
                            <label key={item.key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <div className="pr-4">
                                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                                    <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={item.value}
                                    onChange={(e) => savePreference(item.key, e.target.checked, item.setter)}
                                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                />
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'storage' && (
                <div className="space-y-4">
                    <div className={panelClass}>
                        <h2 className="text-lg font-semibold text-slate-900">Uso de almacenamiento</h2>
                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                                <span>{formatBytes(usedBytes)} usado</span>
                                <span>{formatBytes(quotaBytes)} total</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className={`h-full rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
                                    style={{ width: `${usagePercent}%` }}
                                />
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{usagePercent.toFixed(1)}% utilizado</p>
                        </div>
                    </div>

                    <div className={panelClass}>
                        <h2 className="text-lg font-semibold text-slate-900">Exportar datos</h2>
                        <p className="mt-2 text-sm text-slate-500">Descarga todos tus metadatos de documentos en formato JSON.</p>
                        <button
                            onClick={handleExport}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                            <Download className="h-4 w-4" />
                            Exportar datos
                        </button>
                    </div>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Zona de peligro
                        </h2>
                        <p className="mt-2 text-sm text-red-500">La eliminacion de cuenta aun no esta habilitada en esta version.</p>
                        <button
                            disabled
                            className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-400 opacity-70"
                        >
                            Eliminar cuenta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
