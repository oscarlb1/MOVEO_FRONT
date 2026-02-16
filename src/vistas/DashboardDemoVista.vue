<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { ApexOptions } from 'apexcharts'
import { 
  Truck, Package, Users, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Clock, MapPin, Activity,
  Bell, Calendar, Filter, Search, MoreVertical,
  Download, RefreshCw, ChevronDown, Eye, XCircle, Zap,
  Moon, Sun
} from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'

import { useSesionStore } from '@/tiendas/sesion'

// State
const router = useRouter()
const sesionStore = useSesionStore()
const darkMode = ref(false) // Toggle for demo purposes, could sync with store
const dateRange = ref("Hoy")
const selectedFilter = ref("Todos")
const notifications = ref(5)
const menuPerfilAbierto = ref(false)

// Chart Options (Computes based on darkMode)
const chartOptionsArea = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    background: 'transparent',
    fontFamily: 'inherit'
  },
  colors: ['#E67E50', '#374B54'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: darkMode.value ? '#9ca3af' : '#757575' } }
  },
  yaxis: {
    labels: { style: { colors: darkMode.value ? '#9ca3af' : '#757575' } }
  },
  grid: {
    borderColor: darkMode.value ? '#2a3441' : '#EEEEEE',
    strokeDashArray: 4,
  },
  tooltip: {
    theme: darkMode.value ? 'dark' : 'light',
    style: {
      fontSize: '12px',
      color: darkMode.value ? '#fff' : '#000'
    },
    marker: { show: true },
    x: { show: true }
  },
  legend: { show: false }
}))

const chartSeriesArea = [
  { name: 'Entregas', data: [45, 52, 48, 61, 55, 38, 25] },
  { name: 'Completadas', data: [42, 50, 46, 58, 53, 36, 24] }
]

const chartOptionsDonut = computed<ApexOptions>(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: ['En ruta', 'Disponibles', 'Mantenimiento', 'Fuera de servicio'],
  colors: ['#E67E50', '#374B54', '#092C4C', '#BDBDBD'],
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          value: { color: darkMode.value ? '#ffffff' : '#424242' },
          total: { show: true, label: 'Total', color: darkMode.value ? '#9ca3af' : '#757575' }
        }
      }
    }
  },
  stroke: { show: false },
  dataLabels: { enabled: false },
  legend: { show: false },
  tooltip: { 
    // Forzamos 'dark' para que el texto sea blanco por defecto
    theme: 'dark', 
    style: {
      fontSize: '12px',
      // Aseguramos blanco puro
      color: '#ffffff' 
    },
    // Esto quita la caja blanca extra que a veces sale en el eje x
    x: { show: false }
  }
}))

const chartSeriesDonut = [35, 18, 5, 2]

// Mock Data
const heatmapData = [
  { zone: 'Centro', actividad: 95 },
  { zone: 'Norte', actividad: 78 },
  { zone: 'Sur', actividad: 85 },
  { zone: 'Este', actividad: 62 },
  { zone: 'Oeste', actividad: 88 },
]

const recentDeliveries = [
  { id: '#D-1247', driver: 'Carlos Martínez', vehicle: 'V-023', route: 'Centro-Norte', status: 'completada', time: '14:32', location: 'Madrid Centro', packages: 12, delay: 0 },
  { id: '#D-1248', driver: 'Ana García', vehicle: 'V-017', route: 'Este-Oeste', status: 'en-ruta', time: '14:45', location: 'Barcelona', packages: 8, delay: 0 },
  { id: '#D-1249', driver: 'Luis Rodríguez', vehicle: 'V-031', route: 'Sur', status: 'completada', time: '14:28', location: 'Valencia', packages: 15, delay: -5 },
  { id: '#D-1250', driver: 'María López', vehicle: 'V-008', route: 'Norte', status: 'en-ruta', time: '14:50', location: 'Sevilla', packages: 10, delay: 3 },
  { id: '#D-1251', driver: 'Pedro Sánchez', vehicle: 'V-042', route: 'Centro', status: 'pendiente', time: '15:00', location: 'Bilbao', packages: 6, delay: 0 },
]

const topDrivers = [
  { name: 'Carlos Martínez', deliveries: 156, rating: 4.9, efficiency: 96, onTime: 98 },
  { name: 'Ana García', deliveries: 148, rating: 4.8, efficiency: 94, onTime: 96 },
  { name: 'Luis Rodríguez', deliveries: 142, rating: 4.7, efficiency: 93, onTime: 95 },
  { name: 'María López', deliveries: 138, rating: 4.9, efficiency: 97, onTime: 99 },
]

