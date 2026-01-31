import api from './client';

export interface Cliente {
    id: number;
    user_id: number;
    cliente_id: string; // HE-XXXXX
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    tipo_identificacion: 'cedula' | 'cedula_extranjeria' | 'pasaporte' | 'nit' | 'otro';
    numero_identificacion: string;
    country_code: string;
    phone_number: string;
    estado: 'activo' | 'pausa' | 'no_activo';
    pais: string;
    ciudad: string;
}

export interface CreateClienteData {
    first_name: string;
    last_name: string;
    email: string;
    tipo_identificacion: string;
    numero_identificacion: string;
    country_code: string;
    phone_number: string;
    estado?: string;
    pais?: string;
    ciudad?: string;
}

export interface UpdateClienteData extends Partial<CreateClienteData> { }

const clientesService = {
    getAll: async () => {
        const response = await api.get<Cliente[]>('/clientes/');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Cliente>(`/clientes/${id}/`);
        return response.data;
    },

    create: async (data: CreateClienteData) => {
        const response = await api.post<Cliente>('/clientes/', data);
        return response.data;
    },

    update: async (id: number, data: UpdateClienteData) => {
        const response = await api.put<Cliente>(`/clientes/${id}/`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/clientes/${id}/`);
    }
};

export default clientesService;
