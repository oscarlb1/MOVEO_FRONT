<script setup lang="ts">
import { 
  Truck, Package, Clock, TrendingUp, MoreHorizontal, 
  MapPin, AlertCircle, CheckCircle2, User 
} from 'lucide-vue-next'

const stats = [
  { label: 'Entregas Hoy', value: '1,248', change: '+12%', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'En Tránsito', value: '42', change: '+5%', icon: Truck, color: 'text-[#E67E50]', bg: 'bg-[#E67E50]/10' },
  { label: 'Tiempo Promedio', value: '45m', change: '-8%', icon: Clock, color: 'text-green-500', bg: 'bg-green-500/10' },
  { label: 'Eficiencia', value: '98.5%', change: '+2%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
]

const recentActivity = [
  { id: 1, type: 'delivery', message: 'Entrega completada #FL-2938', time: 'Hace 5 min', status: 'success' },
  { id: 2, type: 'alert', message: 'Retraso detectado en ruta R-402', time: 'Hace 12 min', status: 'warning' },
  { id: 3, type: 'maintenance', message: 'Vehículo T-882 requiere revisión', time: 'Hace 45 min', status: 'info' },
  { id: 4, type: 'delivery', message: 'Entrega completada #FL-2930', time: 'Hace 1 hora', status: 'success' },
]

const activeDrivers = [
  { name: 'Juan Pérez', status: 'En ruta', location: 'Madrid Centro', battery: 85 },
  { name: 'Ana López', status: 'Entregando', location: 'Pozuelo', battery: 60 },
  { name: 'Carlos Ruíz', status: 'Descanso', location: 'Alcobendas', battery: 90 },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 p-6 lg:p-10">
    <!-- Header Demo -->
    <div class="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-3xl font-bold text-[#092C4C]">Dashboard Demo</h1>
          <span class="bg-[#E67E50] text-white text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide">Live Preview</span>
        </div>
        <p class="text-gray-500">Visualización en tiempo real de tu operación logística.</p>
      </div>
      <div class="flex gap-3">
        <button class="bg-white border text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Exportar Reporte</button>
        <button class="bg-[#092C4C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#092C4C]/90">Configurar Vista</button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto grid gap-8">
      
      <!-- Stats Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div :class="[stat.bg, 'p-3 rounded-xl']">
              <component :is="stat.icon" :class="[stat.color, 'w-6 h-6']" />
            </div>
            <span :class="[stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50', 'text-xs font-bold px-2 py-1 rounded-full']">
              {{ stat.change }}
            </span>
          </div>
          <div class="text-3xl font-bold text-[#092C4C] mb-1">{{ stat.value }}</div>
          <p class="text-gray-400 text-sm font-medium">{{ stat.label }}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Chart Area (Mockup) -->
        <div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 relative overflow-hidden group">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-bold text-[#092C4C]">Rendimiento de Flota</h3>
            <button class="text-gray-400 hover:text-[#092C4C]"><MoreHorizontal class="w-5 h-5" /></button>
          </div>
          
          <!-- Mock Chart -->
          <div class="h-64 flex items-end justify-between gap-2 px-4 relative z-10">
             <div v-for="(h, i) in [40, 65, 45, 80, 55, 70, 60, 85, 50, 65, 75, 90]" :key="i"
                  class="flex-1 bg-gradient-to-t from-[#E67E50]/10 to-[#E67E50] rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer group-hover:scale-y-105 origin-bottom"
                  :style="{ height: `${h}%` }"
             ></div>
          </div>
          <!-- Grid lines -->
          <div class="absolute inset-x-8 bottom-8 top-20 flex flex-col justify-between pointer-events-none">
            <div v-for="i in 4" :key="i" class="h-px bg-gray-100 w-full"></div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50">
          <h3 class="text-xl font-bold text-[#092C4C] mb-6">Actividad Reciente</h3>
          <div class="space-y-6">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex gap-4 items-start">
              <div class="mt-1 relative">
                <div v-if="activity.status === 'success'" class="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                <div v-else-if="activity.status === 'warning'" class="w-2 h-2 rounded-full bg-orange-500 ring-4 ring-orange-100"></div>
                <div v-else class="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">{{ activity.message }}</p>
                <span class="text-xs text-gray-400">{{ activity.time }}</span>
              </div>
            </div>
          </div>
          <button class="w-full mt-6 text-sm text-[#E67E50] font-bold hover:underline">Ver todo el historial</button>
        </div>
      </div>

      <!-- Active Drivers Map Mockup -->
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-[#092C4C] rounded-3xl p-8 relative overflow-hidden text-white min-h-[300px]">
           <div class="absolute inset-0 opacity-20">
             <div class="absolute inset-0" :style="{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }" />
           </div>
           <!-- Content -->
           <div class="relative z-10 flex justify-between items-center mb-6">
             <h3 class="text-xl font-bold">Mapa en Vivo</h3>
             <div class="flex gap-2">
               <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
               <span class="text-xs font-mono">LIVE</span>
             </div>
           </div>
           
           <!-- Map Dots -->
           <div class="absolute top-1/2 left-1/3 w-4 h-4 bg-[#E67E50] rounded-full shadow-[0_0_20px_rgba(230,126,80,0.6)] animate-ping"></div>
           <div class="absolute top-1/2 left-1/3 w-4 h-4 bg-[#E67E50] rounded-full border-2 border-white"></div>
           
           <div class="absolute bottom-1/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
        </div>

        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50">
          <h3 class="text-xl font-bold text-[#092C4C] mb-6">Conductores Activos</h3>
          <div class="space-y-4">
            <div v-for="(driver, i) in activeDrivers" :key="i" class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-[#E67E50]/10 group-hover:text-[#E67E50] transition-colors">
                  <User class="w-5 h-5" />
                </div>
                <div>
                  <p class="font-bold text-sm text-gray-800">{{ driver.name }}</p>
                  <p class="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin class="w-3 h-3" /> {{ driver.location }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500 mb-1"></span>
                <p class="text-xs font-bold text-gray-600">{{ driver.battery }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