const incidents = [
  { id: 1, type: 'warning', title: 'Mantenimiento Preventivo', description: '3 vehículos necesitan revisión esta semana', time: 'Hace 15 min', icon: AlertCircle },
  { id: 2, type: 'success', title: 'Meta Alcanzada', description: 'Has superado el objetivo de entregas del mes', time: 'Hace 1 hora', icon: CheckCircle2 },
  { id: 3, type: 'error', title: 'Retraso en Ruta', description: 'Ruta #R-458 con 15 minutos de retraso por tráfico', time: 'Hace 2 horas', icon: Clock },
  { id: 4, type: 'info', title: 'Actualización disponible', description: 'Nuevas funciones disponibles en la app móvil', time: 'Hace 3 horas', icon: Zap },
]

// Animated Vehicles Logic
const vehicles = ref([
  { id: 1, x: 20, y: 30, status: 'moving', vx: 0.5, vy: 0.2 },
  { id: 2, x: 60, y: 50, status: 'moving', vx: -0.3, vy: 0.4 },
  { id: 3, x: 40, y: 70, status: 'stopped', vx: 0, vy: 0 },
  { id: 4, x: 80, y: 40, status: 'moving', vx: 0.2, vy: -0.5 },
  { id: 5, x: 15, y: 60, status: 'moving', vx: 0.4, vy: 0.3 },
])

// Basic animation loop for vehicles
let animationFrameId: number
const animateVehicles = () => {
  vehicles.value.forEach(v => {
    if (v.status === 'moving') {
      v.x += v.vx
      v.y += v.vy
      // Bounce off walls (0-100)
      if (v.x <= 0 || v.x >= 100) v.vx *= -1
      if (v.y <= 0 || v.y >= 100) v.vy *= -1
    }
  })
  animationFrameId = requestAnimationFrame(animateVehicles)
}

onMounted(() => {
  animateVehicles()
})

</script>

