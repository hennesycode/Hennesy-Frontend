import React, { useState, useEffect } from 'react';
import type { CreateClienteData, Cliente } from '../api/clientes';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateClienteData) => Promise<void>;
    clientToEdit?: Cliente | null;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const [formData, setFormData] = useState<CreateClienteData>({
        first_name: '',
        last_name: '',
        email: '',
        tipo_identificacion: 'cedula',
        numero_identificacion: '',
        country_code: '+57',
        phone_number: '',
        estado: 'activo',
        pais: '',
        ciudad: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (clientToEdit) {
            setFormData({
                first_name: clientToEdit.first_name,
                last_name: clientToEdit.last_name,
                email: clientToEdit.email,
                tipo_identificacion: clientToEdit.tipo_identificacion,
                numero_identificacion: clientToEdit.numero_identificacion,
                country_code: clientToEdit.country_code,
                phone_number: clientToEdit.phone_number,
                estado: clientToEdit.estado,
                pais: clientToEdit.pais,
                ciudad: clientToEdit.ciudad
            });
        } else {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                tipo_identificacion: 'cedula',
                numero_identificacion: '',
                country_code: '+57',
                phone_number: '',
                estado: 'activo',
                pais: '',
                ciudad: ''
            });
        }
        setError(null);
    }, [clientToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            console.error(err);
            // Default error message
            let message = 'Error al guardar el cliente.';

            // Handle backend validation errors (e.g. from serializer)
            if (err.response?.data) {
                const data = err.response.data;
                // If it's a simple error message
                if (data.error) {
                    message = data.error;
                }
                // If it's field errors (standard DRF format)
                else {
                    // Collect all field errors
                    const fieldErrors = Object.entries(data).map(([key, value]) => {
                        const errorMsg = Array.isArray(value) ? value.join(' ') : String(value);
                        return `${key}: ${errorMsg}`;
                    }).join(' | ');
                    if (fieldErrors) message = fieldErrors;
                }
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#050b09] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#050b09]/90 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-white">
                        {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Nombres</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all placeholder-gray-600"
                                placeholder="Ej: Juan"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Apellidos</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all placeholder-gray-600"
                                placeholder="Ej: Pérez"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Tipo Identificación</label>
                            <select
                                name="tipo_identificacion"
                                value={formData.tipo_identificacion}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all [&>option]:bg-[#050b09]"
                            >
                                <option value="cedula">Cédula de Ciudadanía</option>
                                <option value="cedula_extranjeria">Cédula de Extranjería</option>
                                <option value="pasaporte">Pasaporte</option>
                                <option value="nit">NIT</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">No. Identificación</label>
                            <input
                                type="text"
                                name="numero_identificacion"
                                value={formData.numero_identificacion}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all placeholder-gray-600"
                                placeholder="Ej: 1020304050"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all placeholder-gray-600"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Teléfono</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="country_code"
                                    value={formData.country_code}
                                    onChange={handleChange}
                                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all"
                                    placeholder="+57"
                                />
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all placeholder-gray-600"
                                    placeholder="300 123 4567"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">País</label>
                            <input
                                type="text"
                                name="pais"
                                value={formData.pais || ''}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all placeholder-gray-600"
                                placeholder="Ej: Colombia"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Ciudad</label>
                            <input
                                type="text"
                                name="ciudad"
                                value={formData.ciudad || ''}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all placeholder-gray-600"
                                placeholder="Ej: Bogotá"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Estado</label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#00FFB0] focus:ring-1 focus:ring-[#00FFB0] outline-none transition-all [&>option]:bg-[#050b09]"
                            >
                                <option value="activo">Activo</option>
                                <option value="pausa">En Pausa</option>
                                <option value="no_activo">No Activo</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-[#00FFB0] text-[#050b09] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,176,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-[#050b09] border-t-transparent rounded-full animate-spin"></div>}
                            {clientToEdit ? 'Actualizar Cliente' : 'Crear Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;
