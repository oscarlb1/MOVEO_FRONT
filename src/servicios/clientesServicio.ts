import clienteApi from '@/api/clienteApi';
import type { ClienteDto, CrearClienteDto, ActualizarClienteDto } from '@/modelos/Ruta';

export const clientesServicio = {
    obtenerTodos: async (): Promise<ClienteDto[]> => {
        const { data } = await clienteApi.get<ClienteDto[]>('/Clientes');
        return data;
    },
    obtenerPorId: async (id: number): Promise<ClienteDto> => {
        const { data } = await clienteApi.get<ClienteDto>(`/Clientes/${id}`);
        return data;
    },
    crear: async (cliente: CrearClienteDto): Promise<ClienteDto> => {
        const { data } = await clienteApi.post<ClienteDto>('/Clientes', cliente);
        return data;
    },
    actualizar: async (id: number, cliente: ActualizarClienteDto): Promise<void> => {
        await clienteApi.put(`/Clientes/${id}`, cliente);
    },
    eliminar: async (id: number): Promise<void> => {
        await clienteApi.delete(`/Clientes/${id}`);
    }
};

export default clientesServicio;
