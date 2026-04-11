import { usersApi } from '@/api/users.api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const updateUser = useAuthStore((s) => s.updateUser);

    useEffect(() => {
        if (!isAuthenticated) return;

        const syncUser = async () => {
            try {
                const { data } = await usersApi.getMe();
                updateUser(data.data || data);
            } catch {
                // Keep the last known session state if the refresh fails.
            }
        };

        void syncUser();
    }, [isAuthenticated, updateUser]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 lg:p-5">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
