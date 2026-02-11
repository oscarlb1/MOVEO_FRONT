<script setup lang="ts">
import { Truck, ChevronDown, Settings, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router';
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

const sesionStore = useSesionStore();
const router = useRouter();
const usuario = computed(() => sesionStore.usuario);
const estaAutenticado = computed(() => sesionStore.estaAutenticado);
const menuAbierto = ref(false);

const enlaces = computed(() => {
  const base = [
    { to: '/', texto: 'Inicio', activeKey: 'home' },
    { to: '/servicios', texto: 'Servicios', activeKey: 'services' },
    { to: '/dashboard-demo', texto: 'Dashboard', activeKey: 'dashboard' },
  ];

  return base;
});

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
  router.push('/login');
};
</script>

<template>
  <nav class="bg-white border-b border-[#EEEEEE] sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-5">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link 
          to="/"
          class="flex items-center gap-3 cursor-pointer group" 
        >
          <div class="w-12 h-12 bg-[#E67E50] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Truck class="w-7 h-7 text-white" />
          </div>
          <span class="text-2xl font-bold text-[#E67E50]">Moveo</span>
        </router-link>

        <div class="flex items-center gap-8">
          <router-link
            v-for="enlace in enlaces"
            :key="enlace.to"
            :to="enlace.to"
            class="text-[17px] font-medium transition-colors"
            :class="paginaActiva === enlace.activeKey 
              ? 'text-[#E67E50]' 
              : 'text-[#424242] hover:text-[#E67E50]'"
          >
            {{ enlace.texto }}
          </router-link>
        </div>

        <!-- CTA Buttons -->
        <div class="flex items-center gap-4">
          <div v-if="estaAutenticado && usuario" class="relative flex items-center gap-4 pl-6 border-l border-gray-200">
             <!-- Avatar -->
             <div class="w-11 h-11 bg-[#E67E50] rounded-full flex items-center justify-center text-white font-semibold shadow-sm text-base">
               {{ usuario.nombre.substring(0, 2).toUpperCase() }}
             </div>
             <!-- User Info -->
             <div class="flex flex-col">
               <span class="text-sm font-semibold text-[#424242] leading-none">{{ usuario.nombre }}</span>
               <span class="text-xs text-gray-500 mt-1">{{ usuario.email }}</span>
             </div>
             <!-- Dropdown trigger -->
             <button @click="toggleMenu" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors group">
               <ChevronDown class="w-5 h-5 text-gray-400 group-hover:text-[#E67E50] transition-transform duration-300" :class="{ 'rotate-180': menuAbierto }" />
             </button>

             <!-- Dropdown Menu -->
             <div 
               v-if="menuAbierto"
               class="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
             >
               <button 
                 @click="irAConfiguracion"
                 class="w-full text-left px-4 py-2.5 text-base text-gray-600 hover:bg-gray-50 hover:text-[#E67E50] transition-colors flex items-center gap-3"
               >
                 <Settings class="w-4 h-4" />
                 Configuración
               </button>
               <div class="h-px bg-gray-100 my-1"></div>
               <button 
                 @click="cerrarSesion"
                 class="w-full text-left px-4 py-2.5 text-base text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
               >
                 <LogOut class="w-4 h-4" />
                 Cerrar sesión
               </button>
             </div>
          </div>

          <button 
            v-else
            @click="router.push({ name: 'login' })"
            class="text-[#424242] hover:text-[#E67E50] transition-colors px-5 py-2.5 font-medium text-[17px] cursor-pointer"
          >
            Iniciar sesión
          </button>
          
          <!-- Contacto Button -->
          <router-link 
            to="/contacto"
            class="bg-[#E67E50] text-white px-7 py-2.5 rounded-xl hover:bg-[#d66d40] transition-colors shadow-md hover:shadow-lg font-semibold text-[17px]"
          >
            Contacto
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
