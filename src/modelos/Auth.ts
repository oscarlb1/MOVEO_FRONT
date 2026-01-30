import type { Usuario } from './Usuario';

export interface LoginPeticion {
    usuario: string;
    clave: string;
}

export interface LoginRespuesta {
    token: string;
    usuario: Usuario;
}
