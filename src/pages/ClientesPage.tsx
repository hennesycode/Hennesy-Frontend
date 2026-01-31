import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ClientModal from '../components/ClientModal';
import clientesService from '../api/clientes';
import type { Cliente, CreateClienteData } from '../api/clientes';

const ClientesPage = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const data = await clientesService.getAll();
            setClientes(data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleCreateOrUpdate = async (data: CreateClienteData) => {
        if (editingClient) {
            await clientesService.update(editingClient.id, data);
        } else {
            await clientesService.create(data);
        }
        await fetchClientes();
        setModalOpen(false);
        setEditingClient(null);
    };

    const handleEdit = (cliente: Cliente) => {
        setEditingClient(cliente);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
                await clientesService.delete(id);
                setClientes(prev => prev.filter(c => c.id !== id));
            } catch (error) {
                console.error("Error deleting client:", error);
                alert('Error al eliminar el cliente');
            }
        }
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.numero_identificacion.includes(searchTerm) ||
        (cliente.cliente_id && cliente.cliente_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <header>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Clientes</h1>
                    <p className="text-gray-500 text-sm">Control y administración de todos los clientes.</p>
                </header>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all w-full md:w-64"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={() => { setEditingClient(null); setModalOpen(true); }}
                        className="bg-[#00FFB0] text-[#050b09] px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,255,176,0.3)] flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-[#00FFB0] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-[rgba(10,25,22,0.7)] backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Identificación</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ubicación</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredClientes.length > 0 ? (
                                    filteredClientes.map((cliente) => (
                                        <tr key={cliente.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-mono text-[#00FFB0]">{cliente.cliente_id || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FFB0]/20 to-[#008a75]/20 flex items-center justify-center text-[#00FFB0] font-bold text-xs uppercase border border-[#00FFB0]/20">
                                                        {cliente.first_name[0]}{cliente.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{cliente.first_name} {cliente.last_name}</p>
                                                        <p className="text-xs text-gray-500">{cliente.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">{cliente.numero_identificacion}</div>
                                                <div className="text-xs text-gray-500 uppercase">{cliente.tipo_identificacion.replace('_', ' ')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">{cliente.country_code} {cliente.phone_number}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">{cliente.ciudad}, {cliente.pais}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${cliente.estado === 'activo'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : cliente.estado === 'pausa'
                                                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {cliente.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(cliente)}
                                                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cliente.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <p>No hay clientes registrados aún.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ClientModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleCreateOrUpdate}
                clientToEdit={editingClient}
            />
        </DashboardLayout>
    );
};

export default ClientesPage;
