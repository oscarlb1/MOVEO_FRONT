import clienteApi from '@/api/clienteApi';
import type { RutaDto, RutaDetalleDto, RutaEstadisticasDto } from '@/modelos/Ruta';

const rutasServicio = {
    async obtenerTodas(estado?: string, conductorId?: number, vehiculoId?: number): Promise<RutaDto[]> {
        const params = new URLSearchParams();
        if (estado) params.append('estado', estado);
        if (conductorId) params.append('conductorId', conductorId.toString());
        if (vehiculoId) params.append('vehiculoId', vehiculoId.toString());

        const respuesta = await clienteApi.get<RutaDto[]>(`/Ruta?${params.toString()}`);
        return respuesta.data;
    },

    async obtenerPorId(id: number): Promise<RutaDetalleDto> {
        const respuesta = await clienteApi.get<RutaDetalleDto>(`/Ruta/${id}`);
        return respuesta.data;
    },

    async obtenerEstadisticas(): Promise<RutaEstadisticasDto> {
        const respuesta = await clienteApi.get<RutaEstadisticasDto>(`/Ruta/estadisticas`);
        return respuesta.data;
    },

    actualizarEstado: async (id: number, nuevoEstado: string): Promise<void> => {
        await clienteApi.patch(`/Ruta/${id}/estado`, { nuevoEstado });
    },
    crear: async (ruta: any): Promise<RutaDto> => {
        const { data } = await clienteApi.post<RutaDto>('/Ruta', ruta);
        return data;
    },
    actualizar: async (id: number, ruta: any): Promise<void> => {
        await clienteApi.put(`/Ruta/${id}`, ruta);
    },
    eliminar: async (id: number): Promise<void> => {
        await clienteApi.delete(`/Ruta/${id}`);
    }
};

export default rutasServicio;
