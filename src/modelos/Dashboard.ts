// Mapea UsuarioDto del backend
export interface UsuarioItem {
    id: number
    nombre: string
    email: string
    rol: 'ADMIN' | 'REPARTIDOR' | string
    imagenUrl: string | null
    telefono: string | null
    fechaRegistro: string
    ultimaConexion: string | null
}

// Mapea EstadisticaUsuarioDto del backend
export interface EstadisticaUsuario {
    usuarioId: number
    nombreUsuario: string
    puntosAcumulados: number
    kilometrosAhorrados: number
    entregasTotales: number
    imagenUrl?: string | null
}

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
    estado: 'EN_RUTA' | 'DISPONIBLE' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO' | string
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
    imagenUrl?: string | null
}

// Mapea RutaEstadisticasDto del backend
export interface RutaEstadisticas {
    totalRutas: number
    planificadas: number
    enProgreso: number
    completadas: number
    canceladas: number
}

// Mapea ResumenSesionDto del backend (GET /EstadoSesion/activos)
export interface ResumenSesion {
    usuarioId: number
    nombreUsuario: string
    rol: string
    ultimaConexion: string | null
    estaActivo: boolean
    imagenUrl?: string | null
}

// Mapea MantenimientoDto del backend (GET /Mantenimientos)
export interface MantenimientoItem {
    id: number
    vehiculoId: number
    fechaServicio: string
    tipoMantenimiento: string
    kilometrajeServicio: number
    coste: number
}

export interface CrearMantenimientoDto {
    vehiculoId: number
    fechaServicio: string
    tipoMantenimiento: string
    kilometrajeServicio: number
    coste: number
}

export interface ActualizarMantenimientoDto {
    fechaServicio: string
    tipoMantenimiento: string
    kilometrajeServicio: number
    coste: number
}

// Mapea RutaDto del backend (GET /Rutas)
export interface RutaItem {
    id: number
    nombre: string
    estado: 'PLANIFICADA' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | string
    conductorNombre: string | null
    vehiculoMatricula: string | null
}
