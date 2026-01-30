<template>
  <div class="inicio-vista">
    <h1>Bienvenido, {{ nombreUsuario }}</h1>
    <p>Esta es la página de inicio protegida.</p>
    <BotonBase @click="manejarLogout">Cerrar Sesión</BotonBase>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSesionStore } from '@/tiendas/sesion';
import BotonBase from '@/componentes/comunes/BotonBase.vue';

const router = useRouter();
const sesionStore = useSesionStore();

const nombreUsuario = computed(() => sesionStore.usuario?.nombre || 'Usuario');

function manejarLogout() {
  sesionStore.cerrarSesion();
  router.push('/login');
}
</script>

<style scoped>
.inicio-vista {
  padding: 2rem;
  text-align: center;
}
</style>
