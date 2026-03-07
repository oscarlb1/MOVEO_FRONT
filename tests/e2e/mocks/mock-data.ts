export const MOCK_DATA = {
    auth: {
        token: 'fake-jwt-token-for-ci',
        user: {
            id: 1,
            email: 'admin@example.com',
            rol: 'ADMIN',
            nombre: 'Admin',
            apellidos: 'Playwright',
        }
    },
    vehiculos: [
        { id: 1, matricula: '1111 AAA', marcaModelo: 'Ford Transit', estado: 'DISPONIBLE', capacidadCarga: 1200, consumoMedio: 8.5, kilometrajeActual: 45000, ultimaRevision: '2025-01-01T00:00:00Z' },
        { id: 2, matricula: '2222 BBB', marcaModelo: 'Renault Kangoo', estado: 'EN_RUTA', capacidadCarga: 800, consumoMedio: 6.5, kilometrajeActual: 120000, ultimaRevision: '2024-11-15T00:00:00Z' },
        { id: 3, matricula: '3333 CCC', marcaModelo: 'Mercedes Sprinter', estado: 'MANTENIMIENTO', capacidadCarga: 1500, consumoMedio: 10.2, kilometrajeActual: 85000, ultimaRevision: '2025-02-20T00:00:00Z' },
        { id: 4, matricula: '4444 DDD', marcaModelo: 'Peugeot Partner', estado: 'DISPONIBLE', capacidadCarga: 600, consumoMedio: 5.5, kilometrajeActual: 30000, ultimaRevision: '2025-03-01T00:00:00Z' },
        { id: 5, matricula: '5555 EEE', marcaModelo: 'Fiat Ducato', estado: 'BAJA', capacidadCarga: 1300, consumoMedio: 9.0, kilometrajeActual: 200000, ultimaRevision: '2023-05-10T00:00:00Z' }
    ],
    rutas: [
        {
            id: 1,
            fecha: '2025-03-05T08:00:00Z',
            conductorId: 2,
            nombreConductor: 'Repartidor Test',
            vehiculoId: 1,
            matriculaVehiculo: '1111 AAA',
            estado: 'COMPLETADA',
            distanciaTotalEstimada: 45,
            entregas: [
                { id: 1, rutaId: 1, clienteId: 1, ordenParada: 1, estado: 'ENTREGADO', cliente: { id: 1, nombreEmpresa: 'Cliente Test', direccion: 'Calle Falsa 123', telefono: '600123456', latitud: 41.6488, longitud: -0.8891 } }
            ]
        },
        {
            id: 2,
            fecha: '2025-03-07T09:00:00Z',
            conductorId: 2,
            nombreConductor: 'Repartidor Test',
            vehiculoId: 2,
            matriculaVehiculo: '2222 BBB',
            estado: 'EN_CURSO',
            distanciaTotalEstimada: 30,
            entregas: []
        }
    ],
    entregas: [
        {
            id: 1,
            codigoSeguimiento: 'TRK123456',
            estado: 'ENTREGADO',
            rutaId: 1,
            clienteId: 1,
            fechaEstimada: '2025-03-05T10:00:00Z',
            requireFirma: true,
            cliente: { id: 1, nombreEmpresa: 'Cliente Test', direccion: 'Calle Falsa 123', telefono: '600123456', latitud: 41.6488, longitud: -0.8891 }
        }
    ],
    usuarios: [
        { id: 1, nombre: 'Admin', apellidos: 'Playwright', email: 'admin@example.com', rol: 'ADMIN', estado: 'ACTIVO' },
        { id: 2, nombre: 'Repartidor', apellidos: 'Test', email: 'repartidor@example.com', rol: 'REPARTIDOR', estado: 'ACTIVO' }
    ],
    clientes: [
        { id: 1, nombreEmpresa: 'Cliente Test', direccion: 'Calle Falsa 123', telefono: '600123456', latitud: 41.6488, longitud: -0.8891 }
    ],
    estadisticasGlobal: {
        totalVehiculos: 5,
        vehiculosDisponibles: 2,
        vehiculosEnRuta: 1,
        vehiculosEnMantenimiento: 1,
        totalRutas: 10,
        rutasCompletadas: 5,
        rutasEnProgreso: 3,
        rutasPendientes: 2,
        totalEntregas: 50,
        entregasCompletadas: 40,
        entregasFallidas: 2,
        entregasPendientes: 8,
        ingresosTotales: 15000,
        gastosTotales: 5000,
        beneficioNeto: 10000
    },
    estadisticasRutas: {
        totalRutas: 3,
        planificadas: 1,
        enProgreso: 1,
        completadas: 1,
        canceladas: 0
    },
    ranking: [
        { usuarioId: 2, nombre: 'Repartidor', apellidos: 'Test', valoracion: 4.8, totalEntregas: 150, puntos: 500 }
    ],
    notificaciones: [],
    mantenimientos: []
}
