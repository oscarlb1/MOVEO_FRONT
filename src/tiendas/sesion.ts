import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Usuario } from '@/modelos/Usuario';
import type { LoginPeticion } from '@/modelos/Auth';
import authServicio from '@/servicios/authServicio';

export const useSesionStore = defineStore('sesion', () => {
    const usuario = ref<Usuario | null>(null);
    const token = ref<string | null>(localStorage.getItem('token'));

    const estaAutenticado = computed(() => !!token.value);

    async function iniciarSesion(credenciales: LoginPeticion) {
        try {
            const respuesta = await authServicio.login(credenciales);
            usuario.value = respuesta.usuario;
            token.value = respuesta.token;
            localStorage.setItem('token', respuesta.token);
        } catch (error) {
            console.error('Error al iniciar sesión', error);
            throw error;
        }
    }

    function cerrarSesion() {
        usuario.value = null;
        token.value = null;
        localStorage.removeItem('token');
        authServicio.logout();
    }

    return {
        usuario,
        token,
        estaAutenticado,
        iniciarSesion,
        cerrarSesion
    };
});
