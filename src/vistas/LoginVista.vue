<template>
  <div class="min-h-screen bg-gradient-to-br from-[#092C4C] via-[#374B54] to-[#092C4C] flex items-center justify-center">
    <div class="w-full max-w-7xl flex min-h-screen">
    <!-- Left Panel - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
      <div
        v-motion
        :initial="{ opacity: 0, x: -30 }"
        :enter="{ opacity: 1, x: 0, transition: { duration: 600 } }"
        class="w-full max-w-md"
      >
        <!-- Logo/Brand -->
        <div
          v-motion
          :initial="{ opacity: 0, y: -20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
          class="mb-8"
        >
          <div class="inline-flex items-center gap-2 mb-4">
            <div class="w-10 h-10 bg-[#E67E50] rounded-lg flex items-center justify-center">
              <Truck class="w-6 h-6 text-white" />
            </div>
            <span class="text-white text-2xl font-semibold">Moveo</span>
          </div>
          <h1 class="text-white text-3xl mb-2">
            Bienvenido de vuelta
          </h1>
          <p class="text-gray-300">
            Inicia sesión para acceder a tu panel de control
          </p>
        </div>

        <!-- Login Form -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
          class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label htmlFor="email" class="block text-white mb-2">
                Correo electrónico
              </label>
              <div class="relative">
                <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  placeholder="tu@empresa.com"
                  required
                  :class="[
                    'w-full pl-12 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all',
                    isError 
                      ? 'border-red-500/50 focus:ring-red-500' 
                      : 'border-white/20 focus:ring-[#E67E50]'
                  ]"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <label htmlFor="password" class="block text-white mb-2">
                Contraseña
              </label>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="••••••••"
                  required
                  :class="[
                    'w-full pl-12 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all',
                    isError 
                      ? 'border-red-500/50 focus:ring-red-500' 
                      : 'border-white/20 focus:ring-[#E67E50]'
                  ]"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <EyeOff v-if="showPassword" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Remember & Forgot -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="rememberMe"
                  class="w-4 h-4 rounded border-white/20 bg-white/5 text-[#E67E50] focus:ring-[#E67E50] focus:ring-offset-0"
                />
                <span class="text-gray-300 text-sm">Recordarme</span>
              </label>
              <button
                type="button"
                class="text-[#E67E50] text-sm hover:text-[#d66d40] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-[#E67E50] text-white py-3 rounded-lg hover:bg-[#d66d40] transition-all shadow-lg shadow-[#E67E50]/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isLoading" class="flex items-center gap-2">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Iniciando sesión...</span>
              </div>
              <template v-else>
                <LogIn class="w-5 h-5" />
                <span>Iniciar sesión</span>
                <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </template>
            </button>

            <!-- Divider -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/20"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 text-gray-400 bg-none">
                  o continúa con
                </span>
              </div>
            </div>

            <!-- Social Login Buttons -->
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                class="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-all text-white"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                class="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-all text-white"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>

    <!-- Right Panel - Features & Branding -->
    <div
      v-motion
      :initial="{ opacity: 0, x: 30 }"
      :enter="{ opacity: 1, x: 0, transition: { duration: 600, delay: 200 } }"
      class="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
    >
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden opacity-20">
        <!-- Grid lines -->
        <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E67E50" stroke-width="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <!-- Animated routes -->
          <path
            class="ruta-animada ruta-1"
            d="M 100 200 Q 300 100 500 300 T 900 200"
            stroke="#E67E50"
            stroke-width="2"
            fill="none"
          />
          <path
            class="ruta-animada ruta-2"
            d="M 50 400 Q 400 300 700 500"
            stroke="#374B54"
            stroke-width="2"
            fill="none"
          />
        </svg>

        <!-- Animated vehicles -->
        <div
          v-for="vehicle in vehicles"
          :key="vehicle.id"
          class="vehiculo absolute w-3 h-3 bg-[#E67E50] rounded-full shadow-lg transition-all duration-1000 ease-in-out"
          :style="{ left: `${vehicle.x}%`, top: `${vehicle.y}%` }"
        >
          <div class="absolute inset-0 bg-[#E67E50] rounded-full animate-ping opacity-30"></div>
        </div>
      </div>

      <div class="relative z-10 max-w-lg">
        <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          <h2 class="text-white text-4xl mb-6">
            Gestión logística <span class="text-[#E67E50]">inteligente</span>
          </h2>
          <p class="text-gray-300 text-lg mb-12">
            Plataforma integral para administrar flotas, repartidores y entregas con tecnología de vanguardia.
          </p>
        </div>

        <!-- Features list -->
        <div class="space-y-6">
          <div
            v-for="(feature, index) in features"
            :key="index"
            v-motion
            :initial="{ opacity: 0, x: 20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 500 + index * 100 } }"
            class="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: feature.color + '20' }"
            >
              <component :is="feature.icon" class="w-6 h-6" :style="{ color: feature.color }" />
            </div>
            <div>
              <h3 class="text-white mb-1">{{ feature.title }}</h3>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 900 } }"
            class="mt-12 grid grid-cols-3 gap-6"
        >
          <div class="text-center">
            <p class="text-[#E67E50] text-3xl font-semibold mb-1">
              <ContadorAnimado :end="500" suffix="+" :duration="2.5" />
            </p>
            <p class="text-gray-400">Vehículos</p>
          </div>
          <div class="text-center">
            <p class="text-[#E67E50] text-3xl font-semibold mb-1">
              <ContadorAnimado :end="1000000" prefix="" suffix="+" :duration="3" />
            </p>
            <p class="text-gray-400">Entregas</p>
          </div>
          <div class="text-center">
            <p class="text-[#E67E50] text-3xl font-semibold mb-1">99.9%</p>
            <p class="text-gray-400">Uptime</p>
          </div>
        </div>

      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSesionStore } from '@/tiendas/sesion';
