import { authApi } from '@/api/auth.api';
import { sharedLinksApi } from '@/api/shared-links.api';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { useCategories } from '@/hooks/useCategories';
import { useDocumentStats } from '@/hooks/useDocuments';
import { formatBytes } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { Clock, Folder, LayoutDashboard, LogOut, Search, Settings, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Inicio', end: true, key: 'home' },
    { to: '/search', icon: Search, label: 'Busqueda', key: 'search' },
    { to: '/expiring', icon: Clock, label: 'Por vencer', key: 'expiring' },
    { to: '/shared', icon: Share2, label: 'Compartidos', key: 'shared' },
    { to: '/trash', icon: Trash2, label: 'Papelera', key: 'trash' },
];

const fallbackCategoryColors = ['#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#ea580c'];

export function Sidebar() {
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const { data: categories } = useCategories();
    const { data: stats } = useDocumentStats();
    const { data: sharedLinks = [] } = useQuery({
        queryKey: ['shared-links'],
        queryFn: async () => {
            const { data } = await sharedLinksApi.getAll();
            return (data.data || data) as Array<{ id: string }>;
        },
    });

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch { }
        logout();
        navigate('/login');
    };

    const usedBytes = parseInt(user?.storageUsedBytes || '0', 10);
    const quotaBytes = parseInt(user?.storageQuotaBytes || '1073741824', 10);
    const usagePercent = quotaBytes > 0 ? Math.min(100, (usedBytes / quotaBytes) * 100) : 0;
    const visibleUsagePercent = usedBytes > 0 ? Math.max(usagePercent, 2) : 0;

    const badges: Record<string, number> = {
        home: stats?.totalDocs || 0,
        search: stats?.totalDocs || 0,
        expiring: stats?.expiringDocs || 0,
        shared: sharedLinks.length,
        trash: stats?.deletedDocs || 0,
    };
    const activeCategoryId = new URLSearchParams(location.search).get('categoryId');

    return (
        <aside className="flex w-[278px] flex-col border-r border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-500/20">
                        <Folder className="h-[18px] w-[18px] text-white" />
                    </div>
                    <div>
                        <p className="text-[1.75rem] leading-none font-extrabold tracking-tight text-slate-900">GestorDoc</p>
                        <p className="text-[13px] text-slate-600">Documentos Importantes</p>
                    </div>
                </div>
            </div>

            <nav className="space-y-1 overflow-y-auto px-3 py-3.5">
                <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Principal</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'text-slate-700 border-transparent hover:bg-slate-100 hover:text-slate-900'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                            {badges[item.key] || 0}
                        </span>
                    </NavLink>
                ))}

                <div className="pt-4">
                    <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Categorias</p>
                    {(() => {
                        const organized = categories?.filter((c) => !c.parentId).map((parent) => [
                            parent,
                            ...(categories?.filter((c) => c.parentId === parent.id) || [])
                        ]).flat() || [];

                        const orphanIds = organized.map(c => c.id);
                        const orphans = categories?.filter(c => !orphanIds.includes(c.id)) || [];
                        const allToRender = [...organized, ...orphans];

                        return allToRender.map((cat, idx) => (
                            <NavLink
                                key={cat.id}
                                to={`/search?categoryId=${cat.id}`}
                                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] transition-colors ${location.pathname === '/search' && activeCategoryId === cat.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-700 hover:bg-slate-100'
                                    } ${cat.parentId ? 'pl-8' : ''}`}
                            >
                                {cat.parentId && <span className="text-slate-400">↳</span>}
                                <span
                                    className="w-2 h-2 rounded-full hidden sm:block"
                                    style={{ backgroundColor: cat.color || fallbackCategoryColors[idx % fallbackCategoryColors.length] }}
                                />
                                <span className={`font-medium ${cat.parentId ? 'opacity-80' : ''}`}>{cat.name}</span>
                                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                    {cat._count?.documents || 0}
                                </span>
                            </NavLink>
                        ));
                    })()}
                    <button
                        onClick={() => setCategoryModalOpen(true)}
                        className="w-full rounded-xl px-3.5 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                        + Nueva categoria
                    </button>
                </div>
            </nav>

            <div className="mt-auto border-t border-slate-200 px-4 py-3.5">
                <div className="mb-2 flex items-center justify-between text-[13px] text-slate-600">
                    <span>Almacenamiento</span>
                    <span>{formatBytes(usedBytes)} / {formatBytes(quotaBytes)}</span>
                </div>
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500"
                        style={{ width: `${visibleUsagePercent}%` }}
                    />
                </div>

                <div className="flex items-center gap-3 px-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-500 text-xs font-semibold text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-900">{user?.name}</p>
                        <p className="truncate text-[11px] text-slate-500">Plan Gratuito</p>
                    </div>
                    <button
                        onClick={() => navigate('/settings')}
                        className={`rounded-lg p-1.5 transition-colors ${location.pathname === '/settings'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                        title="Configuracion"
                        aria-label="Abrir configuracion"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Cerrar sesion"
                        aria-label="Cerrar sesion"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <CategoryModal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
        </aside>
    );
}
