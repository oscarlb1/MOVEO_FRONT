<template>
  <div class="min-h-screen bg-gradient-to-br from-[#092C4C] via-[#374B54] to-[#092C4C] flex items-center justify-center">
    <div class="w-full max-w-7xl flex min-h-screen">
    <!-- Left Panel - Login Form -->
    <div class="w-full lg:w-1/2 flex items-start justify-center p-6 lg:p-12 lg:pt-32">
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

            <!-- Premium Contact CTA -->
            <div class="mt-10 pt-8 border-t border-white/10">
              <div class="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group/card">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-10 h-10 bg-[#E67E50]/20 rounded-xl flex items-center justify-center text-[#E67E50] group-hover/card:scale-110 transition-transform">
                    <MessageSquare class="w-5 h-5" />
                  </div>
                  <div class="text-left">
                    <h4 class="text-white font-semibold text-sm">¿Nuevo en Moveo?</h4>
                    <p class="text-gray-400 text-xs">Solicita tu acceso corporativo</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="router.push('/contacto?sinHeader=true')"
                  class="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg border border-white/10 hover:border-[#E67E50]/50 transition-all text-sm font-medium flex items-center justify-center gap-2 group/btn"
                >
                  Contactar con soporte
                  <ArrowRight class="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
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
      class="hidden lg:flex lg:w-1/2 items-start justify-center p-12 lg:pt-32 relative overflow-hidden"
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
        <!-- Spacer to match left logo height for perfect header alignment -->
        <div class="h-14 mb-4 hidden lg:block"></div>
        
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
  ArrowRight,
  MessageSquare
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

    navigate('mis-servicios');
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

const navigate = (page: 'home' | 'services' | 'dashboard' | 'mis-servicios') => {
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
    case 'mis-servicios':
      router.push('/mis-servicios');
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
