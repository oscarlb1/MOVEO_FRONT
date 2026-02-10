import { createRouter, createWebHistory } from 'vue-router';
import { useSesionStore } from '@/tiendas/sesion';
import LoginVista from '@/vistas/LoginVista.vue';
import InicioVista from '@/vistas/InicioVista.vue';
import ContactoVista from '@/vistas/ContactoVista.vue';
import ServiciosVista from '@/vistas/ServiciosVista.vue';
import DashboardDemoVista from '@/vistas/DashboardDemoVista.vue';
import ServiciosContratadosVista from '@/vistas/ServiciosContratadosVista.vue';
import ConfiguracionVista from '@/vistas/ConfiguracionVista.vue';
import PrivacidadVista from '@/vistas/PrivacidadVista.vue';
import TerminosVista from '@/vistas/TerminosVista.vue';
import CookiesVista from '@/vistas/CookiesVista.vue';

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
            component: ContactoVista,
            meta: { publico: true }
        },
        {
            path: '/',
            name: 'inicio',
            component: InicioVista,
            meta: { publico: true }
        },
        {
            path: '/servicios',
            name: 'servicios',
            component: ServiciosVista,
            meta: { publico: true }
        },
        {
            path: '/dashboard-demo',
            name: 'dashboard-demo',
            component: () => import('@/vistas/DashboardDemoVista.vue'),
            meta: { publico: true }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/vistas/DashboardVista.vue'),
            meta: { publico: true }
        },
        {
            path: '/configuracion',
            name: 'configuracion',
            component: () => import('@/vistas/ConfiguracionVista.vue'),
            meta: { requiereAuth: true }
        },
        {
            path: '/privacidad',
            name: 'privacidad',
            component: PrivacidadVista,
            meta: { publico: true }
        },
        {
            path: '/terminos',
            name: 'terminos',
            component: TerminosVista,
            meta: { publico: true }
        },
        {
            path: '/cookies',
            name: 'cookies',
            component: CookiesVista,
            meta: { publico: true }
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
        next({ name: 'dashboard' });
    }
    else {
        next();
    }
});

export default router;