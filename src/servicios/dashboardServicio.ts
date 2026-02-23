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

    /** Top N repartidores por ranking */
    async obtenerRanking(count = 4): Promise<RankingItem[]> {
        const { data } = await clienteApi.get<RankingItem[]>('/Estadisticas/ranking', {
            params: { count },
        })
        return data
    },

    /** Marcar una notificación como leída */
    async marcarNotificacionLeida(id: number): Promise<void> {
        await clienteApi.put(`/Notificaciones/${id}/read`)
    },

    /** Estadísticas de rutas (requiere rol ADMIN) */
    async obtenerEstadisticasRutas(): Promise<RutaEstadisticas> {
        const { data } = await clienteApi.get<RutaEstadisticas>('/Ruta/estadisticas')
        return data
    },
}
