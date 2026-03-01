<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '@/tiendas/sesion'
import dashboardServicio from '@/servicios/dashboardServicio'
import {
  LogOut, Settings, Bell, Menu, User,
  LayoutDashboard, Truck, Users, Map, Package, Activity,
  Moon, Sun, X, ChevronRight, Briefcase
} from 'lucide-vue-next'

import GeneralVista from './GeneralVista.vue'
import RutasVista from './RutasVista.vue'
import VehiculosVista from './VehiculosVista.vue'
import UsuariosVista from './UsuariosVista.vue'
import EntregasVista from './EntregasVista.vue'
import ClientesVista from './ClientesVista.vue'

const router = useRouter()
const sesionStore = useSesionStore()

const seccionActiva = ref('general')
const sidebarAbierto = ref(false)
const perfilAbierto = ref(false)
const darkMode = ref(localStorage.getItem('theme') === 'dark')

const esAdmin = computed(() => sesionStore.usuario?.rol === 'ADMIN')
const nombreUsuario = computed(() => sesionStore.usuario?.nombre || 'Usuario')
const correoUsuario = computed(() => sesionStore.usuario?.email || '')
const rolUsuario = computed(() => sesionStore.usuario?.rol || '')
const inicialUsuario = computed(() => nombreUsuario.value.substring(0, 1).toUpperCase())

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

function alternarTema() {
  darkMode.value = !darkMode.value
  localStorage.setItem('theme', darkMode.value ? 'dark' : 'light')
}

async function cerrarSesion() {
  await sesionStore.cerrarSesion()
  router.push('/login')
}

function handleActualizarNoLeidas(conteo: number) {
  conteoNoLeidas.value = conteo
}

onMounted(() => {
  if (darkMode.value) document.documentElement.classList.add('dark')
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
  <div class="h-screen flex overflow-hidden font-inter transition-colors duration-300"
    :class="darkMode ? 'bg-[#111827] text-white' : 'bg-[#FAFAFA] text-[#092C4C]'">

    <!-- Overlay móvil -->
    <Transition name="fade">
      <div v-if="sidebarAbierto"
        class="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        @click="sidebarAbierto = false">
      </div>
    </Transition>

    <!-- Sidebar -->
    <aside class="fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-all duration-300 transform border-r lg:translate-x-0"
      :class="[
        sidebarAbierto ? 'translate-x-0' : '-translate-x-full',
        darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'
      ]">

      <!-- Header Sidebar -->
      <div class="h-20 flex items-center justify-between px-6 border-b"
        :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E67E50] to-[#E67E50]/80 flex items-center justify-center shadow-lg shadow-[#E67E50]/20">
            <Activity class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tight flex items-center gap-0.5"
              :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
              MOVE<span class="text-[#E67E50]">O</span>
            </h1>
            <p class="text-[10px] font-bold tracking-widest uppercase opacity-60">Logística</p>
          </div>
        </div>
        <button class="lg:hidden p-2 rounded-lg transition-colors"
          :class="darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-[#424242]'"
          @click="sidebarAbierto = false">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Menú Navegación -->
      <nav class="flex-1 overflow-y-auto py-8 px-4 flex flex-col justify-evenly scrollbar-thin min-h-[500px]">
        <button
          v-for="item in itemsMenu" :key="item.id"
          @click="irASeccion(item.id)"
          class="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group relative"
          :class="[
            seccionActiva === item.id
              ? (darkMode ? 'bg-[#E67E50]/15 text-[#E67E50]' : 'bg-[#E67E50]/10 text-[#E67E50]')
              : (darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-[#757575] hover:bg-gray-50 hover:text-[#092C4C]')
          ]">
          <!-- Indicador activo -->
          <div v-if="seccionActiva === item.id"
            class="absolute left-0 w-1.5 h-10 bg-[#E67E50] rounded-r-full shadow-[0_0_10px_rgba(230,126,80,0.4)]">
          </div>
          
          <component :is="item.icon" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
            :class="seccionActiva === item.id ? 'stroke-[2.5px]' : ''" />
          <span class="font-semibold text-[15px]">{{ item.label }}</span>
        </button>
      </nav>

      <!-- Footer Sidebar -->
      <div class="p-4 border-t" :class="darkMode ? 'border-gray-700 bg-[#161d2b]' : 'border-gray-100 bg-gray-50/50'">
        <div class="flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer relative"
          :class="darkMode ? 'hover:bg-gray-800' : 'hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm'"
          @click="perfilAbierto = !perfilAbierto">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden shrink-0">
              <img v-if="sesionStore.usuario?.imagenUrl" :src="sesionStore.usuario.imagenUrl" class="w-full h-full object-cover object-center" />
              <span v-else>{{ inicialUsuario }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold truncate leading-tight" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ nombreUsuario }}</p>
              <p class="text-[11px] font-medium" :class="darkMode ? 'text-[#E67E50]' : 'text-[#E67E50]'">{{ rolUsuario }}</p>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 transition-transform text-gray-400" :class="perfilAbierto ? 'rotate-90' : ''" />
        </div>

        <div v-show="perfilAbierto" class="mt-2 pl-3 border-l-2 ml-7 space-y-1" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
          <button @click="router.push('/configuracion')" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-colors" :class="darkMode ? 'text-gray-400 hover:bg-gray-800/50' : ''">
            <Settings class="w-4 h-4" /> Configuración
          </button>
          <button @click="cerrarSesion" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-red-500 hover:bg-red-50 transition-colors" :class="darkMode ? 'hover:bg-red-500/10' : ''">
            <LogOut class="w-4 h-4" /> Desconectarse
          </button>
        </div>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <main class="flex-1 flex flex-col min-w-0 transition-colors duration-300"
      :class="darkMode ? 'bg-[#0d131f]' : 'bg-[#F8F9FA]'">
      
      <!-- Top Header -->
      <header class="h-20 flex items-center justify-between px-4 sm:px-8 border-b"
        :class="darkMode ? 'bg-[#1a2332]/80 border-gray-700 backdrop-blur-md' : 'bg-white/80 border-gray-100 backdrop-blur-md'">
        
        <div class="flex items-center gap-4">
          <button class="lg:hidden p-2.5 rounded-xl transition-colors"
            :class="darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-[#424242]'"
            @click="sidebarAbierto = true">
            <Menu class="w-5 h-5" />
          </button>
          <div class="hidden md:block">
            <h2 class="text-xl font-bold tracking-tight" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
              {{ itemsMenu.find(i => i.id === seccionActiva)?.label || 'Dashboard' }}
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Avatar Móvil -->
          <div class="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer"
            @click="irASeccion('general')">
            {{ inicialUsuario }}
          </div>
        </div>
      </header>

      <!-- Contenedor Principal (Vistas dinámicas) -->
      <div class="flex-1 overflow-auto p-4 sm:p-8">
        <div class="w-full h-full">
          
          <GeneralVista v-if="seccionActiva === 'general'" :darkMode="darkMode" @actualizar-no-leidas="handleActualizarNoLeidas" />
          <RutasVista v-else-if="seccionActiva === 'rutas'" :darkMode="darkMode" />
          <VehiculosVista v-else-if="seccionActiva === 'vehiculos' && esAdmin" :darkMode="darkMode" />
          <UsuariosVista v-else-if="seccionActiva === 'usuarios' && esAdmin" :darkMode="darkMode" />
          <EntregasVista v-else-if="seccionActiva === 'entregas'" :darkMode="darkMode" />
          <ClientesVista v-else-if="seccionActiva === 'clientes' && esAdmin" :darkMode="darkMode" />
          
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
