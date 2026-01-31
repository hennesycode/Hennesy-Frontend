import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/client';

interface UserData {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    country_code: string;
    phone_number: string;
}

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/me');
                setUser(response.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    // Helper function to check if a route is active
    const isActiveRoute = (path: string) => {
        return location.pathname === path;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#050b09] text-white font-display">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-400">Cargando panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#050b09] text-white font-display overflow-hidden min-h-screen relative">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 80% 20%, rgba(0, 138, 117, 0.1) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(0, 179, 255, 0.05) 0%, transparent 40%)' }}></div>

            <div className="relative flex flex-col h-screen z-10">
                {/* Header */}
                <header className="h-16 bg-[rgba(10,25,22,0.7)] backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setSidebarOpen(!sidebarOpen); setMobileMenuOpen(!mobileMenuOpen); }}
                            className="cursor-pointer hover:text-[#00FFB0] transition-colors p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 gap-2 w-64 lg:w-96">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input className="bg-transparent border-none text-sm focus:ring-0 focus:outline-none text-white w-full placeholder-gray-500" placeholder="Buscar en la estación..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden lg:flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#00FFB0] animate-pulse"></span>
                            <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Status: Operativo</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative cursor-pointer w-10 h-10 rounded-lg bg-[rgba(10,25,22,0.7)] backdrop-blur-xl border border-white/10 flex items-center justify-center hover:border-[#00FFB0] transition-colors group"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-[#00FFB0] rounded-full"></span>
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold leading-none">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-[10px] text-gray-500 capitalize">{user?.role || 'User'}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-[#008a75]/20 flex items-center justify-center border border-[#00FFB0]/30">
                                    <svg className="w-5 h-5 text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-grow overflow-hidden">
                    {/* Mobile Menu Overlay */}
                    {mobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        ></div>
                    )}

                    {/* Left Sidebar */}
                    <aside className={`
                        ${sidebarOpen ? 'w-64' : 'w-20'} 
                        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        fixed md:relative z-40 md:z-auto
                        h-full md:h-auto
                        bg-[rgba(10,25,22,0.9)] md:bg-[rgba(10,25,22,0.7)] backdrop-blur-xl 
                        flex-shrink-0 flex flex-col border-r border-white/5 
                        transition-all duration-300
                    `}>
                        <div className="p-6 flex items-center gap-3">
                            <svg className="w-8 h-8 text-[#00FFB0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                            {sidebarOpen && <span className="text-xl font-bold tracking-tighter uppercase whitespace-nowrap">Hennesy</span>}
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex-grow mt-4 px-4 space-y-2 overflow-y-auto">
                            {/* Resumen */}
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-4 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${isActiveRoute('/dashboard')
                                    ? 'bg-gradient-to-r from-[#00FFB0]/10 to-transparent border-l-[3px] border-[#00FFB0] text-[#00FFB0]'
                                    : 'text-gray-400 hover:text-[#00FFB0] hover:bg-white/5'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                {sidebarOpen && <span>Resumen</span>}
                            </Link>

                            {/* Clientes */}
                            <Link
                                to="/clientes"
                                className={`flex items-center gap-4 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${isActiveRoute('/clientes')
                                    ? 'bg-gradient-to-r from-[#00FFB0]/10 to-transparent border-l-[3px] border-[#00FFB0] text-[#00FFB0]'
                                    : 'text-gray-400 hover:text-[#00FFB0] hover:bg-white/5'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {sidebarOpen && <span>Clientes</span>}
                            </Link>

                            {/* EcoFactur */}
                            <Link
                                to="/ecofactur"
                                className={`flex items-center gap-4 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${isActiveRoute('/ecofactur')
                                    ? 'bg-gradient-to-r from-[#00FFB0]/10 to-transparent border-l-[3px] border-[#00FFB0] text-[#00FFB0]'
                                    : 'text-gray-400 hover:text-[#00FFB0] hover:bg-white/5'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {sidebarOpen && <span>EcoFactur</span>}
                            </Link>
                        </nav>

                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={handleLogout}
                                className="w-full p-2 rounded-lg flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                {sidebarOpen && <span className="text-xs uppercase tracking-widest font-bold">Salir</span>}
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </main>

                    {/* Right Sidebar - Notifications */}
                    <aside className={`
                        ${notificationsOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}
                        fixed md:relative right-0 top-16 md:top-0 z-40 md:z-auto
                        h-[calc(100vh-64px)] md:h-auto
                        bg-[rgba(10,25,22,0.95)] md:bg-[rgba(10,25,22,0.7)] backdrop-blur-xl 
                        flex-shrink-0 flex flex-col border-l border-white/5 
                        transition-all duration-300
                    `}>
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-wider">Notificaciones</h4>
                            <button
                                onClick={() => setNotificationsOpen(false)}
                                className="cursor-pointer text-gray-500 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-6 space-y-6">
                            <div className="relative pl-6 border-l border-[#008a75]/30 space-y-1">
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[#00FFB0] shadow-[0_0_8px_#00FFB0]"></div>
                                <p className="text-xs font-bold">Nuevo usuario registrado</p>
                                <p className="text-[10px] text-gray-500">Hace 2 minutos</p>
                                <div className="text-[11px] text-gray-400 bg-white/5 p-2 rounded mt-2">
                                    "Usuario ID #5621 se ha unido al portal."
                                </div>
                            </div>
                            <div className="relative pl-6 border-l border-white/10 space-y-1">
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                                <p className="text-xs font-bold">Despliegue de software exitoso</p>
                                <p className="text-[10px] text-gray-500">Hace 1 hora</p>
                                <p className="text-[11px] text-gray-400">Versión 1.4.0 estable en producción.</p>
                            </div>
                            <div className="relative pl-6 border-l border-white/10 space-y-1">
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                                <p className="text-xs font-bold">56 Nuevos usuarios registrados</p>
                                <p className="text-[10px] text-gray-500">Hoy, 11:59 AM</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <button className="w-full py-3 rounded-xl bg-[#00FFB0] text-[#050b09] text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,176,0.3)]">
                                Lanzar Nueva Campaña
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
