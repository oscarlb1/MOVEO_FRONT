<script setup lang="ts">
import { Truck, ChevronDown, Settings, LogOut } from 'lucide-vue-next'
import { useSesionStore } from '@/tiendas/sesion';
import { computed, ref } from 'vue';

type Pagina = 'home' | 'services' | 'dashboard' | 'login' | 'contacto' | 'configuracion'

interface Props {
  paginaActiva: Pagina
}

defineProps<Props>()

const emit = defineEmits<{
  navegar: [pagina: Pagina]
}>()

const enlaces = [
  { pagina: 'home' as Pagina, texto: 'Inicio' },
  { pagina: 'services' as Pagina, texto: 'Servicios' },
  { pagina: 'dashboard' as Pagina, texto: 'Dashboard' },
]

const sesionStore = useSesionStore();
const usuario = computed(() => sesionStore.usuario);
const estaAutenticado = computed(() => sesionStore.estaAutenticado);
const menuAbierto = ref(false);

const toggleMenu = () => {
  menuAbierto.value = !menuAbierto.value;
};

const irAConfiguracion = () => {
  menuAbierto.value = false;
  emit('navegar', 'configuracion');
};

const cerrarSesion = async () => {
  menuAbierto.value = false;
  await sesionStore.cerrarSesion();
  emit('navegar', 'login');
};
</script>

<template>
  <nav class="bg-white border-b border-[#EEEEEE] sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div 
          class="flex items-center gap-3 cursor-pointer group" 
          @click="emit('navegar', 'home')"
        >
          <div class="w-10 h-10 bg-[#E67E50] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Truck class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-semibold text-[#E67E50]">Moveo</span>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center gap-8">
          <button
            v-for="enlace in enlaces"
            :key="enlace.pagina"
            @click="emit('navegar', enlace.pagina)"
            class="font-medium transition-colors"
            :class="paginaActiva === enlace.pagina 
              ? 'text-[#E67E50]' 
              : 'text-[#424242] hover:text-[#E67E50]'"
          >
            {{ enlace.texto }}
          </button>
        </div>

        <!-- CTA Buttons -->
        <div class="flex items-center gap-3">
          <div v-if="estaAutenticado && usuario" class="relative flex items-center gap-3 pl-4 border-l border-gray-200">
             <!-- Avatar -->
             <div class="w-10 h-10 bg-[#E67E50] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
               {{ usuario.nombre.substring(0, 2).toUpperCase() }}
             </div>
             <!-- User Info -->
             <div class="flex flex-col">
               <span class="text-sm font-semibold text-[#424242] leading-none">{{ usuario.nombre }}</span>
               <span class="text-xs text-gray-500 mt-1">{{ usuario.email }}</span>
             </div>
             <!-- Dropdown trigger -->
             <button @click="toggleMenu" class="p-1 hover:bg-gray-100 rounded-full transition-colors group">
               <ChevronDown class="w-4 h-4 text-gray-400 group-hover:text-[#E67E50] transition-transform duration-300" :class="{ 'rotate-180': menuAbierto }" />
             </button>

             <!-- Dropdown Menu -->
             <div 
               v-if="menuAbierto"
               class="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
             >
               <button 
                 @click="irAConfiguracion"
                 class="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#E67E50] transition-colors flex items-center gap-2"
               >
                 <Settings class="w-4 h-4" />
                 Configuración
               </button>
               <div class="h-px bg-gray-100 my-1"></div>
               <button 
                 @click="cerrarSesion"
                 class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
               >
                 <LogOut class="w-4 h-4" />
                 Cerrar sesión
               </button>
             </div>
          </div>

          <button 
            v-else
            @click="emit('navegar', 'login')"
            class="text-[#424242] hover:text-[#E67E50] transition-colors px-4 py-2 font-medium"
          >
            Iniciar sesión
          </button>
          
          <!-- Contacto Button -->
          <button 
            @click="emit('navegar', 'contacto')"
            class="bg-[#E67E50] text-white px-6 py-2 rounded-lg hover:bg-[#d66d40] transition-colors shadow-md hover:shadow-lg"
          >
            Contacto
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
