import DashboardLayout from '../components/DashboardLayout';

const ClientesPage = () => {
    return (
        <DashboardLayout>
            <header className="mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Clientes</h1>
                <p className="text-gray-500 text-sm">Control y administración de todos los clientes.</p>
            </header>

            {/* Content placeholder - to be implemented later */}
            <div className="grid grid-cols-1 gap-4 md:gap-6">
                <div className="bg-[rgba(10,25,22,0.7)] backdrop-blur-xl border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-[#00FFB0]/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold">Gestión de Clientes</h2>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Aquí podrás administrar todos los clientes del sistema. Esta sección estará disponible próximamente con todas las funcionalidades necesarias para gestionar la información de tus clientes.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientesPage;
