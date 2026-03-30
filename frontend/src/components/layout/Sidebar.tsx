import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import {
    Clock,
    FileText,
    LayoutDashboard,
    LogOut,
    Search,
    Settings,
    Share2,
    Trash2,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/search', icon: Search, label: 'Buscar' },
    { to: '/expiring', icon: Clock, label: 'Por Vencer' },
    { to: '/shared', icon: Share2, label: 'Compartidos' },
    { to: '/trash', icon: Trash2, label: 'Papelera' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
];

export function Sidebar() {
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch { }
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
                    <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    GestorDoc
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-blue-500/15 text-blue-400 shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`
                        }
                    >
                        <item.icon className="w-4.5 h-4.5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User section */}
            <div className="p-3 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
