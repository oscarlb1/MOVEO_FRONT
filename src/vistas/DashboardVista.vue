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
import PantallaCarga from '@/componentes/PantallaCarga.vue'

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

// Estado del Cargador
const mostrarCargador = ref(!sesionStore.haVistoCargador)
const progresoCarga = ref(0)

function iniciarSimulacionCarga() {
  mostrarCargador.value = true
  progresoCarga.value = 0

  const step = 100 / (1800 / 30) // 100% in ~1.8 seconds with 30ms intervals
  const interval = setInterval(() => {
    progresoCarga.value += step
    if (progresoCarga.value >= 100) {
      progresoCarga.value = 100
      clearInterval(interval)
      setTimeout(() => {
        mostrarCargador.value = false
        sesionStore.haVistoCargador = true
      }, 200) // Pequeño retraso al 100% antes de ocultar
    }
  }, 30)
}

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
  if (seccionActiva.value !== id) {
    seccionActiva.value = id
  }
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
  if (!sesionStore.haVistoCargador) {
    iniciarSimulacionCarga()
  }
  dashboardServicio.obtenerConteoNoLeidas().then(c => conteoNoLeidas.value = c).catch(() => { })
  intervaloActualizacion = setInterval(() => {
    dashboardServicio.obtenerConteoNoLeidas().then(c => conteoNoLeidas.value = c).catch(() => { })
  }, 60000)
})

onUnmounted(() => {
  clearInterval(intervaloActualizacion)
})
</script>