import { toast } from 'vue-sonner';
import ContadorAnimado from '@/componentes/comunes/ContadorAnimado.vue';
import { 
  LogIn, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Truck, 
  Shield, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-vue-next';

// Router (equivalent to onNavigate)
const router = useRouter();
const sesionStore = useSesionStore();

// State
const showPassword = ref(false);
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const isError = ref(false);
const rememberMe = ref(false);

// Animated Background Logic
interface Vehicle {
  id: number
  x: number
  y: number
}

const vehicles = ref<Vehicle[]>([
  { id: 1, x: 20, y: 30 },
  { id: 2, x: 60, y: 50 },
  { id: 3, x: 40, y: 70 },
  { id: 4, x: 80, y: 40 },
])

let interval: ReturnType<typeof setInterval> | null = null

import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  // Check for saved email
  const savedEmail = localStorage.getItem('savedEmail');
  if (savedEmail) {
    email.value = savedEmail;
    rememberMe.value = true;
  }

  interval = setInterval(() => {
    vehicles.value = vehicles.value.map(v => ({
      ...v,
      x: (v.x + Math.random() * 2 - 1 + 100) % 100,
      y: (v.y + Math.random() * 2 - 1 + 100) % 100,
    }))
  }, 2000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})

const features = [
  {
    icon: Truck,
    title: "Gestión de flotas en tiempo real",
    color: "#E67E50"
  },
  {
    icon: Shield,
    title: "Seguridad y cifrado de extremo a extremo",
    color: "#E67E50"
  },
  {
    icon: CheckCircle2,
    title: "99.9% de disponibilidad garantizada",
    color: "#E67E50"
  }
];

const handleLogin = async () => {
  isLoading.value = true;
  isError.value = false;
  
  try {
    await sesionStore.iniciarSesion({ email: email.value, password: password.value });
    
    // Handle Remember Me
    if (rememberMe.value) {
      localStorage.setItem('savedEmail', email.value);
    } else {
      localStorage.removeItem('savedEmail');
    }

    navigate('dashboard');
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);
    isError.value = true;
    toast.error('Error de acceso', {
      description: 'Usuario o contraseña incorrectos',
      duration: 4000
    });
  } finally {
    isLoading.value = false;
  }
};

const navigate = (page: 'home' | 'services' | 'dashboard') => {
  // Map page strings to route names or paths
  switch (page) {
    case 'home':
      router.push('/');
      break;
    case 'dashboard':
      router.push('/dashboard'); 
      // Ensure 'dashboard' route exists, fallback to home or dashboard path
      break;
    case 'services':
      router.push('/services');
      break;
  }
};
</script>

<style scoped>
.ruta-animada {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  opacity: 0;
}

.ruta-1 {
  animation: dibujarRuta 3s ease-in-out infinite alternate;
}

.ruta-2 {
  animation: dibujarRuta 4s ease-in-out infinite alternate;
  animation-delay: 1s;
}

@keyframes dibujarRuta {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0.6;
  }
}

.vehiculo {
  animation: pulsar 2s ease-in-out infinite;
}

@keyframes pulsar {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}
</style>
