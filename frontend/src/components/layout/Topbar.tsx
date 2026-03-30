import { useNotifications, useReadAllNotifications, useReadNotification } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export function Topbar() {
    const [showNotifications, setShowNotifications] = useState(false);
    const { data: notificationsData } = useNotifications();
    const readAll = useReadAllNotifications();
    const readOne = useReadNotification();

    const unreadCount = notificationsData?.unreadCount || 0;
    const notifications = notificationsData?.data || [];

    return (
        <header className="h-16 border-b border-border flex items-center justify-end px-6 bg-card/30">
            {/* Notifications */}
            <div className="relative">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {showNotifications && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                        <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto glass rounded-xl shadow-2xl z-50 animate-fade-in">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h3 className="font-semibold text-sm">Notificaciones</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => readAll.mutate()}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        Marcar todas como leídas
                                    </button>
                                )}
                            </div>
                            <div className="divide-y divide-border">
                                {notifications.length === 0 ? (
                                    <p className="p-4 text-sm text-muted-foreground text-center">Sin notificaciones</p>
                                ) : (
                                    notifications.slice(0, 10).map((n: any) => (
                                        <div
                                            key={n.id}
                                            className={`p-3 hover:bg-accent/50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-500/5' : ''
                                                }`}
                                            onClick={() => {
                                                if (!n.isRead) readOne.mutate(n.id);
                                            }}
                                        >
                                            <p className="text-sm text-foreground">{n.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
