import { usersApi } from '@/api/notifications.api';
import { formatBytes } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Activity, AlertTriangle, Bell, Briefcase, Camera, Car, Check, CreditCard, Download, FileText, Files, Fingerprint, Folder, FolderOpen, Globe, GraduationCap, HardDrive, Heart, Music, Pencil, Plane, Plus, Receipt, Scale, Settings, Shield, ShoppingBag, Trophy, Trash2, User, Utensils, X, Zap } from 'lucide-react';
import { useState } from 'react';

export function SettingsPage() {
    const user = useAuthStore((s) => s.user);
    const updateUser = useAuthStore((s) => s.updateUser);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileMsg, setProfileMsg] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Notification prefs
    const [emailExpiry, setEmailExpiry] = useState(() => localStorage.getItem('notif-expiry') !== 'false');
    const [emailUpload, setEmailUpload] = useState(() => localStorage.getItem('notif-upload') !== 'false');
    const [emailShare, setEmailShare] = useState(() => localStorage.getItem('notif-share') !== 'false');

    // Categories state
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();

    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [catName, setCatName] = useState('');
    const [catColor, setCatColor] = useState('#4f8ef7');
    const [catIcon, setCatIcon] = useState('Folder');
    const [isAdding, setIsAdding] = useState(false);

    const availableIcons = [
        'Folder', 'Files', 'FileText', 'Fingerprint', 'Receipt', 'CreditCard',
        'Activity', 'Heart', 'Shield', 'Zap', 'Scale', 'Briefcase', 'GraduationCap',
        'Home', 'Car', 'Plane', 'ShoppingBag', 'Utensils', 'Camera', 'Globe', 'Trophy', 'Music'
    ];

    const handleSaveProfile = async () => {
        setProfileLoading(true);
        try {
            const { data } = await usersApi.updateMe({ name, email });
            const result = data.data || data;
            updateUser({ name: result.name, email: result.email });
            setProfileMsg('Perfil actualizado exitosamente');
            setTimeout(() => setProfileMsg(''), 3000);
        } catch (err: any) {
            setProfileMsg(err.response?.data?.message || 'Error al actualizar');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordMsg('Las contraseñas no coinciden');
            return;
        }
        setPasswordLoading(true);
        try {
            await usersApi.changePassword({ currentPassword, newPassword });
            setPasswordMsg('Contraseña actualizada');
            setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
            setTimeout(() => setPasswordMsg(''), 3000);
        } catch (err: any) {
            setPasswordMsg(err.response?.data?.message || 'Error al cambiar contraseña');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!catName) return;
        try {
            await createCategory.mutateAsync({ name: catName, color: catColor, icon: catIcon });
            setCatName('');
            setIsAdding(false);
        } catch (err) {
            console.error('Failed to create category:', err);
        }
    };

    const handleUpdateCategory = async (id: string) => {
        if (!catName) return;
        try {
            await updateCategory.mutateAsync({ id, data: { name: catName, color: catColor, icon: catIcon } });
            setEditingCatId(null);
            setCatName('');
        } catch (err) {
            console.error('Failed to update category:', err);
        }
    };

    const startEdit = (cat: any) => {
        setEditingCatId(cat.id);
        setCatName(cat.name);
        setCatColor(cat.color);
        setCatIcon(cat.icon);
    };

    const cancelEdit = () => {
        setEditingCatId(null);
        setCatName('');
        setIsAdding(false);
    };

    const handleExport = async () => {
        try {
            const { data } = await usersApi.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gestordoc-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'categories', label: 'Categorías', icon: FolderOpen },
        { id: 'security', label: 'Seguridad', icon: Shield },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'storage', label: 'Almacenamiento', icon: HardDrive },
    ];

    const usedBytes = parseInt(user?.storageUsedBytes || '0', 10);
    const quotaBytes = parseInt(user?.storageQuotaBytes || '1073741824', 10);
    const usagePercent = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;

    return (
        <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6" /> Configuración
            </h1>

            {/* Tab bar */}
            <div className="flex gap-1 rounded-lg bg-card/50 p-1 border border-border">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-500/15 text-blue-400' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile */}
            {activeTab === 'profile' && (
                <div className="p-6 rounded-xl border border-border bg-card/50 space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">{user?.name}</h2>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Nombre</label>
                        <input value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>

                    {profileMsg && <p className={`text-sm ${profileMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{profileMsg}</p>}

                    <button onClick={handleSaveProfile} disabled={profileLoading}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all">
                        {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            )}

            {/* Categories */}
            {activeTab === 'categories' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Tus Categorías</h2>
                        {!isAdding && (
                            <button
                                onClick={() => { setIsAdding(true); setCatName(''); setCatColor('#4f8ef7'); setCatIcon('Folder'); }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Nueva Categoría
                            </button>
                        )}
                    </div>

                    {(isAdding || editingCatId) && (
                        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-sm font-medium">{isAdding ? 'Crear Nueva Categoría' : 'Editar Categoría'}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1">
                                    <label className="block text-xs text-muted-foreground mb-1">Nombre</label>
                                    <input
                                        value={catName}
                                        onChange={(e) => setCatName(e.target.value)}
                                        placeholder="Ej: Finanzas"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={catColor}
                                            onChange={(e) => setCatColor(e.target.value)}
                                            className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                                        />
                                        <span className="text-xs font-mono text-muted-foreground uppercase">{catColor}</span>
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-xs text-muted-foreground mb-2">Seleccionar Icono Profesional</label>
                                    <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                                        {availableIcons.map((iconName) => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setCatIcon(iconName)}
                                                className={`p-2 rounded-md transition-all flex items-center justify-center ${catIcon === iconName ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800 text-muted-foreground hover:text-white hover:bg-slate-700'}`}
                                                title={iconName}
                                            >
                                                <CategoryIcon name={iconName} className="w-4 h-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={cancelEdit}
                                    className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => isAdding ? handleCreateCategory() : handleUpdateCategory(editingCatId!)}
                                    disabled={!catName}
                                    className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                >
                                    {isAdding ? 'Crear' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoriesLoading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 rounded-xl border border-border bg-card/50 animate-pulse" />
                            ))
                        ) : categories?.length === 0 ? (
                            <div className="sm:col-span-2 text-center py-8 text-muted-foreground">
                                <p>No has creado categorías personalizadas todavía.</p>
                            </div>
                        ) : (
                            categories?.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="p-3 rounded-xl border border-border bg-card/50 flex items-center justify-between group hover:border-blue-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                                                style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40`, color: cat.color }}
                                            >
                                                <CategoryIcon name={cat.icon} className="w-5 h-5" />
                                            </div>
                                        <div>
                                            <p className="text-sm font-medium">{cat.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {cat._count?.documents || 0} documentos
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(cat)}
                                            className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-400 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('¿Eliminar esta categoría?')) deleteCategory.mutate(cat.id); }}
                                            className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
                <div className="p-6 rounded-xl border border-border bg-card/50 space-y-4">
                    <h2 className="text-lg font-semibold">Cambiar Contraseña</h2>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Contraseña actual</label>
                        <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password"
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Nueva contraseña</label>
                        <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password"
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Confirmar nueva contraseña</label>
                        <input value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} type="password"
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>

                    {passwordMsg && <p className={`text-sm ${passwordMsg.includes('Error') || passwordMsg.includes('coinciden') ? 'text-red-400' : 'text-green-400'}`}>{passwordMsg}</p>}

                    <button onClick={handleChangePassword} disabled={passwordLoading}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all">
                        {passwordLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>

                    <div className="mt-6 p-4 rounded-lg bg-accent/30 border border-border">
                        <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-blue-400" /> Autenticación de dos factores
                        </h3>
                        <p className="text-xs text-muted-foreground">Próximamente disponible</p>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
                <div className="p-6 rounded-xl border border-border bg-card/50 space-y-4">
                    <h2 className="text-lg font-semibold">Preferencias de Notificación</h2>

                    {[
                        { label: 'Vencimiento de documentos', desc: 'Recibir alertas cuando tus documentos estén por vencer', state: emailExpiry, key: 'notif-expiry', setter: setEmailExpiry },
                        { label: 'Subida exitosa', desc: 'Notificar cuando se suba un documento correctamente', state: emailUpload, key: 'notif-upload', setter: setEmailUpload },
                        { label: 'Acceso a links compartidos', desc: 'Notificar cuando alguien acceda a un link compartido', state: emailShare, key: 'notif-share', setter: setEmailShare },
                    ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors">
                            <div>
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={item.state}
                                onChange={(e) => {
                                    item.setter(e.target.checked);
                                    localStorage.setItem(item.key, String(e.target.checked));
                                }}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                            />
                        </label>
                    ))}
                </div>
            )}

            {/* Storage */}
            {activeTab === 'storage' && (
                <div className="space-y-4">
                    <div className="p-6 rounded-xl border border-border bg-card/50 space-y-4">
                        <h2 className="text-lg font-semibold">Uso de Almacenamiento</h2>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>{formatBytes(usedBytes)} usado</span>
                                <span>{formatBytes(quotaBytes)} total</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{usagePercent.toFixed(1)}% utilizado</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border border-border bg-card/50 space-y-3">
                        <h2 className="text-lg font-semibold">Exportar Datos</h2>
                        <p className="text-sm text-muted-foreground">Descarga todos tus metadatos de documentos en formato JSON</p>
                        <button onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" /> Exportar Datos
                        </button>
                    </div>

                    <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                        <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Zona de Peligro
                        </h2>
                        <p className="text-sm text-muted-foreground">Acciones irreversibles que afectan tu cuenta</p>
                        <button
                            onClick={() => {
                                const confirm1 = prompt('Escribe "ELIMINAR" para confirmar');
                                if (confirm1 !== 'ELIMINAR') return;
                                alert('Función no implementada en MVP');
                            }}
                            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
                        >
                            Eliminar Cuenta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
