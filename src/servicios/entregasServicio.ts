import clienteApi from '@/api/clienteApi';
import type { EntregaDto, CrearEntregaDto } from '@/modelos/Ruta';

export interface EntregasEstadisticasDto {
    totalHoy: number;
    completadas: number;
    pendientes: number;
    fallidas: number;
}

export const entregasServicio = {
    obtenerTodas: async (rutaId?: number, clienteId?: number, estado?: string, fecha?: string): Promise<EntregaDto[]> => {
        const params = new URLSearchParams();
        if (rutaId) params.append('rutaId', rutaId.toString());
        if (clienteId) params.append('clienteId', clienteId.toString());
        if (estado) params.append('estado', estado);
        if (fecha) params.append('fecha', fecha);

        const { data } = await clienteApi.get<EntregaDto[]>(`/Entregas?${params.toString()}`);
        return data;
    },

    obtenerPorId: async (id: number): Promise<EntregaDto> => {
        const { data } = await clienteApi.get<EntregaDto>(`/Entregas/${id}`);
        return data;
    },

    obtenerPorRuta: async (rutaId: number): Promise<EntregaDto[]> => {
        const { data } = await clienteApi.get<EntregaDto[]>(`/Entregas/rutas/${rutaId}`);
        return data;
    },

    crear: async (entrega: CrearEntregaDto): Promise<EntregaDto> => {
        const { data } = await clienteApi.post<EntregaDto>('/Entregas', entrega);
        return data;
    },

    actualizarEstado: async (id: number, nuevoEstado: string): Promise<void> => {
        await clienteApi.put(`/Entregas/${id}/estado`, { nuevoEstado });
    },

    eliminar: async (id: number): Promise<void> => {
        await clienteApi.delete(`/Entregas/${id}`);
    },

    obtenerEstadisticasHoy: async (): Promise<EntregasEstadisticasDto> => {
        const { data } = await clienteApi.get<EntregasEstadisticasDto>('/Entregas/estadisticas/hoy');
        return data;
    }
};

export default entregasServicio;
