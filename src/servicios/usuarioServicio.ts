import clienteApi from '@/api/clienteApi';
import type { Usuario } from '@/modelos/Usuario';

export default {
    async obtenerPerfil(): Promise<Usuario> {
        const respuesta = await clienteApi.get<Usuario>('/usuario/perfil');
        return respuesta.data;
    },

    async actualizarPerfil(usuario: Usuario): Promise<Usuario> {
        const respuesta = await clienteApi.put<Usuario>(`/usuario/${usuario.id}`, usuario);
        return respuesta.data;
    }
};
