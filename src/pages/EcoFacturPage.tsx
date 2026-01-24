import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

interface Company {
    id: number;
    name: string;
    url: string;
    api_key: string;
    is_connected: boolean;
    created_at: string;
    updated_at: string;
}

interface SubFuncion {
    clave: string;
    nombre: string;
    descripcion: string;
    habilitado: boolean;
    configuracion_extra?: {
        tipo_factura?: number;
    } | null;
}

interface Modulo {
    clave: string;
    nombre: string;
    descripcion: string;
    icono: string;
    habilitado: boolean;
    subfunciones?: Record<string, SubFuncion>;
}

interface ModulosResponse {
    total_modulos: number;
    modulos: Record<string, Modulo>;
}

const EcoFacturPage = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({ name: '', url: '', api_key: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Connection status state
    const [connectionStatus, setConnectionStatus] = useState<Record<number, boolean>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Modules modal state
    const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
    const [modulesCompany, setModulesCompany] = useState<Company | null>(null);
    const [modulesData, setModulesData] = useState<ModulosResponse | null>(null);
    const [modulesLoading, setModulesLoading] = useState(false);
    const [modulesError, setModulesError] = useState<string | null>(null);
    const [localModules, setLocalModules] = useState<Record<string, Modulo>>({});
    const [savingModules, setSavingModules] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Check health of a single company
    const checkCompanyHealth = async (company: Company): Promise<boolean> => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(`${company.url}/api/health/`, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return data.status === 'ok';
            }
            return false;
        } catch {
            return false;
        }
    };

    // Check health of all companies
    const checkAllHealthStatus = useCallback(async (companiesToCheck: Company[]) => {
        if (companiesToCheck.length === 0) return;

        const results: Record<number, boolean> = {};

        // Check all companies in parallel
        await Promise.all(
            companiesToCheck.map(async (company) => {
                const isConnected = await checkCompanyHealth(company);
                results[company.id] = isConnected;
            })
        );

        setConnectionStatus(prev => ({ ...prev, ...results }));
    }, []);

    // Manual refresh
    const handleRefreshStatus = async () => {
        setIsRefreshing(true);
        await checkAllHealthStatus(companies);
        setIsRefreshing(false);
    };

    // Fetch companies on mount
    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/ecofactur/companies/');
            setCompanies(response.data);
            // Check health status immediately after fetching
            if (response.data.length > 0) {
                checkAllHealthStatus(response.data);
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
            setError('Error al cargar las empresas');
        } finally {
            setLoading(false);
        }
    };

    // Set up polling interval (every 20 seconds)
    useEffect(() => {
        if (companies.length > 0) {
            // Initial check
            checkAllHealthStatus(companies);

            // Set up interval
            intervalRef.current = setInterval(() => {
                checkAllHealthStatus(companies);
            }, 20000); // 20 seconds
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [companies, checkAllHealthStatus]);

    const handleOpenModal = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({ name: company.name, url: company.url, api_key: company.api_key });
        } else {
            setEditingCompany(null);
            setFormData({ name: '', url: '', api_key: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
        setFormData({ name: '', url: '', api_key: '' });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (editingCompany) {
                const response = await api.put(`/ecofactur/companies/${editingCompany.id}/`, formData);
                setCompanies(prev => prev.map(c =>
                    c.id === editingCompany.id ? response.data : c
                ));
            } else {
                const response = await api.post('/ecofactur/companies/', formData);
                setCompanies(prev => [...prev, response.data]);
            }
            handleCloseModal();
        } catch (err: any) {
            console.error('Error saving company:', err);
            const errorMsg = err.response?.data?.detail ||
                err.response?.data?.message ||
                'Error al guardar la empresa';
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
            return;
        }

        try {
            await api.delete(`/ecofactur/companies/${id}/`);
            setCompanies(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting company:', err);
            setError('Error al eliminar la empresa');
        }
    };

    // Modules modal functions
    const handleOpenModulesModal = async (company: Company) => {
        setModulesCompany(company);
        setIsModulesModalOpen(true);
        setModulesLoading(true);
        setModulesError(null);
        setModulesData(null);
        setLocalModules({});
        setSaveSuccess(false);

        try {
            // Call the company's API directly
            const response = await fetch(`${company.url}/api/modulos/`, {
                method: 'GET',
                headers: {
                    'X-API-Key': company.api_key,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: ModulosResponse = await response.json();
            setModulesData(data);
            setLocalModules(JSON.parse(JSON.stringify(data.modulos))); // Deep copy
        } catch (err: any) {
            console.error('Error fetching modules:', err);
            setModulesError(err.message || 'Error al cargar los módulos');
        } finally {
            setModulesLoading(false);
        }
    };

    const handleCloseModulesModal = () => {
        setIsModulesModalOpen(false);
        setModulesCompany(null);
        setModulesData(null);
        setModulesError(null);
        setLocalModules({});
    };

    const handleToggleModule = (moduloClave: string) => {
        setLocalModules(prev => ({
            ...prev,
            [moduloClave]: {
                ...prev[moduloClave],
                habilitado: !prev[moduloClave].habilitado
            }
        }));
    };

    const handleToggleSubfuncion = (moduloClave: string, subfuncionClave: string) => {
        setLocalModules(prev => ({
            ...prev,
            [moduloClave]: {
                ...prev[moduloClave],
                subfunciones: {
                    ...prev[moduloClave].subfunciones,
                    [subfuncionClave]: {
                        ...prev[moduloClave].subfunciones![subfuncionClave],
                        habilitado: !prev[moduloClave].subfunciones![subfuncionClave].habilitado
                    }
                }
            }
        }));
    };

    const handleChangeTipoFactura = (moduloClave: string, subfuncionClave: string, value: number) => {
        setLocalModules(prev => ({
            ...prev,
            [moduloClave]: {
                ...prev[moduloClave],
                subfunciones: {
                    ...prev[moduloClave].subfunciones,
                    [subfuncionClave]: {
                        ...prev[moduloClave].subfunciones![subfuncionClave],
                        configuracion_extra: {
                            ...(prev[moduloClave].subfunciones![subfuncionClave].configuracion_extra || {}),
                            tipo_factura: value
                        }
                    }
                }
            }
        }));
    };

    // Save modules to API
    const handleSaveModules = async () => {
        if (!modulesCompany) return;

        setSavingModules(true);
        setModulesError(null);
        setSaveSuccess(false);

        try {
            // Build bulk update payload
            const modulosToUpdate: Array<{
                module: string;
                enabled: boolean;
                subfeature?: string;
                extra?: Record<string, unknown>;
            }> = [];

            // Iterate through all modules and subfunctions
            Object.entries(localModules).forEach(([moduleClave, modulo]) => {
                // Add main module
                modulosToUpdate.push({
                    module: moduleClave,
                    enabled: modulo.habilitado
                });

                // Add subfunctions if they exist
                if (modulo.subfunciones) {
                    Object.entries(modulo.subfunciones).forEach(([subClave, subfuncion]) => {
                        const updateItem: {
                            module: string;
                            enabled: boolean;
                            subfeature: string;
                            extra?: Record<string, unknown>;
                        } = {
                            module: moduleClave,
                            subfeature: subClave,
                            enabled: subfuncion.habilitado
                        };

                        // Add extra config if exists
                        if (subfuncion.configuracion_extra) {
                            updateItem.extra = subfuncion.configuracion_extra as Record<string, unknown>;
                        }

                        modulosToUpdate.push(updateItem);
                    });
                }
            });

            const response = await fetch(`${modulesCompany.url}/api/modulos/`, {
                method: 'POST',
                headers: {
                    'X-API-Key': modulesCompany.api_key,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ modulos: modulosToUpdate }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.total_errores > 0) {
                setModulesError(`Se actualizaron ${result.total_actualizados} módulos, pero hubo ${result.total_errores} errores`);
            } else {
                setSaveSuccess(true);
                // Close modal after short delay to show success
                setTimeout(() => {
                    handleCloseModulesModal();
                }, 1000);
            }
        } catch (err: any) {
            console.error('Error saving modules:', err);
            setModulesError(err.message || 'Error al guardar los módulos');
        } finally {
            setSavingModules(false);
        }
    };

    // Toggle Switch Component
    const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) => (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={onChange}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${enabled
                    ? 'bg-gradient-to-r from-[#00FFB0] to-[#00CC8E] shadow-[0_0_20px_rgba(0,255,176,0.4)]'
                    : 'bg-white/10'
                    }`}
            >
                <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ease-out ${enabled ? 'left-7' : 'left-0.5'
                        }`}
                />
            </button>
            <span className={`text-sm font-medium transition-colors ${enabled ? 'text-[#00FFB0]' : 'text-gray-400'}`}>
                {enabled ? 'Activo' : 'Inactivo'}
            </span>
        </div>
    );

    return (
        <div className="bg-[#050b09] text-white font-display min-h-screen relative">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 80% 20%, rgba(0, 138, 117, 0.1) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(0, 179, 255, 0.05) 0%, transparent 40%)' }}></div>

            <div className="relative z-10 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/dashboard" className="text-gray-400 hover:text-[#00FFB0] transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">EcoFactur</h1>
                        </div>
                        <p className="text-gray-500 text-sm">Gestiona tus empresas de facturación electrónica</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Refresh Button */}
                        <button
                            onClick={handleRefreshStatus}
                            disabled={isRefreshing || loading}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-[#00FFB0] hover:border-[#00FFB0]/50 text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                            title="Actualizar estado de conexión"
                        >
                            <svg
                                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        {/* Add Company Button */}
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FFB0] text-[#050b09] text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,176,0.3)]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar Empresa
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#00FFB0]/20 border-t-[#00FFB0] rounded-full animate-spin"></div>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="bg-[rgba(10,25,22,0.7)] backdrop-blur-xl border border-white/5 rounded-2xl p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#008a75]/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-2">No hay empresas registradas</h3>
                        <p className="text-gray-500 text-sm mb-6">Agrega tu primera empresa para comenzar a gestionar la facturación</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#00FFB0] text-[#00FFB0] text-sm font-bold uppercase tracking-widest hover:bg-[#00FFB0]/10 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar Primera Empresa
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                className="bg-[rgba(10,25,22,0.7)] backdrop-blur-xl border border-white/5 hover:border-[#00FFB0]/30 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all group"
                            >
                                <div className="flex items-center gap-4 flex-grow">
                                    <div className="w-12 h-12 rounded-xl bg-[#008a75]/20 flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6 text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <h3 className="text-lg font-bold truncate">{company.name}</h3>
                                        <p className="text-sm text-gray-400 truncate">{company.url}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                                API: ****{company.api_key.slice(-4)}
                                            </span>
                                            {connectionStatus[company.id] === undefined ? (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                                    <span className="text-[10px] text-gray-500">Verificando...</span>
                                                </>
                                            ) : connectionStatus[company.id] ? (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    <span className="text-[10px] text-green-400">Conectado</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    <span className="text-[10px] text-red-400">Desconectado</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    {/* View Modules Button (Eye Icon) */}
                                    <button
                                        onClick={() => handleOpenModulesModal(company)}
                                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 flex items-center justify-center transition-all group"
                                        title="Ver Módulos"
                                    >
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => handleOpenModal(company)}
                                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#00FFB0]/20 border border-white/10 hover:border-[#00FFB0]/50 flex items-center justify-center transition-all group"
                                        title="Editar"
                                    >
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(company.id)}
                                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 flex items-center justify-center transition-all group"
                                        title="Eliminar"
                                    >
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Company Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>
                    <div className="relative w-full max-w-md bg-[rgba(10,25,22,0.95)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {editingCompany ? 'Editar Empresa' : 'Agregar Empresa'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Nombre Empresa
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Mi Empresa S.A.S"
                                    required
                                    className="w-full bg-white/5 border border-white/10 focus:border-[#00FFB0]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00FFB0]/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    URL del Servicio
                                </label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://api.ecofactur.com"
                                    required
                                    className="w-full bg-white/5 border border-white/10 focus:border-[#00FFB0]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00FFB0]/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Clave API
                                </label>
                                <input
                                    type="password"
                                    value={formData.api_key}
                                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                    placeholder="••••••••••••••••"
                                    required
                                    className="w-full bg-white/5 border border-white/10 focus:border-[#00FFB0]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00FFB0]/50 transition-all font-mono"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-xl bg-[#00FFB0] text-[#050b09] text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,176,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#050b09]/30 border-t-[#050b09] rounded-full animate-spin"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        editingCompany ? 'Guardar' : 'Agregar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modules Modal */}
            {isModulesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={handleCloseModulesModal}
                    ></div>
                    <div className="relative w-full max-w-2xl max-h-[90vh] bg-[rgba(10,25,22,0.95)] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-bold">Módulos</h2>
                                {modulesCompany && (
                                    <p className="text-sm text-gray-400 mt-1">{modulesCompany.name}</p>
                                )}
                            </div>
                            <button
                                onClick={handleCloseModulesModal}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {modulesLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-10 h-10 border-4 border-[#00FFB0]/20 border-t-[#00FFB0] rounded-full animate-spin"></div>
                                </div>
                            ) : modulesError ? (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                                    {modulesError}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(localModules).map(([clave, modulo]) => (
                                        <div key={clave} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                            {/* Module Header */}
                                            <div className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#008a75]/20 flex items-center justify-center">
                                                        <i className={`fas ${modulo.icono} text-[#00FFB0]`}></i>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">{modulo.nombre}</h4>
                                                        <p className="text-xs text-gray-500">{modulo.descripcion}</p>
                                                    </div>
                                                </div>
                                                <ToggleSwitch
                                                    enabled={modulo.habilitado}
                                                    onChange={() => handleToggleModule(clave)}
                                                    label={modulo.nombre}
                                                />
                                            </div>

                                            {/* Subfunciones */}
                                            {modulo.subfunciones && Object.keys(modulo.subfunciones).length > 0 && (
                                                <div className="border-t border-white/5 bg-black/20">
                                                    {Object.entries(modulo.subfunciones).map(([subClave, subfuncion]) => (
                                                        <div key={subClave} className="p-4 pl-16 flex items-center justify-between border-b border-white/5 last:border-b-0">
                                                            <div>
                                                                <h5 className="font-medium text-sm">{subfuncion.nombre}</h5>
                                                                <p className="text-xs text-gray-500">{subfuncion.descripcion}</p>
                                                                {/* Tipo Factura selector */}
                                                                {subfuncion.configuracion_extra?.tipo_factura !== undefined && (
                                                                    <div className="mt-2 flex items-center gap-2">
                                                                        <span className="text-xs text-gray-400">Tipo Factura:</span>
                                                                        <div className="flex gap-1">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleChangeTipoFactura(clave, subClave, 1)}
                                                                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${subfuncion.configuracion_extra.tipo_factura === 1
                                                                                    ? 'bg-[#00FFB0] text-[#050b09]'
                                                                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                                                    }`}
                                                                            >
                                                                                1
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleChangeTipoFactura(clave, subClave, 2)}
                                                                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${subfuncion.configuracion_extra.tipo_factura === 2
                                                                                    ? 'bg-[#00FFB0] text-[#050b09]'
                                                                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                                                    }`}
                                                                            >
                                                                                2
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <ToggleSwitch
                                                                enabled={subfuncion.habilitado}
                                                                onChange={() => handleToggleSubfuncion(clave, subClave)}
                                                                label={subfuncion.nombre}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/5 flex gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModulesModal}
                                disabled={savingModules}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveModules}
                                disabled={savingModules || modulesLoading}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${saveSuccess
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[#00FFB0] text-[#050b09] hover:brightness-110 shadow-[0_0_20px_rgba(0,255,176,0.3)]'
                                    }`}
                            >
                                {savingModules ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[#050b09]/30 border-t-[#050b09] rounded-full animate-spin"></div>
                                        Guardando...
                                    </>
                                ) : saveSuccess ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        ¡Guardado!
                                    </>
                                ) : (
                                    'Guardar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoFacturPage;
