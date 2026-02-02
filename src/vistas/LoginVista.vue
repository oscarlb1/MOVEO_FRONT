<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#092C4C] via-[#374B54] to-[#092C4C] p-6 relative overflow-hidden">
    <!-- Elementos decorativos de fondo (opcionales, estilo sutil) -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
       <div class="absolute top-[10%] left-[10%] w-96 h-96 bg-[#E67E50]/10 rounded-full blur-3xl animate-pulse"></div>
       <div class="absolute bottom-[10%] right-[10%] w-96 h-96 bg-[#374B54]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    <div 
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 relative z-10"
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center p-3 bg-[#E67E50]/10 rounded-xl mb-4 group">
          <Zap class="w-8 h-8 text-[#E67E50] group-hover:scale-110 transition-transform" />
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Bienvenido a Moveo</h1>
        <p class="text-gray-300">Gestión logística inteligente</p>
      </div>
      
      <form @submit.prevent="manejarLogin" class="space-y-6">
        <!-- Usuario Input -->
        <div class="space-y-2">
          <label for="usuario" class="text-sm font-medium text-gray-200">Usuario</label>
          <div class="relative group">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E67E50] transition-colors" />
            <input 
              id="usuario" 
              v-model="credenciales.usuario" 
              type="text" 
              placeholder="ej. admin@moveo.com"
              required 
              class="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E67E50] focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <!-- Password Input -->
        <div class="space-y-2">
          <label for="clave" class="text-sm font-medium text-gray-200">Contraseña</label>
          <div class="relative group">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E67E50] transition-colors" />
            <input 
              id="clave" 
              v-model="credenciales.clave" 
              type="password" 
              placeholder="••••••••"
              required 
              class="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E67E50] focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <!-- Error Message -->
        <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-red-400" />
          {{ error }}
        </div>
        
        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="cargando"
          class="w-full bg-[#E67E50] hover:bg-[#d66d40] text-white font-bold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#E67E50]/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="cargando" class="w-5 h-5 animate-spin" />
          <span v-else>Iniciar Sesión</span>
          <ArrowRight v-if="!cargando" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <!-- Footer/Link opcional -->
      <div class="mt-6 text-center">
        <a href="#" class="text-sm text-gray-400 hover:text-white transition-colors">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useSesionStore } from '@/tiendas/sesion';
import { User, Lock, ArrowRight, Zap, Loader2, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const sesionStore = useSesionStore();

const credenciales = reactive({
  usuario: '',
  clave: ''
});
const cargando = ref(false);
const error = ref('');

async function manejarLogin() {
  cargando.value = true;
  error.value = '';
  // Simular un pequeño delay para que se vea la animación de carga (opcional, quitar en prod si es instantáneo)
  // await new Promise(r => setTimeout(r, 800)); 
  
  try {
    await sesionStore.iniciarSesion(credenciales);
    router.push('/');
  } catch (e) {
    error.value = 'Credenciales inválidas o error en el servidor';
  } finally {
    cargando.value = false;
  }
}
</script>
