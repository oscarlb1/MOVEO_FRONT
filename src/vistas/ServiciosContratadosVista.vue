<script setup lang="ts">
import { ref } from 'vue'
import { 
  CheckCircle2, Clock, AlertCircle, ArrowRight, 
  Truck, BarChart3, ShieldCheck 
} from 'lucide-vue-next'
import { useSesionStore } from '@/tiendas/sesion'

const sesionStore = useSesionStore()

const serviciosActivos = [
  {
    id: 1,
    nombre: 'Gestión de Flota Premium',
    estado: 'activo',
    fechaInicio: '01/01/2025',
    proximaRenovacion: '01/01/2026',
    icon: Truck,
    color: 'bg-blue-500',
    detalles: 'Licencia para 50 vehículos'
  },
  {
    id: 2,
    nombre: 'Optimización de Rutas IA',
    estado: 'activo',
    fechaInicio: '15/01/2025',
    proximaRenovacion: '15/01/2026',
    icon: BarChart3,
    color: 'bg-[#E67E50]',
    detalles: 'Plan Enterprise'
  }
]

const serviciosDisponibles = [
  {
    nombre: 'Seguridad Avanzada',
    descripcion: 'Protección 24/7 con botón de pánico y bloqueo remoto.',
    icon: ShieldCheck
  },
  {
    nombre: 'Mantenimiento Predictivo',
    descripcion: 'IA para prevenir averías antes de que ocurran.',
    icon: Clock
  }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Welcome Header -->
      <div class="mb-12">
        <h1 class="text-3xl font-bold text-[#092C4C] mb-2">
          Hola, {{ sesionStore.usuario?.nombre || 'usuario' }} 👋
        </h1>
        <p class="text-gray-500 text-lg">
          Bienvenido a tu panel de cliente. Aquí puedes gestionar tus servicios contratados.
        </p>
      </div>

      <!-- Active Services -->
      <section class="mb-16">
        <h2 class="text-xl font-bold text-[#092C4C] mb-6 flex items-center gap-2">
          <CheckCircle2 class="w-6 h-6 text-green-500" />
          Servicios Contratados
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="servicio in serviciosActivos" 
            :key="servicio.id"
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div :class="[servicio.color, 'absolute top-0 left-0 w-1 h-full']" />
            
            <div class="flex justify-between items-start mb-4">
              <div :class="[servicio.color, 'bg-opacity-10 w-12 h-12 rounded-xl flex items-center justify-center']">
                <component :is="servicio.icon" :class="[servicio.color.replace('bg-', 'text-'), 'w-6 h-6']" />
              </div>
              <span class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {{ servicio.estado }}
              </span>
            </div>

            <h3 class="text-lg font-bold text-[#092C4C] mb-2">{{ servicio.nombre }}</h3>
            <p class="text-gray-500 text-sm mb-4">{{ servicio.detalles }}</p>

            <div class="pt-4 border-t border-gray-50 flex flex-col gap-2 text-sm text-gray-400">
              <div class="flex justify-between">
                <span>Inicio:</span>
                <span class="text-gray-600 font-medium">{{ servicio.fechaInicio }}</span>
              </div>
              <div class="flex justify-between">
                <span>Renovación:</span>
                <span class="text-gray-600 font-medium">{{ servicio.proximaRenovacion }}</span>
              </div>
            </div>

            <button class="w-full mt-6 bg-gray-50 text-[#092C4C] py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
              Gestionar
            </button>
          </div>
        </div>
      </section>

      <!-- Upsell / Available Services -->
      <section>
        <h2 class="text-xl font-bold text-[#092C4C] mb-6 flex items-center gap-2">
          <AlertCircle class="w-6 h-6 text-[#E67E50]" />
          Servicios Recomendados
        </h2>
        <div class="bg-[#092C4C] rounded-3xl p-8 lg:p-10 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10" :style="{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }" />
          
          <div class="grid md:grid-cols-2 gap-8 relative z-10">
            <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group" v-for="s in serviciosDisponibles" :key="s.nombre">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-[#E67E50]/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#E67E50] transition-colors">
                  <component :is="s.icon" class="w-6 h-6 text-[#E67E50] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white mb-2">{{ s.nombre }}</h3>
                  <p class="text-gray-400 text-sm">{{ s.descripcion }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-8 text-center">
            <button class="inline-flex items-center gap-2 text-white font-semibold hover:text-[#E67E50] transition-colors">
              Ver catálogo completo <ArrowRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
