import clienteApi from '@/api/clienteApi';
import type { LoginPeticion, LoginRespuesta } from '@/modelos/Auth';

export default {
    async login(credenciales: LoginPeticion): Promise<LoginRespuesta> {
        // Backend endpoint is /Auth/iniciar-sesion
        const respuesta = await clienteApi.post<LoginRespuesta>('/Auth/iniciar-sesion', credenciales);
        return respuesta.data;
    },

    async logout(): Promise<void> {
        await clienteApi.post('/Auth/cerrar-sesion');
    }
};
