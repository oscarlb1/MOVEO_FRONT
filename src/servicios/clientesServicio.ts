import clienteApi from '@/api/clienteApi';
import type { ClienteDto } from '@/modelos/Ruta';

export const clientesServicio = {
    obtenerTodos: async (): Promise<ClienteDto[]> => {
        const { data } = await clienteApi.get<ClienteDto[]>('/Clientes');
        return data;
    },
    obtenerPorId: async (id: number): Promise<ClienteDto> => {
        const { data } = await clienteApi.get<ClienteDto>(`/Clientes/${id}`);
        return data;
    }
};

export default clientesServicio;
