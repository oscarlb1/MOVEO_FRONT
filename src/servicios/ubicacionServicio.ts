import clienteApi from '@/api/clienteApi';

export interface UbicacionDto {
    id: number;
    rutaId: number;
    latitud: number;
    longitud: number;
    timestamp?: string;
    fecha?: string;
    fechaHora?: string;
}

export interface CrearUbicacionDto {
    rutaId: number;
    latitud: number;
    longitud: number;
    timestamp?: string;
    fecha?: string;
    fechaHora?: string;
}

const ubicacionServicio = {
    registrar: async (ubicacion: CrearUbicacionDto): Promise<UbicacionDto> => {
        const { data } = await clienteApi.post<UbicacionDto>('/Ubicacion', ubicacion);
        return data;
    },

    obtenerHistorialPorRuta: async (rutaId: number): Promise<UbicacionDto[]> => {
        const { data } = await clienteApi.get<UbicacionDto[]>(`/Ubicacion/ruta/${rutaId}`);
        return data;
    },

    eliminarHistorialRuta: async (rutaId: number): Promise<void> => {
        await clienteApi.delete(`/Ubicacion/ruta/${rutaId}`);
    },

    obtenerUltimaConocida: async (rutaId: number): Promise<UbicacionDto> => {
        const { data } = await clienteApi.get<UbicacionDto>(`/Ubicacion/ultimo/ruta/${rutaId}`);
        return data;
    },

    actualizar: async (id: number, ubicacion: CrearUbicacionDto): Promise<void> => {
        await clienteApi.put(`/Ubicacion/${id}`, ubicacion);
    },

    eliminar: async (id: number): Promise<void> => {
        await clienteApi.delete(`/Ubicacion/${id}`);
    }
};

export default ubicacionServicio;
