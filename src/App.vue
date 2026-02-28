<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Toaster } from 'vue-sonner'
import PieDePagina from '@/componentes/PieDePagina.vue'
import Encabezado from '@/componentes/Encabezado.vue'
import BannerCookies from '@/componentes/comunes/BannerCookies.vue'
import { useTemaStore } from '@/tiendas/tema'
import { useSesionStore } from '@/tiendas/sesion'

const temaStore = useTemaStore()
temaStore.aplicarTema()
const sesionStore = useSesionStore()

const router = useRouter()
const route = useRoute()

// Map current route name/path to 'Pagina' type for the header
const paginaActiva = computed(() => {
  const name = route.name as string
  const path = route.path

  if (name === 'dashboard' || path.startsWith('/dashboard')) return 'dashboard'
  if (name === 'login' || path === '/login') return 'login'
  if (name === 'servicios' || path.startsWith('/servicios')) return 'services'
  if (name === 'contacto') return 'contacto'
  if (name === 'configuracion') return 'configuracion'
  
  return 'home'
})

const mostrarLayout = computed(() => {
  const name = route.name as string
  if (name === 'login') return false
  if (name === 'dashboard') return false
  return true
})

const navegar = (pagina: 'home' | 'services' | 'dashboard' | 'login' | 'contacto' | 'configuracion') => {
  switch (pagina) {
    case 'home':
      router.push({ name: 'inicio' })
      break
    case 'services':
      router.push({ name: 'servicios' })
      break
    case 'dashboard':
      if (sesionStore.estaAutenticado) {
        router.push({ name: 'dashboard' })
      } else {
        router.push({ name: 'dashboard-demo' })
      }
      break
    case 'login':
      router.push({ name: 'login' })
      break
    case 'contacto':
      router.push({ name: 'contacto' })
      break
    case 'configuracion':
      router.push({ name: 'configuracion' })
      break
  }
}
</script>

<template>
  <Toaster position="top-center" richColors closeButton theme="dark" />
  <Encabezado v-if="mostrarLayout" :pagina-activa="paginaActiva" @navegar="navegar" />
  <RouterView v-slot="{ Component }">
    <component :is="Component" @navegar="navegar" />
  </RouterView>
  <PieDePagina v-if="mostrarLayout" />
  <BannerCookies />
</template>

<style>
</style>
