<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Toaster } from 'vue-sonner'
import PieDePagina from '@/componentes/PieDePagina.vue'
import Encabezado from '@/componentes/Encabezado.vue'

const router = useRouter()
const route = useRoute()

// Map current route name/path to 'Pagina' type for the header
const paginaActiva = computed(() => {
  const current = route.path
  if (current === '/dashboard') return 'dashboard'
  if (current === '/login') return 'login'
  if (current === '/services') return 'services'
  return 'home'
})

const navegar = (pagina: 'home' | 'services' | 'dashboard' | 'login') => {
  switch (pagina) {
    case 'home':
      router.push('/')
      break
    case 'services':
      router.push('/services')
      break
    case 'dashboard':
      router.push('/dashboard')
      break
    case 'login':
      router.push('/login')
      break
  }
}
</script>

<template>
  <Toaster position="top-center" richColors closeButton theme="dark" />
  <Encabezado v-if="paginaActiva !== 'login'" :pagina-activa="paginaActiva" @navegar="navegar" />
  <RouterView />
  <PieDePagina v-if="paginaActiva !== 'login'" />
</template>

<style>
</style>
