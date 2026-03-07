/**
 * Formatea un string de estado (ej: EN_PROGRESO) a un formato legible (ej: En Progreso)
 * @param estado El string del estado a formatear
 * @returns El estado formateado
 */
export function formatearEstado(estado: string | undefined | null): string {
    if (!estado) return 'Desconocido';

    // Reemplazar guiones bajos por espacios, convertir a minúsculas y capitalizar palabras
    return estado
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
