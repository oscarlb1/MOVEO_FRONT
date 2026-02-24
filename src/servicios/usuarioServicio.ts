import clienteApi from '@/api/clienteApi'
import type { UsuarioItem, EstadisticaUsuario } from '@/modelos/Dashboard'

export interface CrearUsuarioDto {
    nombre: string
    email: string
    password: string
    rol: string
}

export interface ActualizarUsuarioDto {
    nombre: string
    email: string
    password?: string
    rol: string
    telefono?: string | null
    imagenUrl?: string | null
}

export default {
    /** Lista todos los usuarios (ADMIN) */
    async obtenerTodos(): Promise<UsuarioItem[]> {
        const { data } = await clienteApi.get<UsuarioItem[]>('/Usuarios')
        return data
    },

    /** Obtiene un usuario por ID (ADMIN) */
    async obtenerPorId(id: number): Promise<UsuarioItem> {
        const { data } = await clienteApi.get<UsuarioItem>(`/Usuarios/${id}`)
        return data
    },

    /** Crea un nuevo usuario (ADMIN) */
    async crear(dto: CrearUsuarioDto): Promise<UsuarioItem> {
        const { data } = await clienteApi.post<UsuarioItem>('/Usuarios', dto)
        return data
    },

    /** Actualiza un usuario (ADMIN) */
    async actualizar(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioItem> {
        const { data } = await clienteApi.put<UsuarioItem>(`/Usuarios/${id}`, dto)
        return data
    },

    /** Elimina un usuario (ADMIN) */
    async eliminar(id: number): Promise<void> {
        await clienteApi.delete(`/Usuarios/${id}`)
    },

    /** Estadísticas de un usuario específico (ADMIN) */
    async obtenerEstadisticas(id: number): Promise<EstadisticaUsuario> {
        const { data } = await clienteApi.get<EstadisticaUsuario>(`/Estadisticas/usuario/${id}`)
        return data
    },
}
