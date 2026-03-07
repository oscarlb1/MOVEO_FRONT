<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '@/tiendas/sesion'
import dashboardServicio from '@/servicios/dashboardServicio'
import {
  LogOut, Settings, Bell, Search, Menu, User,
  LayoutDashboard, Truck, Users, Map, Package, Activity,
  Moon, Sun, X, ChevronRight, Briefcase
} from 'lucide-vue-next'

import GeneralVista from './GeneralVista.vue'
import RutasVista from './RutasVista.vue'
import VehiculosVista from './VehiculosVista.vue'
import UsuariosVista from './UsuariosVista.vue'
import EntregasVista from './EntregasVista.vue'
import ClientesVista from './ClientesVista.vue'

import { useTemaStore } from '@/tiendas/tema'

const router = useRouter()
const sesionStore = useSesionStore()
const temaStore = useTemaStore()

const seccionActiva = ref('general')
const sidebarAbierto = ref(false)
const perfilAbierto = ref(false)

// Usamos el store para el modo oscuro
const darkMode = computed(() => temaStore.isDark)

const esAdmin = computed(() => sesionStore.usuario?.rol === 'ADMIN')
const nombreUsuario = computed(() => sesionStore.usuario?.nombre || 'Usuario')
const correoUsuario = computed(() => sesionStore.usuario?.email || '')
const rolUsuario = computed(() => sesionStore.usuario?.rol || '')
const inicialUsuario = computed(() => nombreUsuario.value.substring(0, 1).toUpperCase())
const imagenUsuario = computed(() => sesionStore.usuario?.imagenUrl || null)

const conteoNoLeidas = ref(0)
let intervaloActualizacion: ReturnType<typeof setInterval>

const itemsMenuBase = [
  { id: 'general', label: 'Vista General', icon: LayoutDashboard },
  { id: 'rutas', label: 'Rutas', icon: Map },
  { id: 'entregas', label: 'Entregas', icon: Package },
]
const itemsMenuAdmin = [
  { id: 'vehiculos', label: 'Vehículos', icon: Truck },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'clientes', label: 'Clientes', icon: Briefcase },
]
const itemsMenu = computed(() => {
  return esAdmin.value
    ? [...itemsMenuBase, ...itemsMenuAdmin]
    : itemsMenuBase
})

function irASeccion(id: string) {
  seccionActiva.value = id
  sidebarAbierto.value = false
}

// Opcional: si quieres seguir teniendo un botón para alternar el tema desde aquí
function alternarTema() {
  const nuevoTema = temaStore.isDark ? 'claro' : 'oscuro'
  temaStore.setTema(nuevoTema)
}

async function cerrarSesion() {
  await sesionStore.cerrarSesion()
  router.push('/login')
}

function handleActualizarNoLeidas(conteo: number) {
  conteoNoLeidas.value = conteo
}

onMounted(() => {
  temaStore.aplicarTema()
  dashboardServicio.obtenerConteoNoLeidas().then(c => conteoNoLeidas.value = c).catch(() => {})
  intervaloActualizacion = setInterval(() => {
    dashboardServicio.obtenerConteoNoLeidas().then(c => conteoNoLeidas.value = c).catch(() => {})
  }, 60000)
})

onUnmounted(() => {
  clearInterval(intervaloActualizacion)
})
</script>

