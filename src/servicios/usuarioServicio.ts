import clienteApi from '@/api/clienteApi'
import type { UsuarioItem, EstadisticaUsuario } from '@/modelos/Dashboard'

export interface CrearUsuarioDto {
    nombre: string
    email: string
    password: string
    rol: string
    telefono?: string | null
    imagen?: File
}

export interface ActualizarUsuarioDto {
    nombre: string
    email: string
    password?: string
    rol: string
    telefono?: string | null
    imagenUrl?: string | null
    imagen?: File
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
        const formData = new FormData()
        formData.append('nombre', dto.nombre)
        formData.append('email', dto.email)
        formData.append('password', dto.password)
        formData.append('rol', dto.rol)
        if (dto.telefono) formData.append('telefono', dto.telefono)
        if (dto.imagen) {
            formData.append('imagen', dto.imagen)
        }

        const { data } = await clienteApi.post<UsuarioItem>('/Usuarios', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return data
    },

    /** Actualiza un usuario (ADMIN) */
    async actualizar(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioItem> {
        const formData = new FormData()
        formData.append('nombre', dto.nombre)
        formData.append('email', dto.email)
        formData.append('rol', dto.rol)
        if (dto.password) formData.append('password', dto.password)
        if (dto.telefono) formData.append('telefono', dto.telefono)
        if (dto.imagenUrl) formData.append('imagenUrl', dto.imagenUrl)
        if (dto.imagen) {
            formData.append('imagen', dto.imagen)
        }

        const { data } = await clienteApi.put<UsuarioItem>(`/Usuarios/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return data
    },

    /** Actualiza el perfil del usuario autenticado (Permite subir imagen via FormData) */
    async actualizarMiPerfil(formData: FormData): Promise<UsuarioItem> {
        const { data } = await clienteApi.put<UsuarioItem>('/Usuarios/me', formData)
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
