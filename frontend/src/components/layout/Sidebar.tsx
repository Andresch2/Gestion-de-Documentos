import { authApi } from '@/api/auth.api';
import { sharedLinksApi } from '@/api/shared-links.api';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { useCategories } from '@/hooks/useCategories';
import { useDocumentStats } from '@/hooks/useDocuments';
import { formatBytes } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Clock, Folder, LayoutDashboard, LogOut, Search, Settings, Share2, Trash2 } from 'lucide-react';
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
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
    };

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
                    <div className="flex flex-col space-y-0.5">
                        {(() => {
                            const rootCategories = categories?.filter((c) => !c.parentId) || [];
                            const childrenByParent = categories?.reduce((acc, cat) => {
                                if (cat.parentId) {
                                    if (!acc[cat.parentId]) acc[cat.parentId] = [];
                                    acc[cat.parentId].push(cat);
                                }
                                return acc;
                            }, {} as Record<string, typeof categories>) || {};

                            const validParentIds = new Set(rootCategories.map(c => c.id));
                            const orphanChildren = categories?.filter(c => c.parentId && !validParentIds.has(c.parentId)) || [];
                            const allRoots = [...rootCategories, ...orphanChildren];

                            return allRoots.map((parent, idx) => {
                                const children = childrenByParent[parent.id] || [];
                                const hasChildren = children.length > 0;
                                const isExpanded = expandedCategories[parent.id];
                                
                                return (
                                    <div key={parent.id} className="flex flex-col space-y-0.5">
                                        <NavLink
                                            to={`/search?categoryId=${parent.id}`}
                                            className={`flex items-center gap-2 rounded-xl py-2 px-2 text-[13px] transition-colors ${
                                                location.pathname === '/search' && activeCategoryId === parent.id
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div 
                                                onClick={(e) => {
                                                    if (hasChildren) toggleCategory(e, parent.id);
                                                }}
                                                className={`flex items-center justify-center w-5 h-5 rounded cursor-pointer transition-colors ${
                                                    hasChildren 
                                                        ? 'hover:bg-slate-200/50 text-slate-500' 
                                                        : 'opacity-0 pointer-events-none'
                                                }`}
                                            >
                                                {hasChildren && (isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
                                            </div>

                                            <span
                                                className="w-2 h-2 rounded-full hidden sm:block shrink-0 -ml-1"
                                                style={{ backgroundColor: parent.color || fallbackCategoryColors[idx % fallbackCategoryColors.length] }}
                                            />
                                            <span className="font-medium truncate">{parent.name}</span>
                                            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shrink-0">
                                                {parent._count?.documents || 0}
                                            </span>
                                        </NavLink>
                                        
                                        {isExpanded && children.map((child, childIdx) => (
                                            <NavLink
                                                key={child.id}
                                                to={`/search?categoryId=${child.id}`}
                                                className={`flex items-center gap-2 rounded-xl py-2 px-2 pl-9 text-[13px] transition-colors ${
                                                    location.pathname === '/search' && activeCategoryId === child.id
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-slate-700 hover:bg-slate-100'
                                                }`}
                                            >
                                                <span className="text-slate-300 shrink-0 w-3.5">↳</span>
                                                <span
                                                    className="w-2 h-2 rounded-full hidden sm:block shrink-0 -ml-1"
                                                    style={{ backgroundColor: child.color || fallbackCategoryColors[(idx + childIdx + 1) % fallbackCategoryColors.length] }}
                                                />
                                                <span className="font-medium opacity-80 truncate">{child.name}</span>
                                                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shrink-0">
                                                    {child._count?.documents || 0}
                                                </span>
                                            </NavLink>
                                        ))}
                                    </div>
                                );
                            });
                        })()}
                    </div>
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-500 text-xs font-semibold text-white overflow-hidden shrink-0">
                        {user?.avatarUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL}/users/${user.id}/avatar?t=${new Date().getTime()}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
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
