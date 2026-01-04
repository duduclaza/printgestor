import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
    const { isAuthenticated, loading } = useAuth();

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-[var(--text-secondary)] font-medium">Carregando...</div>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-[var(--bg-primary)]">
            {/* Sidebar Desktop */}
            <Sidebar />

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto lg:ml-0">
                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