<template>
  <div class="h-screen flex overflow-hidden font-inter transition-colors duration-300 bg-[#FAFAFA] dark:bg-[#16181A] text-[#092C4C] dark:text-white">

    <Transition name="fade">
      <div v-if="sidebarAbierto"
        class="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        @click="sidebarAbierto = false">
      </div>
    </Transition>

    <aside class="fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-all duration-300 transform border-r border-gray-100 dark:border-[#374B54] bg-white dark:bg-[#272A30] shadow-sm lg:translate-x-0"
      :class="sidebarAbierto ? 'translate-x-0' : '-translate-x-full'">

      <div class="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-[#374B54]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E67E50] to-[#E67E50]/80 flex items-center justify-center shadow-lg shadow-[#E67E50]/20">
            <Activity class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tight flex items-center gap-0.5 text-[#092C4C] dark:text-white">
              MOVE<span class="text-[#E67E50]">O</span>
            </h1>
            <p class="text-[10px] font-bold tracking-widest uppercase opacity-60">Logística</p>
          </div>
        </div>
        <button class="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-[#16181A] text-[#424242] dark:text-[#82A1B1]"
          @click="sidebarAbierto = false">
          <X class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin">
        <button
          v-for="item in itemsMenu" :key="item.id"
          @click="irASeccion(item.id)"
          class="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative"
          :class="[
            seccionActiva === item.id
              ? 'bg-[#E67E50]/10 dark:bg-[#E67E50]/15 text-[#E67E50]'
              : 'text-[#757575] dark:text-[#82A1B1] hover:bg-gray-50 dark:hover:bg-[#16181A]/50 hover:text-[#092C4C] dark:hover:text-white'
          ]">
          <div v-if="seccionActiva === item.id"
            class="absolute left-0 w-1.5 h-8 bg-[#E67E50] rounded-r-full shadow-[0_0_10px_rgba(230,126,80,0.4)]">
          </div>
          
          <component :is="item.icon" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
            :class="seccionActiva === item.id ? 'stroke-[2.5px]' : ''" />
          <span class="font-semibold text-sm">{{ item.label }}</span>
        </button>
      </nav>

      <div class="p-4 border-t border-gray-100 dark:border-[#374B54] bg-gray-50/50 dark:bg-[#272A30]">
        <div class="flex items-center p-3 rounded-xl transition-colors cursor-pointer hover:bg-white dark:hover:bg-[#16181A] border border-transparent hover:border-gray-200 dark:hover:border-[#374B54] hover:shadow-sm"
          @click="router.push('/configuracion')">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-[#E67E50] flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden flex-shrink-0">
              <img v-if="imagenUsuario" :src="imagenUsuario" class="w-full h-full object-cover" />
              <span v-else>{{ inicialUsuario }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold truncate leading-tight text-[#092C4C] dark:text-white">{{ nombreUsuario }}</p>
              <p class="text-[11px] font-medium text-[#E67E50]">{{ rolUsuario }}</p>
            </div>
          </div>
        </div>
        <button @click="cerrarSesion"
          class="w-full flex items-center gap-2 mt-2 px-4 py-2.5 text-xs font-semibold rounded-xl text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut class="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 transition-colors duration-300 bg-[#F8F9FA] dark:bg-[#16181A]">
      
      <header class="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-gray-100 dark:border-[#374B54] bg-white/80 dark:bg-[#272A30]/80 backdrop-blur-md">
        
        <div class="flex items-center gap-4">
          <button class="lg:hidden p-2.5 rounded-xl transition-colors bg-gray-50 dark:bg-[#16181A] text-[#424242] dark:text-[#82A1B1]"
            @click="sidebarAbierto = true">
            <Menu class="w-5 h-5" />
          </button>
          <div class="hidden md:block">
            <h2 class="text-xl font-bold tracking-tight text-[#092C4C] dark:text-white">
              {{ itemsMenu.find(i => i.id === seccionActiva)?.label || 'Dashboard' }}
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="lg:hidden w-10 h-10 rounded-full bg-[#E67E50] flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer overflow-hidden flex-shrink-0"
            @click="irASeccion('general')">
            <img v-if="imagenUsuario" :src="imagenUsuario" class="w-full h-full object-cover" />
            <span v-else>{{ inicialUsuario }}</span>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-auto p-4 sm:px-5 sm:py-6">
        <div class="w-full">
          
          <GeneralVista v-if="seccionActiva === 'general'" @actualizar-no-leidas="handleActualizarNoLeidas" />
          <RutasVista v-else-if="seccionActiva === 'rutas'" />
          <VehiculosVista v-else-if="seccionActiva === 'vehiculos' && esAdmin" />
          <UsuariosVista v-else-if="seccionActiva === 'usuarios' && esAdmin" />
          <EntregasVista v-else-if="seccionActiva === 'entregas'" />
          <ClientesVista v-else-if="seccionActiva === 'clientes' && esAdmin" />
          
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>