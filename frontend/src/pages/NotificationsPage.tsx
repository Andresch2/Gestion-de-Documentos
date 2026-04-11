import type { Notification } from '@/types';
import { useNotifications, useReadAllNotifications, useReadNotification } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCheck, CircleDot } from 'lucide-react';
import { useMemo, useState } from 'react';

export function NotificationsPage() {
    const [page, setPage] = useState(1);
    const [tab, setTab] = useState<'all' | 'unread'>('all');
    const { data, isLoading } = useNotifications(page);
    const readAll = useReadAllNotifications();
    const readOne = useReadNotification();

    const notifications: Notification[] = data?.data || [];
    const meta = data?.meta;
    const unreadCount = data?.unreadCount || 0;

    const visible = useMemo(() => {
        if (tab === 'unread') return notifications.filter((n) => !n.isRead);
        return notifications;
    }, [notifications, tab]);

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <Bell className="h-5 w-5 text-blue-500" /> Notificaciones
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">{unreadCount} sin leer</p>
                </div>
                <button
                    onClick={() => readAll.mutate()}
                    disabled={readAll.isPending || unreadCount === 0}
                    className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                >
                    <CheckCheck className="h-4 w-4" /> Marcar todas como leidas
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setTab('all')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setTab('unread')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Sin leer
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 rounded-xl border border-slate-200 bg-white animate-pulse" />
                    ))}
                </div>
            ) : visible.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
                    <Bell className="mx-auto mb-3 h-9 w-9 text-slate-400" />
                    <p className="text-slate-500">
                        {tab === 'unread' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visible.map((n) => (
                        <div key={n.id} className={`rounded-2xl border bg-white p-4 transition-all ${n.isRead ? 'border-slate-200' : 'border-blue-200 bg-blue-50/40'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-800">{n.message}</p>
                                    <p className="mt-1 text-xs text-slate-500">{formatDate(n.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!n.isRead && <CircleDot className="h-4 w-4 text-blue-500" />}
                                    {!n.isRead && (
                                        <button
                                            onClick={() => readOne.mutate(n.id)}
                                            className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100"
                                        >
                                            Marcar leida
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                    {[...Array(meta.totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
