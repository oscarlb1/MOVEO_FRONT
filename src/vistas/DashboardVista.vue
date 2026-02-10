<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSesionStore } from '@/tiendas/sesion';
import DashboardDemoVista from './DashboardDemoVista.vue';
import type { ApexOptions } from 'apexcharts'
import { 
  Truck, Package, Users, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Clock, MapPin, Activity,
  Bell, Calendar, Filter, Search, MoreVertical,
  Download, RefreshCw, ChevronDown, Eye, XCircle, Zap,
  Moon, Sun, ShieldCheck, BarChart3
} from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'

const sesionStore = useSesionStore();

// State
const darkMode = ref(false) 
const dateRange = ref("Esta Semana")
const notifications = ref(2)

// Datos del Usuario (Mock por ahora, vendrían del store o API)
const kpisUsuario = [
  { icon: Truck, label: 'Mi Flota', value: '12', change: 0, trend: 'neutral', color: '#E67E50', subtitle: 'Vehículos activos' },
  { icon: Package, label: 'Envíos Activos', value: '8', change: 12, trend: 'up', color: '#374B54', subtitle: '2 en tránsito' },
  { icon: CheckCircle2, label: 'Entregados', value: '156', change: 8, trend: 'up', color: '#092C4C', subtitle: 'Este mes' },
  { icon: Activity, label: 'Eficiencia', value: '98%', change: 2, trend: 'up', color: '#E67E50', subtitle: 'Nivel óptimo' }
]

const serviciosActivos = [
  { id: 1, nombre: 'Gestión de Flota Premium', estado: 'activo', color: 'bg-blue-500', icon: Truck },
  { id: 2, nombre: 'Optimización de Rutas IA', estado: 'activo', color: 'bg-[#E67E50]', icon: BarChart3 }
]

// Chart Options
const chartOptionsMain = computed<ApexOptions>(() => ({
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
  legend: { show: false },
  tooltip: {
    theme: darkMode.value ? 'dark' : 'light',
    style: {
      fontSize: '12px',
      color: darkMode.value ? '#fff' : '#000'
    },
    marker: { show: true },
    x: { show: true }
  }
}))

const chartSeriesMain = [
  { name: 'Mis Envíos', data: [12, 19, 15, 22, 28, 18, 14] },
  { name: 'Completados', data: [10, 15, 12, 20, 25, 15, 12] }
]

// Incidentes recientes
const alertasRecientes = [
  { id: 1, type: 'info', title: 'Ruta Optimizada', description: 'Se ha recalculado la ruta del envío #TXT-2024 debido al tráfico.', time: 'Hace 30 min', icon: Zap },
  { id: 2, type: 'success', title: 'Entrega Exitosa', description: 'El paquete #PKG-9988 ha sido entregado correctamente.', time: 'Hace 2 horas', icon: CheckCircle2 }
]
</script>

