<script setup lang="ts">
import { Truck, ChevronDown, Settings, LogOut, Menu, X } from 'lucide-vue-next'
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
const menuMovilAbierto = ref(false);

const enlaces = computed(() => [
  { to: '/', texto: 'Inicio', activeKey: 'home' },
  { to: '/servicios', texto: 'Servicios', activeKey: 'services' },
  { to: estaAutenticado.value ? '/dashboard' : '/dashboard-demo', texto: 'Dashboard', activeKey: 'dashboard' },
]);

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
  <nav
    class="bg-white dark:bg-[#272A30] border-b border-[#EEEEEE] dark:border-[#374B54] sticky top-0 z-50 shadow-sm transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-6 py-5">
      <div class="flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3 cursor-pointer group">
          <img src="@/assets/logo-moveo.png" alt="Moveo Logo"
            class="h-10 w-auto object-contain transition-transform duration-300" />
          <span class="text-2xl font-bold text-[#E67E50]">Moveo</span>
        </router-link>

        <!-- Enlaces principales (Desktop) -->
        <div class="hidden lg:flex items-center gap-8">
          <router-link v-for="enlace in enlaces" :key="enlace.to" :to="enlace.to"
            class="text-[17px] font-medium transition-colors" :class="paginaActiva === enlace.activeKey
              ? 'text-[#E67E50]'
              : 'text-[#424242] dark:text-[#82A1B1] hover:text-[#E67E50] dark:hover:text-white'">
            {{ enlace.texto }}
          </router-link>
        </div>

        <div class="hidden lg:flex items-center gap-4">
          <div v-if="estaAutenticado && usuario"
            class="relative flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-[#374B54]">
            <div
              class="w-11 h-11 bg-[#E67E50] rounded-full flex items-center justify-center text-white font-semibold shadow-sm text-base overflow-hidden">
              <img v-if="usuario.imagenUrl" :src="usuario.imagenUrl" alt="Foto de perfil"
                class="w-full h-full object-cover" />
              <span v-else>{{ usuario.nombre.substring(0, 2).toUpperCase() }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-[#424242] dark:text-white leading-none">{{ usuario.nombre
                }}</span>
              <span class="text-xs text-gray-500 dark:text-[#82A1B1] mt-1">{{ usuario.email }}</span>
            </div>
            <button @click="toggleMenu"
              class="p-1.5 hover:bg-gray-100 dark:hover:bg-[#374B54] rounded-full transition-colors group">
              <ChevronDown class="w-5 h-5 text-gray-400 group-hover:text-[#E67E50] transition-transform duration-300"
                :class="{ 'rotate-180': menuAbierto }" />
            </button>

            <div v-if="menuAbierto"
              class="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-[#16181A] rounded-xl shadow-xl border border-gray-100 dark:border-[#374B54] py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button @click="irAConfiguracion"
                class="w-full text-left px-4 py-2.5 text-base text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#272A30] hover:text-[#E67E50] dark:hover:text-white transition-colors flex items-center gap-3">
                <Settings class="w-4 h-4" />
                Configuración
              </button>
              <div class="h-px bg-gray-100 dark:bg-[#374B54] my-1"></div>
              <button @click="cerrarSesion"
                class="w-full text-left px-4 py-2.5 text-base text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-3">
                <LogOut class="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>

          <button v-else @click="router.push({ name: 'login' })"
            class="text-[#424242] dark:text-[#82A1B1] hover:text-[#E67E50] dark:hover:text-white transition-colors px-5 py-2.5 font-medium text-[17px] cursor-pointer">
            Iniciar sesión
          </button>

          <router-link to="/contacto"
            class="bg-[#E67E50] text-white px-7 py-2.5 rounded-xl hover:bg-[#d66d40] transition-colors shadow-md hover:shadow-lg font-semibold text-[17px]">
            Contacto
          </router-link>

          <button @click="irAConfiguracion"
            class="p-2.5 bg-gray-50 dark:bg-[#16181A] text-gray-500 dark:text-[#82A1B1] rounded-xl hover:bg-gray-100 dark:hover:bg-[#374B54] hover:text-[#E67E50] dark:hover:text-white transition-colors border border-gray-200 dark:border-[#374B54] shadow-sm flex items-center justify-center group"
            title="Configuración">
            <Settings class="w-[22px] h-[22px] group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>

        <!-- Botón Hamburguesa Móvil -->
        <button
          class="lg:hidden p-2 text-[#424242] dark:text-white hover:bg-gray-100 dark:hover:bg-[#374B54] rounded-lg transition-colors z-50 relative"
          @click="menuMovilAbierto = !menuMovilAbierto" aria-label="Alternar menú">
          <Menu v-if="!menuMovilAbierto" class="w-7 h-7" />
          <X v-else class="w-7 h-7" />
        </button>
      </div>

      <!-- Menú Móvil Full-Screen Overlay -->
      <Teleport to="body">
        <Transition name="fade-menu">
          <div v-if="menuMovilAbierto" class="fixed inset-0 z-[100] bg-[#1A1D23] flex flex-col">
            <!-- Cabecera del menú móvil (fija arriba) -->
            <div class="flex items-center justify-between p-6 border-b border-white/5">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-[#E67E50] rounded-xl flex items-center justify-center shadow-lg shadow-[#E67E50]/20">
                  <Truck class="w-6 h-6 text-white" />
                </div>
                <span class="text-2xl font-bold text-[#E67E50]">Moveo</span>
              </div>
              <button class="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                @click="menuMovilAbierto = false">
                <X class="w-7 h-7" />
              </button>
            </div>

            <!-- Contenido deslizable del menú -->
            <div class="flex-1 overflow-y-auto px-6 py-8">
              <div class="flex flex-col gap-4">
                <router-link v-for="enlace in enlaces" :key="enlace.to" :to="enlace.to"
                  @click="menuMovilAbierto = false" class="px-5 py-4 text-xl rounded-2xl font-medium transition-colors"
                  :class="paginaActiva === enlace.activeKey
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'">
                  {{ enlace.texto }}
                </router-link>

                <div class="h-px bg-white/10 my-4"></div>

                <!-- Usuario NO autenticado -->
                <template v-if="!estaAutenticado">
                  <button @click="router.push({ name: 'login' }); menuMovilAbierto = false"
                    class="px-5 py-4 text-left text-xl text-white font-medium hover:bg-white/5 rounded-2xl transition-colors">
                    Iniciar sesión
                  </button>
                  <router-link to="/contacto" @click="menuMovilAbierto = false"
                    class="mt-4 px-5 py-4 text-center text-xl bg-[#E67E50] text-white rounded-2xl font-bold shadow-lg shadow-[#E67E50]/20 active:scale-95 transition-all">
                    Contacto
                  </router-link>
                </template>

                <!-- Usuario Autenticado -->
                <template v-else>
                  <!-- Perfil info summary card -->
                  <div class="bg-white/5 rounded-2xl p-4 mb-4 flex items-center gap-4">
                    <div
                      class="w-12 h-12 bg-[#E67E50] rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                      <img v-if="usuario?.imagenUrl" :src="usuario.imagenUrl" alt="Foto"
                        class="w-full h-full object-cover" />
                      <span v-else>{{ usuario?.nombre?.substring(0, 2).toUpperCase() }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-white font-bold truncate">{{ usuario?.nombre }}</p>
                      <p class="text-gray-400 text-sm truncate">{{ usuario?.email }}</p>
                    </div>
                  </div>

                  <button @click="irAConfiguracion(); menuMovilAbierto = false"
                    class="px-5 py-4 text-left text-xl text-white font-medium hover:bg-white/5 rounded-2xl transition-colors flex items-center gap-4">
                    <Settings class="w-6 h-6 text-gray-400" />
                    Configuración
                  </button>
                  <button @click="cerrarSesion(); menuMovilAbierto = false"
                    class="px-5 py-4 text-left text-xl text-red-500 font-medium hover:bg-red-500/10 rounded-2xl transition-colors flex items-center gap-4">
                    <LogOut class="w-6 h-6" />
                    Cerrar sesión
                  </button>
                </template>
              </div>
            </div>

          </div>
        </Transition>
      </Teleport>

    </div>
  </nav>
</template>

<style scoped>
.fade-menu-enter-active,
.fade-menu-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-menu-enter-from,
.fade-menu-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}
</style>
