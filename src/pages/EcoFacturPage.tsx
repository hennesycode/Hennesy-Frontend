import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ecofacturService from '../api/ecofactur';

interface Company {
    id: number;
    name: string;
    url: string;
    api_key: string;
    is_connected: boolean;
    created_at: string;
    updated_at: string;
}

// Estructura de módulos según API de EcoFactur v2.4.0
type ModuleValue = 
    | boolean  // Módulos simples: dashboard: true
    | string[] // Formato legacy: ["sub1", "sub2"]
    | {        // Formato v2.4.0: { enabled: true, submodulos: {...} }
        enabled?: boolean;
        submodulos?: Record<string, boolean>;
        [key: string]: any;
      };

type ModulosData = Record<string, ModuleValue>;

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
    const [modulesData, setModulesData] = useState<ModulosData | null>(null);
    const [modulesLoading, setModulesLoading] = useState(false);
    const [modulesError, setModulesError] = useState<string | null>(null);
    const [localModules, setLocalModules] = useState<ModulosData>({});
    const [savingModules, setSavingModules] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Check health of a single company
    const checkCompanyHealth = async (company: Company): Promise<boolean> => {
        try {
            const result = await ecofacturService.checkHealthStatus(company.url);
            return result !== null;
        } catch (error) {
            console.error(`❌ Error en health check de ${company.name}:`, error);
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
            const data = await ecofacturService.getModules(company.url);
            setModulesData(data);
            setLocalModules(JSON.parse(JSON.stringify(data))); // Deep copy
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

    // Helper function to set nested value
    const setNestedValue = (obj: any, path: string | string[], value: any): any => {
        const keys = Array.isArray(path) ? path : path.split('.');
        const lastKey = keys.pop()!;
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
        return obj;
    };

    // Evitar warning de variable no utilizada
    void setNestedValue;

    const handleToggleModule = (path: string) => {
        setLocalModules(prev => {
            const newModules = JSON.parse(JSON.stringify(prev)); // Deep copy
            const keys = path.split('.');
            
            if (keys.length === 1) {
                // Es un módulo de nivel superior
                const moduleName = keys[0];
                const currentValue = newModules[moduleName];
                
                if (typeof currentValue === 'boolean') {
                    // Formato simple: dashboard: true
                    newModules[moduleName] = !currentValue;
                } else if (Array.isArray(currentValue)) {
                    // Si es un array de strings, no cambiamos nada (siempre habilitado)
                    return prev;
                } else if (typeof currentValue === 'object' && 'enabled' in currentValue) {
                    // Formato v2.4.0: { enabled: true, submodulos: {...} }
                    newModules[moduleName].enabled = !currentValue.enabled;
                }
            } else if (keys.length === 2) {
                // Es un submódulo
                const [moduleName, subName] = keys;
                const moduleValue = newModules[moduleName];
                
                if (Array.isArray(moduleValue)) {
                    // Formato legacy: ["sub1", "sub2"]
                    const index = (moduleValue as string[]).indexOf(subName);
                    if (index !== -1) {
                        // Convertir a formato v2.4.0
                        const submodulos: Record<string, boolean> = {};
                        (moduleValue as string[]).forEach(sub => {
                            submodulos[sub] = sub !== subName;
                        });
                        newModules[moduleName] = { enabled: true, submodulos };
                    }
                } else if (typeof moduleValue === 'object') {
                    // Formato v2.4.0: { enabled: true, submodulos: { sub1: true } }
                    if ('submodulos' in moduleValue && typeof moduleValue.submodulos === 'object') {
                        // Formato v2.4.0 correcto
                        const subModule = moduleValue.submodulos![subName];
                        if (typeof subModule === 'boolean') {
                            newModules[moduleName].submodulos[subName] = !subModule;
                        }
                    } else {
                        // Formato alternativo: { enabled: true, sub1: true }
                        const subModule = moduleValue[subName];
                        if (typeof subModule === 'boolean') {
                            newModules[moduleName][subName] = !subModule;
                        }
                    }
                }
            }
            
            return newModules;
        });
    };

    // Save modules to API
    const handleSaveModules = async () => {
        if (!modulesCompany) return;

        setSavingModules(true);
        setModulesError(null);
        setSaveSuccess(false);

        try {
            // Comparar original con modificados y construir array de cambios
            const changes: Array<{ module: string; submodule?: string; enabled: boolean }> = [];
            const disabledModules = new Set<string>(); // Tracking módulos desactivados para cascada

            // PRIMERO: Detectar cambios en módulos de nivel superior
            for (const moduleKey in localModules) {
                if (['enabled', 'descripcion'].includes(moduleKey)) continue;

                const originalValue = modulesData?.[moduleKey];
                const modifiedValue = localModules[moduleKey];

                // Si el módulo cambió de estado (boolean → boolean)
                if (typeof modifiedValue === 'boolean' && typeof originalValue === 'boolean') {
                    if (originalValue !== modifiedValue) {
                        changes.push({
                            module: moduleKey,
                            enabled: modifiedValue
                        });
                        // Si fue DESACTIVADO, marcar para evitar cambios en submódulos
                        if (modifiedValue === false) {
                            disabledModules.add(moduleKey);
                        }
                    }
                }
                // Si es un objeto con 'enabled'
                else if (typeof modifiedValue === 'object' && modifiedValue !== null && !Array.isArray(modifiedValue)) {
                    if ('enabled' in modifiedValue && typeof modifiedValue.enabled === 'boolean') {
                        const originalEnabled = (originalValue as any)?.enabled === true;
                        if (originalEnabled !== modifiedValue.enabled) {
                            changes.push({
                                module: moduleKey,
                                enabled: modifiedValue.enabled
                            });
                            // Si fue DESACTIVADO, marcar para evitar cambios en submódulos
                            if (modifiedValue.enabled === false) {
                                disabledModules.add(moduleKey);
                            }
                        }
                    }
                }
            }

            // SEGUNDO: Detectar cambios en submódulos (pero NO si el módulo padre fue desactivado)
            for (const moduleKey in localModules) {
                if (['enabled', 'descripcion'].includes(moduleKey)) continue;

                // SALTAR: Si este módulo fue desactivado, la cascada del servidor maneja sus submódulos
                if (disabledModules.has(moduleKey)) {
                    continue;
                }

                const originalValue = modulesData?.[moduleKey];
                const modifiedValue = localModules[moduleKey];

                // Detectar cambios en submódulos dentro del objeto
                if (typeof modifiedValue === 'object' && modifiedValue !== null && !Array.isArray(modifiedValue)) {
                    // Formato v2.4.0: { enabled: true, submodulos: { sub1: true } }
                    if ('submodulos' in modifiedValue && typeof modifiedValue.submodulos === 'object') {
                        for (const subKey in modifiedValue.submodulos) {
                            const subModifiedValue = modifiedValue.submodulos[subKey];
                            
                            // Comparar con el original
                            const originalSubmodulos = (originalValue as any)?.submodulos;
                            const subOriginalValue = originalSubmodulos?.[subKey];
                            
                            if (typeof subModifiedValue === 'boolean' && subOriginalValue !== subModifiedValue) {
                                changes.push({
                                    module: moduleKey,
                                    submodule: subKey,
                                    enabled: subModifiedValue
                                });
                            }
                        }
                    } else {
                        // Formato alternativo: { enabled: true, sub1: true, sub2: false }
                        for (const subKey in modifiedValue) {
                            if (['enabled', 'descripcion', 'submodulos'].includes(subKey)) continue;

                            const subModifiedValue = (modifiedValue as Record<string, any>)[subKey];

                            if (Array.isArray(originalValue)) {
                                // Comparar array original con objeto modificado
                                const subOriginalValue = (originalValue as string[]).includes(subKey);
                                if (typeof subModifiedValue === 'boolean' && subOriginalValue !== subModifiedValue) {
                                    changes.push({
                                        module: moduleKey,
                                        submodule: subKey,
                                        enabled: subModifiedValue
                                    });
                                }
                            } else if (typeof originalValue === 'object' && originalValue !== null && !Array.isArray(originalValue)) {
                                // Comparar objeto original con objeto modificado
                                const subOriginalValue = (originalValue as Record<string, any>)?.[subKey];
                                if (typeof subModifiedValue === 'boolean' && subOriginalValue !== subModifiedValue) {
                                    changes.push({
                                        module: moduleKey,
                                        submodule: subKey,
                                        enabled: subModifiedValue
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // Si no hay cambios, cerrar modal
            if (changes.length === 0) {
                setSaveSuccess(true);
                setTimeout(() => {
                    handleCloseModulesModal();
                }, 500);
                setSavingModules(false);
                return;
            }

            console.log('📤 Enviando cambios a EcoFactur:', changes);

            // Aplicar cambios en paralelo
            const results = await Promise.all(
                changes.map(change =>
                    ecofacturService.toggleModule(
                        modulesCompany.url,
                        modulesCompany.api_key,
                        change
                    )
                )
            );

            // Verificar si todos fueron exitosos
            const allSuccess = results.every(r => r.success === true);
            if (!allSuccess) {
                throw new Error('Algunos cambios no se aplicaron correctamente');
            }

            console.log('✅ Cambios aplicados exitosamente');
            setSaveSuccess(true);

            // Recargar módulos para obtener estado actualizado
            const updatedModules = await ecofacturService.getModules(modulesCompany.url);
            setModulesData(updatedModules);
            setLocalModules(JSON.parse(JSON.stringify(updatedModules)));

            // Close modal after short delay to show success
            setTimeout(() => {
                handleCloseModulesModal();
            }, 1500);
        } catch (err: any) {
            console.error('Error saving modules:', err);
            setModulesError(err.message || 'Error al guardar los módulos');
        } finally {
            setSavingModules(false);
        }
    };

    // Toggle Switch Component
    const ToggleSwitch = ({ enabled, onChange, label: _label, disabled = false }: { enabled: boolean; onChange: () => void; label: string; disabled?: boolean }) => (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={onChange}
                disabled={disabled}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${enabled
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
                                                    <span className="text-[10px] text-green-400">✅ Conectado</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    <span className="text-[10px] text-red-400">❌ Desconectado</span>
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

                        {/* Info Banner */}
                        <div className="px-6 pt-4 pb-2">
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
                                <p className="font-semibold mb-1">💡 Comportamiento:</p>
                                <ul className="space-y-1 ml-2">
                                    <li>• Desactivar un <strong>módulo completo</strong> desactiva TODOS sus submódulos</li>
                                    <li>• Desactivar un <strong>submódulo específico</strong> NO afecta otros submódulos</li>
                                </ul>
                            </div>
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
                                    {Object.entries(localModules).map(([moduleName, moduleData]) => {
                                        console.log(`🔎 Procesando módulo: ${moduleName}`, moduleData);
                                        
                                        const isBoolean = typeof moduleData === 'boolean';
                                        const isArrayOfStrings = Array.isArray(moduleData) && moduleData.every(item => typeof item === 'string');
                                        const isModuleObject = !isBoolean && !isArrayOfStrings && typeof moduleData === 'object' && moduleData !== null;
                                        
                                        console.log(`  isBoolean: ${isBoolean}, isArray: ${isArrayOfStrings}, isObject: ${isModuleObject}`);
                                        
                                        if (!isBoolean && !isArrayOfStrings && !isModuleObject) return null;
                                        
                                        // Estado del módulo principal
                                        const moduleEnabled = isBoolean ? moduleData : (isArrayOfStrings ? true : (moduleData as any)?.enabled === true);
                                        
                                        // Obtener submódulos
                                        let submodules: Array<[string, any]> = [];
                                        
                                        if (isArrayOfStrings) {
                                            // Formato legacy: ["sub1", "sub2"]
                                            submodules = (moduleData as string[]).map(subName => [subName, true]);
                                        } else if (isModuleObject) {
                                            // Formato v2.4.0: { enabled: true, submodulos: { sub1: true } }
                                            if ('submodulos' in moduleData && typeof (moduleData as any).submodulos === 'object') {
                                                const submodulosObj = (moduleData as any).submodulos;
                                                console.log(`📦 ${moduleName} - submodulos encontrados:`, submodulosObj);
                                                submodules = Object.entries(submodulosObj);
                                            } else {
                                                // Formato alternativo: { enabled: true, sub1: true }
                                                submodules = Object.entries(moduleData as Record<string, any>)
                                                    .filter(([key]) => !['enabled', 'descripcion', 'submodulos'].includes(key));
                                            }
                                        }
                                        
                                        console.log(`🔍 ${moduleName} tiene ${submodules.length} submódulos:`, submodules);
                                        
                                        return (
                                            <div key={moduleName} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                                {/* Módulo Principal */}
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-[#008a75]/20 flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold capitalize">{moduleName.replace(/_/g, ' ')}</h4>
                                                                {isModuleObject && (moduleData as any)?.descripcion && (
                                                                    <p className="text-xs text-gray-500">{(moduleData as any).descripcion}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!isArrayOfStrings && (
                                                            <ToggleSwitch
                                                                enabled={moduleEnabled}
                                                                onChange={() => handleToggleModule(moduleName)}
                                                                label={moduleName}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Submódulos */}
                                                {submodules.length > 0 && (
                                                    <div className="border-t border-white/5 bg-black/20 p-4 space-y-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Submódulos</p>
                                                            {!moduleEnabled && (
                                                                <span className="text-xs px-2 py-1 rounded bg-orange-500/20 border border-orange-500/30 text-orange-300">
                                                                    Deshabilitados por módulo
                                                                </span>
                                                            )}
                                                        </div>
                                                        {submodules.map(([subName, _subData]) => {
                                                            // Inicializar el estado del submódulo si no existe
                                                            const subPath = `${moduleName}.${subName}`;
                                                            let subEnabled = true; // Por defecto habilitado
                                                            
                                                            // Obtener el estado actual del submódulo
                                                            if (localModules[moduleName]) {
                                                                if (Array.isArray(localModules[moduleName])) {
                                                                    // Formato legacy: ["sub1", "sub2"]
                                                                    subEnabled = true; // Arrays de strings siempre habilitados
                                                                } else if (typeof localModules[moduleName] === 'object') {
                                                                    const moduleObj = localModules[moduleName] as any;
                                                                    
                                                                    // Formato v2.4.0: { enabled: true, submodulos: { sub1: true } }
                                                                    if ('submodulos' in moduleObj && typeof moduleObj.submodulos === 'object') {
                                                                        const subModule = moduleObj.submodulos[subName];
                                                                        if (typeof subModule === 'boolean') {
                                                                            subEnabled = subModule;
                                                                        }
                                                                    } else {
                                                                        // Formato alternativo: { enabled: true, sub1: true }
                                                                        const subModule = moduleObj[subName];
                                                                        if (typeof subModule === 'boolean') {
                                                                            subEnabled = subModule;
                                                                        } else if (typeof subModule === 'object' && subModule?.enabled !== undefined) {
                                                                            subEnabled = subModule.enabled;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            
                                                            // Si el módulo principal está deshabilitado, el submódulo también debe estarlo
                                                            const isDisabledByCascade = !moduleEnabled;
                                                            const effectivelyEnabled = !isDisabledByCascade && subEnabled;
                                                            
                                                            return (
                                                                <div 
                                                                    key={subPath} 
                                                                    className={`flex items-center justify-between pl-4 py-2 rounded transition-all ${
                                                                        isDisabledByCascade 
                                                                            ? 'opacity-50 cursor-not-allowed' 
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${
                                                                            isDisabledByCascade 
                                                                                ? 'bg-gray-500/50' 
                                                                                : 'bg-[#00FFB0]/30'
                                                                        }`}></div>
                                                                        <h5 className="text-sm font-medium capitalize">
                                                                            {subName.replace(/_/g, ' ')}
                                                                        </h5>
                                                                        {isDisabledByCascade && (
                                                                            <span className="text-xs text-gray-500 ml-auto">(deshabilitado)</span>
                                                                        )}
                                                                    </div>
                                                                    <ToggleSwitch
                                                                        enabled={effectivelyEnabled}
                                                                        onChange={() => handleToggleModule(subPath)}
                                                                        label={subName}
                                                                        disabled={isDisabledByCascade}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
