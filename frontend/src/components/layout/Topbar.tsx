import { useNotifications, useReadAllNotifications, useReadNotification } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils';
import { Bell, Plus, Search, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const titleByPath: Record<string, string> = {
    '/': 'Mis Documentos',
    '/search': 'Busqueda',
    '/expiring': 'Por vencer',
    '/shared': 'Compartidos',
    '/trash': 'Papelera',
    '/notifications': 'Notificaciones',
    '/activity': 'Actividad',
    '/settings': 'Configuracion',
};

export function Topbar() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { data: notificationsData } = useNotifications();
    const readAll = useReadAllNotifications();
    const readOne = useReadNotification();

    const unreadCount = notificationsData?.unreadCount || 0;
    const notifications = notificationsData?.data || [];
    const title = titleByPath[location.pathname] || 'GestorDoc';
    const currentQuery = new URLSearchParams(location.search).get('q') || '';

    useEffect(() => {
        setSearchValue(currentQuery);
    }, [currentQuery]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const normalizedValue = searchValue.trim();
            const normalizedCurrent = currentQuery.trim();

            if (normalizedValue === normalizedCurrent) return;

            if (!normalizedValue) {
                if (location.pathname === '/search') {
                    navigate('/search', { replace: true });
                }
                return;
            }

            navigate(`/search?q=${encodeURIComponent(normalizedValue)}`, {
                replace: location.pathname === '/search',
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchValue, currentQuery, location.pathname, navigate]);

    const openUpload = () => {
        if (location.pathname === '/') {
            window.dispatchEvent(new CustomEvent('open-upload-modal'));
            return;
        }
        navigate('/?openUpload=1');
    };

    return (
        <header className="flex h-[70px] items-center gap-5 border-b border-slate-200/90 bg-white px-6">
            <h1 className="whitespace-nowrap text-[20px] font-extrabold tracking-tight text-slate-900">{title}</h1>

            <div className="relative w-full max-w-[380px]">
                <label htmlFor="topbar-search" className="sr-only">
                    Buscar documentos
                </label>
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    id="topbar-search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Buscar documentos..."
                    aria-label="Buscar documentos"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            <div className="ml-auto flex items-center gap-3">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                        aria-label="Abrir notificaciones"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 top-11 z-50 max-h-[420px] w-[340px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl animate-fade-in">
                                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                    <h3 className="font-semibold text-sm text-slate-800">Notificaciones</h3>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={() => readAll.mutate()}
                                                className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                                            >
                                                Marcar leidas
                                            </button>
                                        )}
                                        <Link
                                            to="/notifications"
                                            onClick={() => setShowNotifications(false)}
                                            className="text-xs text-slate-500 hover:text-slate-700"
                                        >
                                            Ver panel
                                        </Link>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-200">
                                    {notifications.length === 0 ? (
                                        <p className="p-4 text-sm text-slate-500 text-center">Sin notificaciones</p>
                                    ) : (
                                        notifications.slice(0, 10).map((n: any) => (
                                            <div
                                                key={n.id}
                                                className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                                onClick={() => {
                                                    if (!n.isRead) readOne.mutate(n.id);
                                                }}
                                            >
                                                <p className="text-sm text-slate-800">{n.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">{formatDate(n.createdAt)}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={openUpload}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" /> Nuevo
                </button>
            </div>
        </header>
    );
}
