<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { ApexOptions } from 'apexcharts'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  Truck, Package, Users, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Clock, MapPin, Activity,
  Bell, Calendar, Filter, Search, MoreVertical,
  Download, RefreshCw, ChevronDown, Eye, XCircle, Zap,
  Moon, Sun
} from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'

import { useSesionStore } from '@/tiendas/sesion'
import { useTemaStore } from '@/tiendas/tema'

// State
const router = useRouter()
const sesionStore = useSesionStore()
const temaStore = useTemaStore()
const darkMode = computed(() => temaStore.isDark)
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
    labels: { style: { colors: darkMode.value ? '#82A1B1' : '#757575' } }
  },
  yaxis: {
    labels: { style: { colors: darkMode.value ? '#82A1B1' : '#757575' } }
  },
  grid: {
    borderColor: darkMode.value ? '#374B54' : '#EEEEEE',
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
          // Añadido 'name' para evitar que herede el azul oscuro del segmento de mantenimiento
          name: { color: darkMode.value ? '#82A1B1' : '#757575' }, 
          value: { color: darkMode.value ? '#ffffff' : '#424242' },
          total: { show: true, label: 'Total', color: darkMode.value ? '#82A1B1' : '#757575' }
        }
      }
    }
  },
  stroke: { show: false },
  dataLabels: { enabled: false },
  legend: { show: false },
  tooltip: { 
    theme: 'dark', 
    style: {
      fontSize: '12px',
      color: '#ffffff' 
    },
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

// Map Logic
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null

async function inicializarMapa() {
  if (!mapContainer.value) return
  
  map = L.map(mapContainer.value).setView([40.4168, -3.7038], 12)
  
  const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  L.tileLayer(tileUrl, {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map)

  const latLngs = [
    L.latLng(40.4168, -3.7038),
    L.latLng(40.4250, -3.7000),
    L.latLng(40.4350, -3.6900),
    L.latLng(40.4450, -3.6800),
    L.latLng(40.4500, -3.6950),
  ]

  L.polyline(latLngs, {
    color: '#E67E50',
    weight: 5,
    opacity: 0.7,
    dashArray: '15, 10',
    lineCap: 'round',
    lineJoin: 'round',
    className: 'ruta-animada'
  }).addTo(map)

  const icon = L.divIcon({
    className: 'custom-vehicle-marker bg-transparent border-0',
    html: `<div class="w-4 h-4 rounded-full shadow-lg border-2 ${darkMode.value ? 'border-[#272A30]' : 'border-white'}" style="background-color: #E67E50;">
             <div class="absolute inset-0 rounded-full animate-ping opacity-50" style="background-color: #E67E50;"></div>
           </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
  const lastPoint = latLngs[latLngs.length - 1]
  if (lastPoint) {
    L.marker(lastPoint, { icon }).addTo(map)
  }
}

// Eliminamos el watch que cambiaba las URLs de los tiles, ya que usaremos filtros CSS

onMounted(() => {
  inicializarMapa()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

</script>

<template>
  <div class="min-h-screen transition-colors duration-300 bg-[#EEEEEE] dark:bg-[#16181A] text-[#424242] dark:text-white">
    <div class="max-w-[1600px] mx-auto px-6 pt-6 pb-2">
      <div class="flex items-center justify-between p-4 rounded-2xl border transition-all bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] shadow-sm">
        
        <div class="hidden lg:flex items-center gap-1">
          <button class="px-4 py-2 bg-[#E67E50] text-white rounded-lg font-medium">Vista General</button>
          <button class="px-4 py-2 rounded-lg transition-colors text-sm font-medium text-[#757575] dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50">Rutas</button>
          <button class="px-4 py-2 rounded-lg transition-colors text-sm font-medium text-[#757575] dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50">Flota</button>
        </div>
        
        <div class="flex items-center gap-4">
          <button class="flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white hover:bg-gray-50 dark:hover:bg-[#374B54]/50">
            <Calendar class="w-4 h-4" />
            <span>{{ dateRange }}</span>
            <ChevronDown class="w-4 h-4" />
          </button>

          <button class="relative p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-[#374B54]/50">
            <Bell class="w-5 h-5 text-[#424242] dark:text-[#82A1B1]" />
            <span v-if="notifications > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-[#E67E50] text-white text-xs rounded-full flex items-center justify-center">
              {{ notifications }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto px-6 py-8">
      
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="(kpi, i) in [
          { icon: Truck, label: 'Vehículos Activos', value: '35', change: 12, trend: 'up', color: '#E67E50', subtitle: 'de 60 totales' },
          { icon: Package, label: 'Entregas Hoy', value: '248', change: 8, trend: 'up', color: '#374B54', subtitle: '15 pendientes' },
          { icon: Users, label: 'Repartidores', value: '42', change: 5, trend: 'up', color: '#092C4C', subtitle: '38 activos ahora' },
          { icon: Activity, label: 'Eficiencia Global', value: '94%', change: 3, trend: 'up', color: '#E67E50', subtitle: 'vs 91% ayer' }
        ]" :key="i"
        class="p-6 rounded-2xl shadow-sm border transition-all hover:shadow-lg animate-fade-in-up bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54]"
        :style="{ animationDelay: `${i * 100}ms` }"
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
          <p class="text-sm font-medium mb-1 text-[#757575] dark:text-[#82A1B1]">{{ kpi.label }}</p>
          <div class="text-3xl font-bold mb-1 text-[#424242] dark:text-white">{{ kpi.value }}</div>
          <p class="text-xs text-[#9e9e9e] dark:text-gray-500">{{ kpi.subtitle }}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2 p-6 rounded-2xl shadow-sm border animate-fade-in-up bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54]" style="animation-delay: 200ms;">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-bold text-lg mb-1 text-[#424242] dark:text-white">Entregas Semanales</h3>
              <p class="text-sm text-[#757575] dark:text-[#82A1B1]">Comparativa de rendimiento</p>
            </div>
            <div class="flex gap-2">
              <button class="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-[#374B54]/50">
                <Download class="w-5 h-5 text-[#757575] dark:text-[#82A1B1]" />
              </button>
              <button class="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-[#374B54]/50">
                <RefreshCw class="w-5 h-5 text-[#757575] dark:text-[#82A1B1]" />
              </button>
            </div>
          </div>
          <div class="w-full h-[300px]">
            <VueApexCharts height="100%" width="100%" :options="chartOptionsArea" :series="chartSeriesArea" />
          </div>
        </div>

        <div class="p-6 rounded-2xl shadow-sm border animate-fade-in-up bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54]" style="animation-delay: 300ms;">
          <h3 class="font-bold text-lg mb-6 text-[#424242] dark:text-white">Estado de Flota</h3>
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
                 <span class="text-[#757575] dark:text-[#82A1B1]">{{ item.label }}</span>
               </div>
               <span class="font-semibold text-[#424242] dark:text-white">{{ item.val }}</span>
             </div>
          </div>
        </div>
      </div>

       <div class="grid lg:grid-cols-3 gap-6 mb-8">
         <div class="lg:col-span-2 p-6 rounded-2xl shadow-sm border animate-fade-in-up bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54]" style="animation-delay: 400ms;">
           <div class="flex items-center justify-between mb-4">
             <div>
               <h3 class="font-bold text-lg mb-1 text-[#424242] dark:text-white">Mapa en Tiempo Real</h3>
               <div class="flex items-center gap-2 text-sm">
                 <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span class="text-[#757575] dark:text-[#82A1B1]">35 vehículos activos</span>
               </div>
             </div>
           </div>

           <div ref="mapContainer" 
                class="w-full h-[350px] sm:h-[400px] z-0 rounded-xl relative overflow-hidden border bg-gray-100 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] shadow-inner"
                :class="{ 'dark-mode-map': temaStore.isDark }">
           </div>
         </div>

         <div class="p-6 rounded-2xl shadow-sm border animate-fade-in-up bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54]" style="animation-delay: 500ms;">
           <h3 class="font-bold text-lg mb-6 text-[#424242] dark:text-white">Actividad por Zona</h3>
           <div class="space-y-5">
             <div v-for="(zone, i) in heatmapData" :key="i">
               <div class="flex justify-between mb-2 text-sm">
                 <span class="text-[#757575] dark:text-[#82A1B1]">{{ zone.zone }}</span>
                 <span class="font-semibold text-[#424242] dark:text-white">{{ zone.actividad }}%</span>
               </div>
               <div class="h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-[#16181A]">
                 <div class="h-full rounded-full transition-all duration-1000 ease-out"
                   :style="{ width: `${zone.actividad}%`, background: `linear-gradient(90deg, #E67E50 0%, ${zone.actividad > 80 ? '#10b981' : '#f59e0b'} 100%)` }"
                 ></div>
               </div>
             </div>
           </div>
           
           <div class="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-[#16181A]">
             <h4 class="text-sm font-semibold mb-1 text-[#424242] dark:text-white">Zona más activa</h4>
             <p class="text-lg font-bold text-[#E67E50]">Centro (95%)</p>
             <p class="text-xs mt-1 text-[#757575] dark:text-[#82A1B1]">+18% vs semana anterior</p>
           </div>
         </div>
       </div>

       <div class="grid lg:grid-cols-3 gap-6">
         <div class="lg:col-span-2 p-6 rounded-2xl shadow-sm border animate-fade-in-up bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54]" style="animation-delay: 600ms;">
           <div class="flex items-center justify-between mb-6">
             <h3 class="font-bold text-lg text-[#424242] dark:text-white">Entregas Recientes</h3>
             <div class="flex gap-2">
               <div class="relative">
                 <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#82A1B1]" />
                 <input type="text" placeholder="Buscar..." 
                   class="pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                 >
               </div>
             </div>
           </div>

           <div class="overflow-x-auto">
             <table class="w-full text-sm text-left">
               <thead>
                 <tr class="border-b border-gray-200 dark:border-[#374B54] text-[#757575] dark:text-[#82A1B1]">
                   <th class="py-3 px-2 font-medium">ID</th>
                   <th class="py-3 px-2 font-medium">Repartidor</th>
                   <th class="py-3 px-2 font-medium">Ruta</th>
                   <th class="py-3 px-2 font-medium">Estado</th>
                   <th class="py-3 px-2 font-medium">Hora</th>
                   <th class="py-3 px-2 font-medium">Paquetes</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-gray-100 dark:divide-[#374B54]">
                 <tr v-for="d in recentDeliveries" :key="d.id" class="transition-colors hover:bg-gray-50 dark:hover:bg-[#16181A]/50">
                   <td class="py-4 px-2 font-medium text-[#424242] dark:text-white">{{ d.id }}</td>
                   <td class="py-4 px-2">
                     <p class="font-medium text-[#424242] dark:text-white">{{ d.driver }}</p>
                     <p class="text-xs text-[#757575] dark:text-[#82A1B1]">{{ d.vehicle }}</p>
                   </td>
                   <td class="py-4 px-2 text-[#757575] dark:text-[#82A1B1]">{{ d.route }}</td>
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
                   <td class="py-4 px-2 text-[#757575] dark:text-[#82A1B1]">{{ d.time }}</td>
                   <td class="py-4 px-2 font-medium text-[#424242] dark:text-white">{{ d.packages }}</td>
                 </tr>
               </tbody>
             </table>
           </div>
         </div>

         <div class="p-6 rounded-2xl shadow-sm border animate-fade-in-up bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54]" style="animation-delay: 700ms;">
           <div class="flex items-center justify-between mb-6">
             <h3 class="font-bold text-lg text-[#424242] dark:text-white">Alertas</h3>
             <span class="w-6 h-6 bg-[#E67E50] text-white rounded-full flex items-center justify-center text-xs font-bold">{{ incidents.length }}</span>
           </div>

           <div class="space-y-4">
             <div v-for="inc in incidents" :key="inc.id" class="p-4 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md bg-white dark:bg-[#16181A] border-r border-t border-b border-gray-100 dark:border-r-[#374B54] dark:border-t-[#374B54] dark:border-b-[#374B54]"
               :class="[
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
                   <h4 class="font-semibold text-sm mb-1 text-[#424242] dark:text-white">{{ inc.title }}</h4>
                   <p class="text-xs mb-2 leading-relaxed text-[#757575] dark:text-[#82A1B1]">{{ inc.description }}</p>
                   <p class="text-[10px] font-medium text-gray-500 dark:text-gray-500">{{ inc.time }}</p>
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
/* Estilos para el modo oscuro del mapa usando filtros CSS */
.dark-mode-map .leaflet-tile-container {
    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}
.dark-mode-map .leaflet-control-zoom,
.dark-mode-map .leaflet-control-attribution {
    filter: invert(100%) hue-rotate(180deg);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}
</style>