<template>
  <div :class="[
    'min-h-screen transition-colors duration-300',
    darkMode ? 'bg-[#0a0f1a] text-white' : 'bg-[#EEEEEE] text-[#424242]'
  ]">
    <!-- Toolbar / Filter Bar -->
    <div class="max-w-[1600px] mx-auto px-6 pt-6 pb-2">
      <div class="flex items-center justify-between p-4 rounded-2xl border transition-all"
        :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200 shadow-sm'">
        
        <!-- Left: Secondary Navigation -->
        <div class="hidden lg:flex items-center gap-1">
          <button class="px-4 py-2 bg-[#E67E50] text-white rounded-lg font-medium">Vista General</button>
          <button class="px-4 py-2 rounded-lg transition-colors text-sm font-medium" 
            :class="darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-[#757575] hover:bg-gray-100'">Rutas</button>
          <button class="px-4 py-2 rounded-lg transition-colors text-sm font-medium" 
            :class="darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-[#757575] hover:bg-gray-100'">Flota</button>
        </div>
        
        <!-- Right: Controls -->
        <div class="flex items-center gap-4">
          <!-- Date -->
          <button class="flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm"
            :class="darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-[#424242] hover:bg-gray-50'">
            <Calendar class="w-4 h-4" />
            <span>{{ dateRange }}</span>
            <ChevronDown class="w-4 h-4" />
          </button>

          <!-- Notifications -->
          <button class="relative p-2 rounded-lg transition-colors"
            :class="darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'">
            <Bell class="w-5 h-5" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'" />
            <span v-if="notifications > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-[#E67E50] text-white text-xs rounded-full flex items-center justify-center">
              {{ notifications }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto px-6 py-8">
      
      <!-- KPI Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="(kpi, i) in [
          { icon: Truck, label: 'Vehículos Activos', value: '35', change: 12, trend: 'up', color: '#E67E50', subtitle: 'de 60 totales' },
          { icon: Package, label: 'Entregas Hoy', value: '248', change: 8, trend: 'up', color: '#374B54', subtitle: '15 pendientes' },
          { icon: Users, label: 'Repartidores', value: '42', change: 5, trend: 'up', color: '#092C4C', subtitle: '38 activos ahora' },
          { icon: Activity, label: 'Eficiencia Global', value: '94%', change: 3, trend: 'up', color: '#E67E50', subtitle: 'vs 91% ayer' }
        ]" :key="i"
        class="p-6 rounded-2xl shadow-sm border transition-all hover:shadow-lg animate-fade-in-up"
        :style="{ animationDelay: `${i * 100}ms` }"
        :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200'"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 rounded-xl" :style="{ backgroundColor: `${kpi.color}20` }">
              <component :is="kpi.icon" class="w-6 h-6" :style="{ color: kpi.color }" />
            </div>
            <div class="flex items-center gap-1" :class="kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'">
              <TrendingUp v-if="kpi.trend === 'up'" class="w-4 h-4" />
              <TrendingDown v-else class="w-4 h-4" />
              <span class="text-sm font-semibold">+{{ kpi.change }}%</span>
            </div>
          </div>
          <p class="text-sm font-medium mb-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ kpi.label }}</p>
          <div class="text-3xl font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ kpi.value }}</div>
          <p class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-[#9e9e9e]'">{{ kpi.subtitle }}</p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid lg:grid-cols-3 gap-6 mb-8">
        <!-- Main Chart -->
        <div class="lg:col-span-2 p-6 rounded-2xl shadow-sm border animate-fade-in-up" style="animation-delay: 200ms;"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200'">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-bold text-lg mb-1" :class="darkMode ? 'text-white' : 'text-[#424242]'">Entregas Semanales</h3>
              <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Comparativa de rendimiento</p>
            </div>
            <div class="flex gap-2">
              <button class="p-2 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'">
                <Download class="w-5 h-5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'" />
              </button>
              <button class="p-2 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'">
                <RefreshCw class="w-5 h-5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'" />
              </button>
            </div>
          </div>
          <div class="w-full h-[300px]">
            <VueApexCharts height="100%" width="100%" :options="chartOptionsArea" :series="chartSeriesArea" />
          </div>
        </div>

        <!-- Donut Chart -->
        <div class="p-6 rounded-2xl shadow-sm border animate-fade-in-up" style="animation-delay: 300ms;"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200'">
          <h3 class="font-bold text-lg mb-6" :class="darkMode ? 'text-white' : 'text-[#424242]'">Estado de Flota</h3>
          <div class="w-full h-[250px] flex items-center justify-center">
            <VueApexCharts height="100%" width="100%" :options="chartOptionsDonut" :series="chartSeriesDonut" />
          </div>
          <div class="space-y-3 mt-4">
             <div v-for="(item, i) in [
               { label: 'En ruta', val: 35, color: '#E67E50' },
               { label: 'Disponibles', val: 18, color: '#374B54' },
               { label: 'Mantenimiento', val: 5, color: '#092C4C' },
               { label: 'Fuera de servicio', val: 2, color: '#BDBDBD' }
             ]" :key="i" class="flex items-center justify-between text-sm">
               <div class="flex items-center gap-2">
                 <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></div>
                 <span :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ item.label }}</span>
               </div>
               <span class="font-semibold" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ item.val }}</span>
             </div>
          </div>
        </div>
      </div>

       <!-- Map + Heatmap -->
       <div class="grid lg:grid-cols-3 gap-6 mb-8">
          <!-- Live Map Simulation -->
          <div class="lg:col-span-2 p-6 rounded-2xl shadow-sm border animate-fade-in-up" style="animation-delay: 400ms;"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-lg mb-1" :class="darkMode ? 'text-white' : 'text-[#424242]'">Mapa en Tiempo Real</h3>
                <div class="flex items-center gap-2 text-sm">
                  <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">35 vehículos activos</span>
                </div>
              </div>
              <div class="flex gap-2">
                 <button v-for="filter in ['Todos', 'En ruta', 'Parados']" :key="filter"
                   @click="selectedFilter = filter"
                   class="px-3 py-1 text-xs rounded-lg transition-colors border"
                   :class="selectedFilter === filter 
                    ? 'bg-[#E67E50] text-white border-[#E67E50]' 
                    : (darkMode ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700' : 'bg-gray-100 text-[#757575] border-gray-200 hover:bg-gray-200')"
                 >
                   {{ filter }}
                 </button>
              </div>
            </div>

            <!-- Map mock -->
            <div class="aspect-video rounded-xl relative overflow-hidden bg-gray-100 dark:bg-gray-900 border" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
               <!-- Grid pattern -->
               <div class="absolute inset-0 opacity-10" 
                 :style="{ backgroundImage: `linear-gradient(${darkMode ? '#ffffff' : '#000000'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? '#ffffff' : '#000000'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }">
               </div>

               <!-- Vehicles -->
               <div v-for="v in vehicles" :key="v.id"
                 class="absolute w-4 h-4 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 cursor-pointer"
                 :style="{ left: `${v.x}%`, top: `${v.y}%`, backgroundColor: v.status === 'moving' ? '#E67E50' : '#EAB308' }"
               >
                 <div class="absolute inset-0 rounded-full animate-ping opacity-50" 
                   :style="{ backgroundColor: v.status === 'moving' ? '#E67E50' : '#EAB308' }"></div>
               </div>
            </div>
          </div>

          <!-- Heatmap Zones -->
          <div class="p-6 rounded-2xl shadow-sm border animate-fade-in-up" style="animation-delay: 500ms;"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="font-bold text-lg mb-6" :class="darkMode ? 'text-white' : 'text-[#424242]'">Actividad por Zona</h3>
            <div class="space-y-5">
              <div v-for="(zone, i) in heatmapData" :key="i">
                <div class="flex justify-between mb-2 text-sm">
                  <span :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ zone.zone }}</span>
                  <span class="font-semibold" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ zone.actividad }}%</span>
                </div>
                <div class="h-2 rounded-full overflow-hidden" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'">
                  <div class="h-full rounded-full transition-all duration-1000 ease-out"
                    :style="{ width: `${zone.actividad}%`, background: `linear-gradient(90deg, #E67E50 0%, ${zone.actividad > 80 ? '#10b981' : '#f59e0b'} 100%)` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="mt-8 p-4 rounded-xl" :class="darkMode ? 'bg-gray-800' : 'bg-gray-50'">
              <h4 class="text-sm font-semibold mb-1" :class="darkMode ? 'text-white' : 'text-[#424242]'">Zona más activa</h4>
              <p class="text-lg font-bold text-[#E67E50]">Centro (95%)</p>
              <p class="text-xs mt-1" :class="darkMode ? 'text-gray-500' : 'text-[#757575]'">+18% vs semana anterior</p>
            </div>
          </div>
       </div>

       <!-- Table & Incidents -->
       <div class="grid lg:grid-cols-3 gap-6">
          <!-- Table -->
          <div class="lg:col-span-2 p-6 rounded-2xl shadow-sm border animate-fade-in-up" style="animation-delay: 600ms;"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#424242]'">Entregas Recientes</h3>
              <div class="flex gap-2">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Buscar..." 
                    class="pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                    :class="[
                      darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242] placeholder-gray-400'
                    ]"
                  >
                </div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="border-b" :class="darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-[#757575]'">
                    <th class="py-3 px-2 font-medium">ID</th>
                    <th class="py-3 px-2 font-medium">Repartidor</th>
                    <th class="py-3 px-2 font-medium">Ruta</th>
                    <th class="py-3 px-2 font-medium">Estado</th>
                    <th class="py-3 px-2 font-medium">Hora</th>
                    <th class="py-3 px-2 font-medium">Paquetes</th>
                  </tr>
                </thead>
                <tbody class="divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-100'">
                  <tr v-for="d in recentDeliveries" :key="d.id" class="hover:bg-opacity-50 transition-colors"
                    :class="darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'">
                    <td class="py-4 px-2 font-medium" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ d.id }}</td>
                    <td class="py-4 px-2">
                      <p class="font-medium" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ d.driver }}</p>
                      <p class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-[#757575]'">{{ d.vehicle }}</p>
                    </td>
                    <td class="py-4 px-2" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ d.route }}</td>
                    <td class="py-4 px-2">
                      <span class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                        :class="d.status === 'completada' 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                          : d.status === 'en-ruta'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'"
                      >
                        {{ d.status }}
                      </span>
                    </td>
                    <td class="py-4 px-2" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ d.time }}</td>
                    <td class="py-4 px-2 font-medium" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ d.packages }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Incidents -->
          <div class="p-6 rounded-2xl shadow-sm border animate-fade-in-up" style="animation-delay: 700ms;"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#424242]'">Alertas</h3>
              <span class="w-6 h-6 bg-[#E67E50] text-white rounded-full flex items-center justify-center text-xs font-bold">{{ incidents.length }}</span>
            </div>

            <div class="space-y-4">
              <div v-for="inc in incidents" :key="inc.id" class="p-4 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md"
                :class="[
                   darkMode ? 'bg-[#1a2332] border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-100',
                   inc.type === 'warning' ? 'border-l-yellow-500' :
                   inc.type === 'error' ? 'border-l-red-500' :
                   inc.type === 'success' ? 'border-l-green-500' :
                   'border-l-blue-500'
                ]"
              >
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg"
                    :class="[
                      inc.type === 'warning' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      inc.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                      inc.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    ]"
                  >
                    <component :is="inc.icon" class="w-5 h-5" />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-sm mb-1" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ inc.title }}</h4>
                    <p class="text-xs mb-2 leading-relaxed" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ inc.description }}</p>
                    <p class="text-[10px] font-medium" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">{{ inc.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
       </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}
</style>
