import clienteApi from '@/api/clienteApi';
import type { LoginPeticion, LoginRespuesta } from '@/modelos/Auth';

export default {
    async login(credenciales: LoginPeticion): Promise<LoginRespuesta> {
        // Backend endpoint is /Auth/iniciar-sesion
        const respuesta = await clienteApi.post<LoginRespuesta>('/Auth/iniciar-sesion', credenciales);
        return respuesta.data;
    },

    logout() {
        // Si el backend requiere notificar el logout, se hace aquí.
        // De lo contrario, solo se limpia el cliente/token localmente (manejado en la tienda).
    }
};
