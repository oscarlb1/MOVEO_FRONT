import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Usuario } from '@/modelos/Usuario';
import type { LoginPeticion } from '@/modelos/Auth';
import authServicio from '@/servicios/authServicio';

export const useSesionStore = defineStore('sesion', () => {
    const usuario = ref<Usuario | null>(null);
    const token = ref<string | null>(localStorage.getItem('token'));

    const estaAutenticado = computed(() => !!token.value);

    // Helper to decode JWT
    function parseJwt(token: string) {
        try {
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const base64Url = parts[1] || '';
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    async function iniciarSesion(credenciales: LoginPeticion) {
        try {
            const respuesta = await authServicio.login(credenciales);

            token.value = respuesta.tokenDeAcceso;
            localStorage.setItem('token', respuesta.tokenDeAcceso);

            // Try to extract user info from token
            const claims = parseJwt(respuesta.tokenDeAcceso);
            if (claims) {
                // Map claims to Usuario object as best as we can
                // Adjust claim keys based on actual backend JWT structure (usually 'sub', 'email', 'name', etc.)
                // For now, we use the input email if claim is missing, or generic placeholders
                usuario.value = {
                    id: parseInt(claims.sub || claims.id || '0'),
                    nombre: claims.unique_name || claims.name || 'Usuario',
                    email: claims.email || credenciales.email,
                    rol: claims.role || 'User'
                };
            }
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
