import clienteApi from '@/api/clienteApi'
import type { VehiculoItem } from '@/modelos/Dashboard'

export interface CreateVehiculoDto {
    matricula: string
    marcaModelo: string
    estado: string
    capacidadCarga: number
    consumoMedio: number
    kilometrajeActual: number
    fechaUltimaRevision: string | null
}

export interface UpdateVehiculoDto {
    matricula?: string
    marcaModelo?: string
    estado?: string
    capacidadCarga?: number
    consumoMedio?: number
    kilometrajeActual?: number
    fechaUltimaRevision?: string | null
}

export default {
    /** Obtiene todos los vehículos de la flota */
    async obtenerTodos(): Promise<VehiculoItem[]> {
        const { data } = await clienteApi.get<VehiculoItem[]>('/Vehiculos')
        return data
    },

    /** Obtiene un vehículo por ID */
    async obtenerPorId(id: number): Promise<VehiculoItem> {
        const { data } = await clienteApi.get<VehiculoItem>(`/Vehiculos/${id}`)
        return data
    },

    /** Crea un nuevo vehículo (solo ADMIN) */
    async crear(dto: CreateVehiculoDto): Promise<VehiculoItem> {
        const { data } = await clienteApi.post<VehiculoItem>('/Vehiculos', dto)
        return data
    },

    /** Actualiza un vehículo existente (solo ADMIN) */
    async actualizar(id: number, dto: UpdateVehiculoDto): Promise<VehiculoItem> {
        const { data } = await clienteApi.put<VehiculoItem>(`/Vehiculos/${id}`, dto)
        return data
    },

    /** Elimina un vehículo del sistema (solo ADMIN) */
    async eliminar(id: number): Promise<void> {
        await clienteApi.delete(`/Vehiculos/${id}`)
    },
}