<template>
  <div
    class="h-screen w-full max-w-[100vw] flex overflow-hidden font-inter transition-colors duration-300 bg-[#FAFAFA] dark:bg-[#16181A] text-[#092C4C] dark:text-white relative">

    <!-- Global Loading Overlay Component -->
    <PantallaCarga :mostrar="mostrarCargador" :progreso="progresoCarga" />

    <Transition name="fade">
      <div v-if="sidebarAbierto" class="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        @click="sidebarAbierto = false">
      </div>
    </Transition>

    <aside
      class="fixed lg:static inset-y-0 left-0 z-50 w-46 flex flex-col transition-all duration-300 transform border-r border-gray-100 dark:border-[#374B54] bg-white dark:bg-[#272A30] shadow-sm lg:translate-x-0"
      :class="sidebarAbierto ? 'translate-x-0' : '-translate-x-full'">

      <div class="h-20 flex items-center justify-between px-5 border-b border-gray-100 dark:border-[#374B54]">
        <div class="flex items-center gap-3.5 group cursor-pointer" @click="irASeccion('general')">
          <img src="@/assets/logo-moveo.png" alt="Moveo Logo"
            class="h-10 w-auto object-contain transition-transform duration-300" />
          <div class="flex flex-col">
            <h1
              class="text-lg font-black tracking-tight flex items-center gap-0.5 text-[#092C4C] dark:text-white leading-none">
              MOVE<span class="text-[#E67E50]">O</span>
            </h1>
            <p class="text-[9px] font-bold tracking-widest uppercase opacity-60 text-[#092C4C] dark:text-white mt-0.5">
              Logística</p>
          </div>
        </div>
        <button
          class="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-[#16181A] text-[#424242] dark:text-[#82A1B1]"
          @click="sidebarAbierto = false">
          <X class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin">
        <button v-for="item in itemsMenu" :key="item.id" @click="irASeccion(item.id)"
          class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative" :class="[
            seccionActiva === item.id
              ? 'bg-[#E67E50]/10 dark:bg-[#E67E50]/15 text-[#E67E50]'
              : 'text-[#757575] dark:text-[#82A1B1] hover:bg-gray-50 dark:hover:bg-[#16181A]/50 hover:text-[#092C4C] dark:hover:text-white'
          ]">
          <div v-if="seccionActiva === item.id"
            class="absolute left-0 w-1 h-6 bg-[#E67E50] rounded-r-full shadow-[0_0_10px_rgba(230,126,80,0.4)]">
          </div>

          <component :is="item.icon" class="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110"
            :class="seccionActiva === item.id ? 'stroke-[2.5px]' : ''" />
          <span class="font-bold text-sm">{{ item.label }}</span>
        </button>
      </nav>

      <div class="p-4 border-t border-gray-100 dark:border-[#374B54] bg-gray-50/50 dark:bg-[#272A30]">
        <div
          class="flex items-center p-2.5 rounded-xl transition-colors cursor-pointer hover:bg-white dark:hover:bg-[#16181A] border border-transparent hover:border-gray-200 dark:hover:border-[#374B54] hover:shadow-sm"
          @click="router.push('/configuracion')">
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-9 h-9 rounded-full bg-[#E67E50] flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden flex-shrink-0">
              <img v-if="imagenUsuario" :src="imagenUsuario" class="w-full h-full object-cover" />
              <span v-else>{{ inicialUsuario }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold truncate leading-tight text-[#092C4C] dark:text-white">{{ nombreUsuario }}</p>
              <p class="text-[10px] font-medium text-[#E67E50]">{{ rolUsuario }}</p>
            </div>
          </div>
        </div>
        <button @click="cerrarSesion"
          class="w-full flex items-center gap-2 mt-2 px-3 py-2 text-[10px] font-bold rounded-xl text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut class="w-3.5 h-3.5" /> Cerrar sesión
        </button>
      </div>
    </aside>

    <main
      class="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300 bg-[#F8F9FA] dark:bg-[#16181A]">

      <!-- Dashboard Header with Glassmorphism -->
      <header
        class="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-gray-100 dark:border-[#374B54] bg-white/70 dark:bg-[#272A30]/70 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">

        <div class="flex items-center gap-4">
          <button
            class="lg:hidden p-2.5 rounded-xl transition-all active:scale-95 bg-gray-50 dark:bg-[#16181A] text-[#424242] dark:text-[#82A1B1] border border-gray-200 dark:border-[#374B54] shadow-sm"
            @click="sidebarAbierto = true">
            <Menu class="w-5 h-5" />
          </button>
          <div class="hidden md:block">
            <h2 class="text-xl font-bold tracking-tight text-[#092C4C] dark:text-white flex items-center gap-2">
              <span class="w-1 h-6 bg-[#E67E50] rounded-full mr-2 hidden sm:block"></span>
              {{itemsMenu.find(i => i.id === seccionActiva)?.label || 'Dashboard'}}
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Profile Quick Access for Mobile -->
          <div
            class="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-[#E67E50] to-[#d4603a] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#E67E50]/20 cursor-pointer overflow-hidden flex-shrink-0 transition-transform active:scale-90"
            @click="irASeccion('general')">
            <img v-if="imagenUsuario" :src="imagenUsuario" class="w-full h-full object-cover" />
            <span v-else>{{ inicialUsuario }}</span>
          </div>

          <!-- Quick Settings Toggle (Desktop/Tablet) -->
          <div class="hidden sm:flex items-center gap-2">
            <button @click="router.push('/configuracion')"
              class="p-2.5 rounded-xl bg-gray-50 dark:bg-[#16181A] text-gray-500 dark:text-[#82A1B1] border border-gray-200 dark:border-[#374B54] hover:text-[#E67E50] transition-colors">
              <Settings class="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Area with Adaptive Padding and Transitions -->
      <div class="flex-1 overflow-x-hidden overflow-y-auto py-4 sm:py-6 px-1.5 sm:pl-3 sm:pr-12">
        <div class="w-full">
          <Transition name="page-fade" mode="out-in">
            <div :key="seccionActiva">
              <GeneralVista v-if="seccionActiva === 'general'" @actualizar-no-leidas="handleActualizarNoLeidas" />
              <RutasVista v-else-if="seccionActiva === 'rutas'" />
              <VehiculosVista v-else-if="seccionActiva === 'vehiculos' && esAdmin" />
              <UsuariosVista v-else-if="seccionActiva === 'usuarios' && esAdmin" />
              <EntregasVista v-else-if="seccionActiva === 'entregas'" />
              <ClientesVista v-else-if="seccionActiva === 'clientes' && esAdmin" />
            </div>
          </Transition>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Custom scrollbar for webkit */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.4);
}
</style>

<style lang="scss">
@use '@/assets/styles/base/variables' as *;

[class~="text-[#E67E50]"] {
  color: $primary-color !important;
}

[class~="bg-[#E67E50]"] {
  background-color: $primary-color !important;
}

[class~="from-[#E67E50]"] {
  --tw-gradient-from: #E67E50 var(--tw-gradient-from-position) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(230, 126, 80, 0)) !important;
}
</style>
