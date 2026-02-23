// Mapea EstadisticaGlobalDto del backend
export interface EstadisticaGlobal {
    totalUsuarios: number
    totalEntregasTotales: number
    totalKilometrosAhorrados: number
    totalPuntosAcumulados: number
}

// Mapea EstadisticaHoyDto del backend
export interface EstadisticasHoy {
    entregasTotales: number
    entregasCompletadas: number
    eficiencia: number
    tiempoEnRuta: string
}

// Mapea EntregaEstadisticasDto del backend
export interface EntregaEstadisticasHoy {
    totalHoy: number
    pendientes: number
    completadas: number
    fallidas: number
}

// Mapea VehiculoDto del backend
export interface VehiculoItem {
    id: number
    matricula: string
    marcaModelo: string
    estado: 'EN_RUTA' | 'DISPONIBLE' | 'MANTENIMIENTO' | 'FUERA_DE_SERVICIO' | string
    capacidadCarga: number
    consumoMedio: number
    kilometrajeActual: number
    fechaUltimaRevision: string | null
}

// Mapea EntregaDto del backend
export interface EntregaItem {
    id: number
    rutaId: number
    clienteId: number
    cliente: { id: number; nombre: string; email: string; direccion: string } | null
    ordenParada: number
    estado: 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'FALLIDO' | string
    horaEntregaReal: string | null
    fotoUrl: string | null
    firmaDigitalUrl: string | null
    notas: string | null
    codigoQr: string | null
    createdAt: string
    updatedAt: string
}

// Mapea NotificacionDto del backend
export interface NotificacionItem {
    id: number
    usuarioId: number | null
    nombreUsuario: string
    titulo: string
    mensaje: string
    leido: boolean
    fecha: string
}

// Mapea RankingUsuarioDto del backend
export interface RankingItem {
    posicion: number
    usuarioId: number
    nombreUsuario: string
    puntos: number
    entregasTotales: number
}

// Mapea RutaEstadisticasDto del backend
export interface RutaEstadisticas {
    totalRutas: number
    planificadas: number
    enProgreso: number
    completadas: number
    canceladas: number
}
