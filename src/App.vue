<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Toaster } from 'vue-sonner'
import PieDePagina from '@/componentes/PieDePagina.vue'
import Encabezado from '@/componentes/Encabezado.vue'
import AvisoCookies from '@/componentes/comunes/AvisoCookies.vue'
import { useTemaStore } from '@/tiendas/tema'

const temaStore = useTemaStore()
temaStore.aplicarTema()

const router = useRouter()
const route = useRoute()

// Map current route name/path to 'Pagina' type for the header
const paginaActiva = computed(() => {
  const current = route.path
  if (current === '/dashboard') return 'dashboard'
  if (current === '/login') return 'login'
  if (current === '/services') return 'services'
  if (current === '/contacto') return 'contacto'
  if (current === '/configuracion') return 'configuracion'
  return 'home'
})

const mostrarNavegacion = computed(() => {
  if (paginaActiva.value === 'login') return false
  if (paginaActiva.value === 'contacto' && route.query.sinHeader === 'true') return false
  return true
})

const navegar = (pagina: 'home' | 'services' | 'dashboard' | 'login' | 'contacto' | 'configuracion') => {
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
    case 'contacto':
      router.push('/contacto')
      break
    case 'configuracion':
      router.push('/configuracion')
      break
  }
}
</script>

<template>
  <Toaster position="top-center" richColors closeButton theme="dark" />
  <Encabezado v-if="mostrarNavegacion" :pagina-activa="paginaActiva" @navegar="navegar" />
  <main :class="{ 'pt-0': !mostrarNavegacion }">
    <RouterView />
  </main>
  <PieDePagina v-if="mostrarNavegacion" />
  <AvisoCookies />
</template>

<style>
</style>
