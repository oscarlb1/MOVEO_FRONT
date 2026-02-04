import { createRouter, createWebHistory } from 'vue-router';
import { useSesionStore } from '@/tiendas/sesion';
import LoginVista from '@/vistas/LoginVista.vue';
import InicioVista from '@/vistas/InicioVista.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginVista,
            meta: { publico: true }
        },
        {
            path: '/contacto',
            name: 'contacto',
            component: () => import('@/vistas/ContactoVista.vue'),
            meta: { publico: true }
        },
        {
            path: '/',
            name: 'inicio',
            component: InicioVista,
            meta: { requiereAuth: true }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: InicioVista,
            meta: { requiereAuth: true }
        }
    ]
});

router.beforeEach((to, from, next) => {
    const sesionStore = useSesionStore();

    // Verifica si la ruta requiere autenticación
    if (to.meta.requiereAuth && !sesionStore.estaAutenticado) {
        next({ name: 'login' });
    }
    // Evita que usuarios autenticados vayan al login
    else if (to.name === 'login' && sesionStore.estaAutenticado) {
        next({ name: 'inicio' });
    }
    else {
        next();
    }
});

export default router;
