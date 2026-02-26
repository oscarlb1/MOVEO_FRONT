import clienteApi from '@/api/clienteApi';
import type { EntregaDto, CrearEntregaDto } from '@/modelos/Ruta';

export const entregasServicio = {
    crear: async (entrega: CrearEntregaDto): Promise<EntregaDto> => {
        const { data } = await clienteApi.post<EntregaDto>('/Entregas', entrega);
        return data;
    },
    eliminar: async (id: number): Promise<void> => {
        await clienteApi.delete(`/Entregas/${id}`);
    }
};

export default entregasServicio;
