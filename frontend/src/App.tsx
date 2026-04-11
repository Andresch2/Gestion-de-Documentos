import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ExpiringPage } from '@/pages/ExpiringPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SearchPage } from '@/pages/SearchPage';
import { SharedAccessPage } from '@/pages/SharedAccessPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SharedLinksPage } from '@/pages/SharedLinksPage';
import { TrashPage } from '@/pages/TrashPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { useAuthStore } from '@/store/auth.store';
import { Navigate, Route, Routes } from 'react-router-dom';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/shared/:token" element={<SharedAccessPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="expiring" element={<ExpiringPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="shared" element={<SharedLinksPage />} />
                <Route path="trash" element={<TrashPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
