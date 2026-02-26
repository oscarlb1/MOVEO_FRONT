export interface RutaEstadisticasDto {
    totalRutas: number;
    planificadas: number;
    enProgreso: number;
    completadas: number;
    canceladas: number;
}

export interface RutaDto {
    id: number;
    fecha: string;
    conductorId: number;
    nombreConductor: string;
    vehiculoId: number;
    matriculaVehiculo: string;
    estado: string;
    distanciaTotalEstimada: number;
}

export interface ClienteDto {
    id: number;
    nombreEmpresa: string;
    direccion: string;
    telefono: string;
    latitud: number | null;
    longitud: number | null;
}

export interface EntregaDto {
    id: number;
    rutaId: number;
    clienteId: number;
    cliente?: ClienteDto;
    ordenParada: number;
    estado: string;
    horaEntregaReal: string | null;
    fotoUrl: string | null;
    firmaDigitalUrl: string | null;
    notas: string | null;
    codigoQr: string | null;
}

export interface RutaDetalleDto extends RutaDto {
    entregas: EntregaDto[];
}

export interface CrearRutaDto {
    fecha: string; // ISO string
    conductorId: number;
    vehiculoId: number;
    estado?: string;
    distanciaTotalEstimada?: number;
}

export interface ActualizarRutaDto {
    fecha: string; // ISO string
    conductorId: number;
    vehiculoId: number;
    estado: string;
    distanciaTotalEstimada?: number;
}

export interface CrearEntregaDto {
    rutaId: number;
    clienteId: number;
    ordenParada: number;
    notas?: string | null;
    codigoQr?: string | null;
}
