import clienteApi from '@/api/clienteApi'
import type { MantenimientoItem, CrearMantenimientoDto, ActualizarMantenimientoDto } from '@/modelos/Dashboard'

export default {
    /** Obtiene todos los mantenimientos de un vehiculo */
    async obtenerPorVehiculo(vehiculoId: number): Promise<MantenimientoItem[]> {
        const { data } = await clienteApi.get<MantenimientoItem[]>(`/Mantenimientos/vehiculo/${vehiculoId}`)
        return data
    },

    /** Crea un nuevo mantenimiento (solo ADMIN) */
    async crear(dto: CrearMantenimientoDto): Promise<MantenimientoItem> {
        const { data } = await clienteApi.post<MantenimientoItem>('/Mantenimientos', dto)
        return data
    },

    /** Actualiza un mantenimiento existente (solo ADMIN) */
    async actualizar(id: number, dto: ActualizarMantenimientoDto): Promise<MantenimientoItem> {
        const { data } = await clienteApi.put<MantenimientoItem>(`/Mantenimientos/${id}`, dto)
        return data
    },

    /** Elimina un mantenimiento del sistema (solo ADMIN) */
    async eliminar(id: number): Promise<void> {
        await clienteApi.delete(`/Mantenimientos/${id}`)
    },
}
