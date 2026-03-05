import clienteApi from '@/api/clienteApi'
import type {
    EstadisticaGlobal,
    EstadisticasHoy,
    EntregaEstadisticasHoy,
    VehiculoItem,
    EntregaItem,
    NotificacionItem,
    RankingItem,
    RutaEstadisticas,
    ResumenSesion,
    MantenimientoItem,
    UbicacionItem,
} from '@/modelos/Dashboard'

export default {
    /** Estadísticas globales del sistema (requiere rol ADMIN) */
    async obtenerEstadisticasGlobales(): Promise<EstadisticaGlobal> {
        const { data } = await clienteApi.get<EstadisticaGlobal>('/Estadisticas/global')
        return data
    },

    /** Estadísticas del propio usuario hoy */
    async obtenerMisEstadisticasHoy(): Promise<EstadisticasHoy> {
        const { data } = await clienteApi.get<EstadisticasHoy>('/Estadisticas/me/hoy')
        return data
    },

    /** Estadísticas de entregas del día */
    async obtenerEntregasEstadisticasHoy(): Promise<EntregaEstadisticasHoy> {
        const { data } = await clienteApi.get<EntregaEstadisticasHoy>('/Entregas/estadisticas/hoy')
        return data
    },

    /** Lista de todos los vehículos (para estado de flota) */
    async obtenerVehiculos(): Promise<VehiculoItem[]> {
        const { data } = await clienteApi.get<VehiculoItem[]>('/Vehiculos')
        return data
    },

    /** Últimas entregas (con filtro de fecha opcional) */
    async obtenerEntregasRecientes(): Promise<EntregaItem[]> {
        const { data } = await clienteApi.get<EntregaItem[]>('/Entregas')
        return data
    },

    /** Notificaciones del usuario autenticado */
    async obtenerNotificaciones(): Promise<NotificacionItem[]> {
        const { data } = await clienteApi.get<NotificacionItem[]>('/Notificaciones')
        return data
    },

    /** Conteo de notificaciones no leídas */
    async obtenerConteoNoLeidas(): Promise<number> {
        const { data } = await clienteApi.get<number>('/Notificaciones/unread-count')
        return data
    },

    /** Top N repartidores — sortBy: 'entregas' | 'puntos' */
    async obtenerRanking(count = 4, sortBy: 'entregas' | 'puntos' = 'entregas'): Promise<RankingItem[]> {
        const { data } = await clienteApi.get<RankingItem[]>('/Estadisticas/ranking', {
            params: { count, sortBy },
        })
        return data
    },

    /** Marcar una notificación como leída */
    async marcarNotificacionLeida(id: number): Promise<void> {
        await clienteApi.put(`/Notificaciones/${id}/read`)
    },

    /** Marcar todas las notificaciones del usuario como leídas */
    async marcarTodasLeidas(): Promise<void> {
        await clienteApi.put('/Notificaciones/read-all')
    },

    /** Estadísticas de rutas (requiere rol ADMIN) */
    async obtenerEstadisticasRutas(): Promise<RutaEstadisticas> {
        const { data } = await clienteApi.get<RutaEstadisticas>('/Ruta/estadisticas')
        return data
    },

    /** Usuarios activos en este momento (requiere rol ADMIN) */
    async obtenerUsuariosActivos(rol?: string): Promise<ResumenSesion[]> {
        const { data } = await clienteApi.get<ResumenSesion[]>('/EstadoSesion/activos', {
            params: rol ? { rol } : {},
        })
        return data
    },

    /** Lista de mantenimientos registrados (requiere rol ADMIN) */
    async obtenerMantenimientos(): Promise<MantenimientoItem[]> {
        const { data } = await clienteApi.get<MantenimientoItem[]>('/Mantenimientos')
        return data
    },

    /** Todas las notificaciones del sistema (requiere rol ADMIN) */
    async obtenerTodasNotificacionesAdmin(): Promise<NotificacionItem[]> {
        const { data } = await clienteApi.get<NotificacionItem[]>('/Notificaciones/admin')
        return data
    },

    /** Envía notificación broadcast a todos los usuarios (requiere rol ADMIN) */
    async enviarBroadcast(titulo: string, mensaje: string): Promise<void> {
        await clienteApi.post('/Notificaciones/broadcast', { titulo, mensaje })
    },

    /** Envía notificación a un usuario específico (requiere rol ADMIN) */
    async enviarNotificacionUsuario(usuarioId: number, titulo: string, mensaje: string): Promise<void> {
        await clienteApi.post('/Notificaciones', { usuarioId, titulo, mensaje })
    },

    /** Rutas activas (estado EN_PROGRESO) para el KPI */
    async obtenerRutasActivas(): Promise<import('@/modelos/Dashboard').RutaItem[]> {
        const { data } = await clienteApi.get<import('@/modelos/Dashboard').RutaItem[]>('/Ruta', {
            params: { estado: 'EN_PROGRESO' },
        })
        return data
    },

    /** Obtener última ubicación de una ruta */
    async obtenerUltimaUbicacionRuta(rutaId: number): Promise<UbicacionItem | null> {
        try {
            const { data } = await clienteApi.get<UbicacionItem>(`/Ubicacion/ultimo/ruta/${rutaId}`)
            return data
        } catch {
            return null
        }
    },

    /** Obtener el historial completo de ubicaciones de una ruta */
    async obtenerHistorialUbicacionesRuta(rutaId: number): Promise<UbicacionItem[]> {
        try {
            const { data } = await clienteApi.get<UbicacionItem[]>(`/Ubicacion/ruta/${rutaId}`)
            return data
        } catch {
            return []
        }
    },
}

