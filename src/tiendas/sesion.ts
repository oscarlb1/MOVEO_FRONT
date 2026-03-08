import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Usuario } from '@/modelos/Usuario';
import type { LoginPeticion } from '@/modelos/Auth';
import authServicio from '@/servicios/authServicio';

export const useSesionStore = defineStore('sesion', () => {
    const usuario = ref<Usuario | null>(null);
    const token = ref<string | null>(localStorage.getItem('token'));
    const haVistoCargador = ref(false);

    const estaAutenticado = computed(() => !!token.value && !!usuario.value);

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
                usuario.value = {
                    id: parseInt(claims.sub || claims.id || claims.nameid || '0'),
                    nombre: claims.unique_name
                        || claims.name
                        || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                        || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']
                        || claims.given_name
                        || claims.preferred_username
                        || 'Usuario',
                    email: claims.email
                        || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
                        || credenciales.email,
                    rol: claims.role
                        || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                        || 'User',
                    imagenUrl: claims.imagen_url
                        || claims.imagenUrl
                        || null
                };
            }
        } catch (error) {
            console.error('Error al iniciar sesión', error);
            throw error;
        }
    }

    async function cerrarSesion() {
        try {
            await authServicio.logout();
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        } finally {
            usuario.value = null;
            token.value = null;
            haVistoCargador.value = false;
            localStorage.removeItem('token');
        }
    }

    // Initialize user from token if it exists (on page reload)
    if (token.value) {
        const claims = parseJwt(token.value);
        if (claims) {
            usuario.value = {
                id: parseInt(claims.sub || claims.id || claims.nameid || '0'),
                nombre: claims.unique_name
                    || claims.name
                    || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                    || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']
                    || claims.given_name
                    || claims.preferred_username
                    || 'Usuario',
                email: claims.email
                    || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
                    || 'usuario@moveo.com',
                rol: claims.role
                    || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                    || 'User',
                imagenUrl: claims.imagen_url
                    || claims.imagenUrl
                    || null
            };
        }
    }

    return {
        usuario,
        token,
        estaAutenticado,
        haVistoCargador,
        iniciarSesion,
        cerrarSesion
    };
});
