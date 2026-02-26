export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  imagenUrl?: string; // Propiedad opcional para la imagen de Cloudinary
}
