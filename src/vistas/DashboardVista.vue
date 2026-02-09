<script setup lang="ts">
import { useSesionStore } from '@/tiendas/sesion';
import DashboardDemoVista from './DashboardDemoVista.vue';
import ServiciosContratadosVista from './ServiciosContratadosVista.vue';

const sesionStore = useSesionStore();
</script>

<template>
  <div class="animate-in fade-in duration-300">
    <ServiciosContratadosVista v-if="sesionStore.estaAutenticado" />
    <DashboardDemoVista v-else />
  </div>
</template>
