import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';

interface UserData {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    country_code: string;
    phone_number: string;
}

const DashboardPage = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [companyCount, setCompanyCount] = useState<number>(0);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/me');
                setUser(response.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };
        fetchUser();

        // Fetch company count
        const fetchCompanyCount = async () => {
            try {
                const response = await api.get('/ecofactur/companies/');
                setCompanyCount(response.data.length);
            } catch (err) {
                console.error("Failed to fetch companies:", err);
            }
        };
        fetchCompanyCount();
    }, []);

    return (
        <DashboardLayout>
            <header className="mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Panel de Control</h1>
                <p className="text-gray-500 text-sm">Bienvenido de nuevo, {user?.first_name}.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 mb-8 max-w-md">
                <Link to="/ecofactur" className="bg-[rgba(10,25,22,0.7)] backdrop-blur-xl border border-white/5 hover:border-[#00FFB0]/30 p-6 rounded-2xl relative overflow-hidden group transition-all cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <p className="text-xs font-mono text-[#00FFB0] tracking-widest uppercase mb-1">EcoFactur</p>
                    <h3 className="text-2xl md:text-3xl font-bold">{companyCount} EMPRESA{companyCount !== 1 ? 'S' : ''}</h3>
                    <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4 text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                        Empresas clientes registradas
                    </p>
                </Link>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