<template>
  <div class="animate-in fade-in duration-300">
    <!-- Si NO está autenticado, muestra el Demo -->
    <DashboardDemoVista v-if="!sesionStore.estaAutenticado" />

    <!-- Si ESTÁ autenticado, muestra el Dashboard Real (Implementado aquí) -->
    <div v-else :class="[
      'min-h-screen transition-colors duration-300',
      darkMode ? 'bg-[#0a0f1a] text-white' : 'bg-[#FAFAFA] text-[#424242]'
    ]">
      
      <!-- Dashboard Toolbar -->
      <div class="max-w-[1600px] mx-auto px-6 pt-6 pb-2">
        <div class="flex items-center justify-between p-4 rounded-2xl border transition-all"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200 shadow-sm'">
          
          <div>
            <h1 class="text-xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
              Hola, {{ sesionStore.usuario?.nombre || 'Cliente' }} 👋
            </h1>
            <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
              Resumen de tu operación
            </p>
          </div>

          <div class="flex items-center gap-4">
             <!-- Dark Mode Toggle -->
             <button
              @click="darkMode = !darkMode"
              class="p-2 rounded-lg transition-colors"
              :class="darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
            >
              <Moon v-if="darkMode" class="w-5 h-5 text-[#E67E50]" />
              <Sun v-else class="w-5 h-5 text-gray-500" />
            </button>
            
            <button class="flex items-center gap-2 px-4 py-2 bg-[#E67E50] text-white rounded-lg hover:bg-[#d56d40] transition-colors shadow-sm text-sm font-medium">
              <Package class="w-4 h-4" />
              <span>Nuevo Envío</span>
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-[1600px] mx-auto px-6 py-8">
        
        <!-- KPIs -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div v-for="(kpi, i) in kpisUsuario" :key="i"
            class="p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="p-3 rounded-xl" :style="{ backgroundColor: `${kpi.color}20` }">
                <component :is="kpi.icon" class="w-6 h-6" :style="{ color: kpi.color }" />
              </div>
              <div v-if="kpi.change !== 0" class="flex items-center gap-1" :class="kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'">
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

        <div class="grid lg:grid-cols-3 gap-8">
          
          <!-- Main Chart Section -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Activity Chart -->
            <div class="p-6 rounded-2xl shadow-sm border"
              :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Actividad Semanal</h3>
                <select class="px-3 py-1 rounded-lg text-sm border bg-transparent"
                  :class="darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'">
                  <option>Últimos 7 días</option>
                  <option>Este mes</option>
                </select>
              </div>
              <div class="h-[300px] w-full">
                <VueApexCharts height="100%" width="100%" :options="chartOptionsMain" :series="chartSeriesMain" />
              </div>
            </div>

            <!-- Services List (Compact) -->
             <div class="p-6 rounded-2xl shadow-sm border"
              :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
              <h3 class="font-bold text-lg mb-4" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Mis Servicios Contratados</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div v-for="serv in serviciosActivos" :key="serv.id" 
                  class="flex items-center p-4 rounded-xl border transition-colors"
                  :class="darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'"
                >
                  <div :class="[serv.color, 'bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mr-4']">
                    <component :is="serv.icon" :class="[serv.color.replace('bg-', 'text-'), 'w-6 h-6']" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ serv.nombre }}</h4>
                    <span class="text-xs text-green-500 font-medium uppercase">{{ serv.estado }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-8">
            
            <!-- Recent Alerts -->
            <div class="p-6 rounded-2xl shadow-sm border"
              :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Notificaciones</h3>
                <span class="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">New</span>
              </div>
              <div class="space-y-4">
                <div v-for="alerta in alertasRecientes" :key="alerta.id" 
                  class="flex gap-3 p-4 rounded-xl border-l-4 shadow-sm"
                  :class="[
                    darkMode ? 'bg-[#1a2332] border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-100',
                    alerta.type === 'info' ? 'border-l-blue-500' : 
                    alerta.type === 'success' ? 'border-l-green-500' : 
                    'border-l-yellow-500'
                  ]"
                >
                  <div class="mt-1">
                    <component :is="alerta.icon" class="w-5 h-5" 
                      :class="[
                        alerta.type === 'info' ? 'text-blue-500' :
                        alerta.type === 'success' ? 'text-green-500' :
                        'text-yellow-500'
                      ]"
                    />
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ alerta.title }}</h4>
                    <p class="text-xs mt-1 leading-relaxed" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ alerta.description }}</p>
                    <span class="text-[10px] text-gray-400 block mt-1 font-medium">{{ alerta.time }}</span>
                  </div>
                </div>
              </div>
              <button class="w-full mt-6 py-2 text-sm text-[#E67E50] font-medium hover:underline">Ver todas</button>
            </div>

            <!-- Quick Actions -->
            <div class="p-6 rounded-2xl shadow-sm border bg-gradient-to-br from-[#092C4C] to-[#1a3b5c] text-white">
              <h3 class="font-bold text-lg mb-2">¿Necesitas ayuda?</h3>
              <p class="text-sm text-gray-300 mb-6">Nuestro equipo de soporte está disponible 24/7 para asistirte con tu flota.</p>
              <button class="w-full py-2 bg-white text-[#092C4C] rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                Contactar Soporte
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
