import type { Usuario } from './Usuario';

export interface LoginPeticion {
    email: string; // Changed from usuario to match Backend DTO
    password: string; // Changed from clave to match Backend DTO
}

export interface LoginRespuesta {
    tokenDeAcceso: string;
    tokenDeRefresco: string;
    // usuario: Usuario; // Backend does not return user object on login currently
}
