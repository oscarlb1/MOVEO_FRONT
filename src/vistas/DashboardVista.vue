<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSesionStore } from '@/tiendas/sesion'
import DashboardDemoVista from './DashboardDemoVista.vue'
import {
  Truck, Package, Users, Activity, CheckCircle2, Clock,
  AlertCircle, Zap, Bell, Search, Eye, RefreshCw, TrendingUp,
  X, BarChart3, MapPin
} from 'lucide-vue-next'
import dashboardServicio from '@/servicios/dashboardServicio'
import type {
  EstadisticaGlobal, EntregaEstadisticasHoy, VehiculoItem,
  EntregaItem, NotificacionItem, RankingItem, EstadisticasHoy
} from '@/modelos/Dashboard'

const sesionStore = useSesionStore()
const darkMode = ref(false)
const seccionActiva = ref('general')
const busquedaEntregas = ref('')

// Estado de datos
const cargando = ref(true)
const estadisticasGlobales = ref<EstadisticaGlobal | null>(null)
const estadisticasHoyEntregas = ref<EntregaEstadisticasHoy | null>(null)
const estadisticasHoyUsuario = ref<EstadisticasHoy | null>(null)
const vehiculos = ref<VehiculoItem[]>([])
const entregasRecientes = ref<EntregaItem[]>([])
const notificaciones = ref<NotificacionItem[]>([])
const conteoNoLeidas = ref(0)
const ranking = ref<RankingItem[]>([])

// Rol del usuario
const esAdmin = computed(() => sesionStore.usuario?.rol === 'ADMIN')

// KPIs calculados a partir de los datos reales
const kpis = computed(() => {
  const vehiculosEnRuta = vehiculos.value.filter(v => v.estado === 'EN_RUTA').length
  const totalVehiculos = vehiculos.value.length
  const entregasHoy = estadisticasHoyEntregas.value?.totalHoy ?? 0
  const pendientes = estadisticasHoyEntregas.value?.pendientes ?? 0
  const totalUsuarios = estadisticasGlobales.value?.totalUsuarios ?? 0
  const eficiencia = estadisticasHoyUsuario.value?.eficiencia ?? 0

  return [
    {
      icon: Truck,
      label: 'Vehículos Activos',
      value: vehiculosEnRuta.toString(),
      subtitle: `de ${totalVehiculos} totales`,
      color: '#E67E50',
    },
    {
      icon: Package,
      label: 'Entregas Hoy',
      value: entregasHoy.toString(),
      subtitle: `${pendientes} pendientes`,
      color: '#374B54',
    },
    {
      icon: Users,
      label: 'Usuarios',
      value: totalUsuarios.toString(),
      subtitle: 'registrados en el sistema',
      color: '#092C4C',
    },
    {
      icon: Activity,
      label: 'Eficiencia',
      value: eficiencia > 0 ? `${eficiencia.toFixed(0)}%` : '—',
      subtitle: 'rendimiento del día',
      color: '#E67E50',
    },
  ]
})

// Estado de la flota agrupado real
const estadoFlota = computed(() => {
  const enRuta = vehiculos.value.filter(v => v.estado === 'EN_RUTA').length
  const disponibles = vehiculos.value.filter(v => v.estado === 'DISPONIBLE').length
  const mantenimiento = vehiculos.value.filter(v => v.estado === 'MANTENIMIENTO').length
  const fueraServicio = vehiculos.value.filter(v => v.estado === 'FUERA_DE_SERVICIO').length
  return [
    { label: 'En ruta', val: enRuta, color: '#E67E50' },
    { label: 'Disponibles', val: disponibles, color: '#374B54' },
    { label: 'Mantenimiento', val: mantenimiento, color: '#092C4C' },
    { label: 'Fuera de servicio', val: fueraServicio, color: '#BDBDBD' },
  ]
})

// Entrega recientes filtradas por búsqueda
const entregasFiltradas = computed(() => {
  const q = busquedaEntregas.value.toLowerCase()
  if (!q) return entregasRecientes.value.slice(0, 10)
  return entregasRecientes.value
    .filter(e =>
      `#D-${e.id}`.includes(q) ||
      e.estado.toLowerCase().includes(q) ||
      e.rutaId.toString().includes(q) ||
      e.cliente?.nombre?.toLowerCase().includes(q)
    )
    .slice(0, 10)
})

// Notificaciones recientes (últimas 4)
const notificacionesRecientes = computed(() =>
  [...notificaciones.value]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 4)
)

// Helpers de estado
function colorEstadoEntrega(estado: string) {
  if (estado === 'ENTREGADO') return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
  if (estado === 'EN_CAMINO') return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  if (estado === 'FALLIDO') return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
}

function labelEstado(estado: string) {
  const map: Record<string, string> = {
    ENTREGADO: 'completada',
    EN_CAMINO: 'en-ruta',
    PENDIENTE: 'pendiente',
    FALLIDO: 'fallido',
  }
  return map[estado] ?? estado.toLowerCase()
}

function colorNotificacion(titulo: string) {
  const t = titulo.toLowerCase()
  if (t.includes('error') || t.includes('fallo') || t.includes('retraso')) return { border: 'border-l-red-500', icon: 'text-red-500', bg: 'bg-red-50' }
  if (t.includes('alerta') || t.includes('mantenimiento') || t.includes('revisión')) return { border: 'border-l-yellow-500', icon: 'text-yellow-500', bg: 'bg-yellow-50' }
  if (t.includes('alcanzada') || t.includes('exitosa') || t.includes('completada')) return { border: 'border-l-green-500', icon: 'text-green-500', bg: 'bg-green-50' }
  return { border: 'border-l-blue-500', icon: 'text-blue-500', bg: 'bg-blue-50' }
}

function iconoNotificacion(titulo: string) {
  const t = titulo.toLowerCase()
  if (t.includes('error') || t.includes('fallo') || t.includes('retraso')) return AlertCircle
  if (t.includes('alerta') || t.includes('mantenimiento')) return AlertCircle
  if (t.includes('alcanzada') || t.includes('exitosa')) return CheckCircle2
  return Zap
}

function tiempoRelativo(fecha: string) {
  const diff = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `Hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Hace ${h} hora${h > 1 ? 's' : ''}`
  return `Hace ${Math.floor(h / 24)} día${Math.floor(h / 24) > 1 ? 's' : ''}`
}

function horaEntrega(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// Colores de posición del ranking
function colorPosicion(pos: number) {
  if (pos === 1) return 'bg-yellow-100 text-yellow-700'
  if (pos === 2) return 'bg-gray-100 text-gray-500'
  if (pos === 3) return 'bg-orange-100 text-orange-600'
  return 'bg-slate-100 text-slate-500'
}

// Marcar notificación como leída
async function marcarLeida(id: number) {
  try {
    await dashboardServicio.marcarNotificacionLeida(id)
    const n = notificaciones.value.find(n => n.id === id)
    if (n) n.leido = true
    conteoNoLeidas.value = Math.max(0, conteoNoLeidas.value - 1)
  } catch {}
}

// Cargar todos los datos en paralelo
async function cargarDatos() {
  cargando.value = true
  try {
    const promesas: Promise<any>[] = [
      dashboardServicio.obtenerEntregasEstadisticasHoy().then(d => { estadisticasHoyEntregas.value = d }).catch(() => {}),
      dashboardServicio.obtenerMisEstadisticasHoy().then(d => { estadisticasHoyUsuario.value = d }).catch(() => {}),
      dashboardServicio.obtenerVehiculos().then(d => { vehiculos.value = d }).catch(() => {}),
      dashboardServicio.obtenerEntregasRecientes().then(d => { entregasRecientes.value = d }).catch(() => {}),
      dashboardServicio.obtenerNotificaciones().then(d => { notificaciones.value = d }).catch(() => {}),
      dashboardServicio.obtenerConteoNoLeidas().then(d => { conteoNoLeidas.value = d }).catch(() => {}),
      dashboardServicio.obtenerRanking(4).then(d => { ranking.value = d }).catch(() => {}),
    ]
    // Solo ADMIN puede pedir estadísticas globales
    if (esAdmin.value) {
      promesas.push(
        dashboardServicio.obtenerEstadisticasGlobales().then(d => { estadisticasGlobales.value = d }).catch(() => {})
      )
    }
    await Promise.all(promesas)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  if (sesionStore.estaAutenticado) cargarDatos()
})
</script>

<template>
  <div class="animate-in fade-in duration-300">
    <!-- Si NO está autenticado, muestra el Demo -->
    <DashboardDemoVista v-if="!sesionStore.estaAutenticado" />

    <!-- Dashboard Real -->
    <div v-else :class="['min-h-screen transition-colors duration-300', darkMode ? 'bg-[#0a0f1a] text-white' : 'bg-[#F4F6F8] text-[#424242]']">

      <!-- Toolbar con tabs -->
      <div class="max-w-[1600px] mx-auto px-6 pt-6 pb-2">
        <div class="flex items-center justify-start p-4 rounded-2xl border transition-all"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200 shadow-sm'">
          <div class="flex items-center gap-3">
            <button
              v-for="tab in [
                { key: 'general', label: 'Vista General' },
                { key: 'rutas', label: 'Rutas' },
                { key: 'vehiculos', label: 'Vehículos' },
                { key: 'usuarios', label: 'Usuarios' },
                { key: 'entregas', label: 'Entregas' },
              ]"
              :key="tab.key"
              @click="seccionActiva = tab.key"
              class="px-5 py-2.5 rounded-lg text-base font-medium transition-colors"
              :class="seccionActiva === tab.key
                ? 'bg-[#E67E50] text-white'
                : (darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-[#E67E50]' : 'text-[#757575] hover:bg-orange-50 hover:text-[#E67E50]')"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Controles derecha -->
          <div class="ml-auto flex items-center gap-3">
            <!-- Notificaciones badge -->
            <div class="relative">
              <button class="p-2 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'">
                <Bell class="w-5 h-5" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'" />
              </button>
              <span v-if="conteoNoLeidas > 0"
                class="absolute -top-1 -right-1 w-5 h-5 bg-[#E67E50] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {{ conteoNoLeidas > 9 ? '9+' : conteoNoLeidas }}
              </span>
            </div>

            <!-- Refresh -->
            <button @click="cargarDatos" class="p-2 rounded-lg transition-colors"
              :class="darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'">
              <RefreshCw class="w-5 h-5 text-gray-500" :class="{ 'animate-spin': cargando }" />
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

        <!-- Saludo -->
        <div>
          <h1 class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
            Hola, {{ sesionStore.usuario?.nombre || 'Usuario' }} 👋
          </h1>
          <p class="text-sm mt-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
            Aquí tienes el resumen de operaciones de hoy
          </p>
        </div>

        <!-- ── KPIs ── -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Skeleton cargando -->
          <template v-if="cargando">
            <div v-for="i in 4" :key="i"
              class="p-6 rounded-2xl border animate-pulse"
              :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
              <div class="h-4 rounded w-24 mb-4" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
              <div class="h-8 rounded w-16 mb-2" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
              <div class="h-3 rounded w-32" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
            </div>
          </template>

          <!-- KPI cards reales -->
          <template v-else>
            <div v-for="(kpi, i) in kpis" :key="i"
              class="p-6 rounded-2xl border transition-all hover:shadow-md"
              :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'">
              <div class="flex items-start justify-between mb-4">
                <div class="p-3 rounded-xl" :style="{ backgroundColor: `${kpi.color}18` }">
                  <component :is="kpi.icon" class="w-6 h-6" :style="{ color: kpi.color }" />
                </div>
              </div>
              <p class="text-sm font-medium mb-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ kpi.label }}</p>
              <div class="text-3xl font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ kpi.value }}</div>
              <p class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-[#9e9e9e]'">{{ kpi.subtitle }}</p>
            </div>
          </template>
        </div>

        <!-- ── Fila 2: Entregas Recientes + Alertas ── -->
        <div class="grid lg:grid-cols-3 gap-6">

          <!-- Tabla de entregas recientes -->
          <div class="lg:col-span-2 rounded-2xl border shadow-sm"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
            <div class="flex items-center justify-between p-6 pb-4">
              <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Entregas Recientes</h2>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="busquedaEntregas"
                    type="text"
                    placeholder="Buscar..."
                    class="pl-9 pr-4 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                    :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'"
                  />
                </div>
              </div>
            </div>

            <!-- Skeleton tabla -->
            <div v-if="cargando" class="px-6 pb-6 space-y-3">
              <div v-for="i in 5" :key="i" class="h-12 rounded-lg animate-pulse"
                :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
            </div>

            <!-- Tabla real -->
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b text-xs font-semibold uppercase tracking-wide"
                    :class="darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-[#9e9e9e]'">
                    <th class="py-3 px-6 text-left">ID</th>
                    <th class="py-3 px-4 text-left">Cliente</th>
                    <th class="py-3 px-4 text-left">Ruta</th>
                    <th class="py-3 px-4 text-left">Estado</th>
                    <th class="py-3 px-4 text-left">Hora</th>
                    <th class="py-3 px-4 text-left">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-50'">
                  <tr v-if="entregasFiltradas.length === 0">
                    <td colspan="6" class="py-10 text-center text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                      No hay entregas registradas
                    </td>
                  </tr>
                  <tr v-for="e in entregasFiltradas" :key="e.id"
                    class="hover:bg-opacity-50 transition-colors"
                    :class="darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'">
                    <td class="py-4 px-6 font-semibold text-xs" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">
                      #D-{{ e.id }}
                    </td>
                    <td class="py-4 px-4">
                      <p class="font-medium" :class="darkMode ? 'text-white' : 'text-[#424242]'">
                        {{ e.cliente?.nombre || `Cliente #${e.clienteId}` }}
                      </p>
                    </td>
                    <td class="py-4 px-4" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                      Ruta #{{ e.rutaId }}
                    </td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                        :class="[colorEstadoEntrega(e.estado).bg, colorEstadoEntrega(e.estado).text, colorEstadoEntrega(e.estado).border]">
                        {{ labelEstado(e.estado) }}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                      <span class="flex items-center gap-1">
                        <Clock class="w-3.5 h-3.5" />
                        {{ horaEntrega(e.horaEntregaReal || e.updatedAt) }}
                      </span>
                    </td>
                    <td class="py-4 px-4">
                      <button class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'">
                        <Eye class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Alertas e Incidencias -->
          <div class="rounded-2xl border shadow-sm"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
            <div class="flex items-center justify-between p-6 pb-4">
              <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Alertas e Incidencias</h2>
              <span v-if="conteoNoLeidas > 0"
                class="w-7 h-7 bg-[#E67E50] text-white rounded-full flex items-center justify-center text-xs font-bold">
                {{ conteoNoLeidas }}
              </span>
            </div>

            <!-- Skeleton notificaciones -->
            <div v-if="cargando" class="px-6 pb-6 space-y-3">
              <div v-for="i in 3" :key="i" class="h-20 rounded-xl animate-pulse"
                :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
            </div>

            <div v-else class="px-6 pb-6 space-y-3">
              <p v-if="notificacionesRecientes.length === 0"
                class="text-sm py-8 text-center" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                Sin alertas activas
              </p>
              <div v-for="n in notificacionesRecientes" :key="n.id"
                class="p-4 rounded-xl border-l-4 transition-all hover:shadow-sm"
                :class="[
                  colorNotificacion(n.titulo).border,
                  darkMode ? 'bg-gray-800/50 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-100',
                  n.leido ? 'opacity-60' : ''
                ]">
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 p-1.5 rounded-lg" :class="colorNotificacion(n.titulo).bg">
                    <component :is="iconoNotificacion(n.titulo)" class="w-4 h-4" :class="colorNotificacion(n.titulo).icon" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold leading-tight" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ n.titulo }}</h4>
                    <p class="text-xs mt-0.5 leading-relaxed line-clamp-2" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ n.mensaje }}</p>
                    <span class="text-[10px] font-medium mt-1 block" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                      {{ tiempoRelativo(n.fecha) }}
                    </span>
                  </div>
                  <button v-if="!n.leido" @click="marcarLeida(n.id)"
                    class="p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Marcar como leída">
                    <X class="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Fila 3: Estado de flota + Ranking ── -->
        <div class="grid lg:grid-cols-2 gap-6">

          <!-- Estado de Flota -->
          <div class="rounded-2xl border shadow-sm p-6"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
            <h2 class="font-bold text-lg mb-6" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Estado de Flota</h2>

            <div v-if="cargando" class="space-y-4">
              <div v-for="i in 4" :key="i"
                class="h-8 rounded-lg animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
            </div>

            <div v-else>
              <div v-if="vehiculos.length === 0"
                class="text-center py-8 text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                Sin datos de flota
              </div>
              <div v-else>
                <!-- Barra de distribución visual -->
                <div class="flex rounded-full overflow-hidden h-3 mb-6">
                  <div v-for="item in estadoFlota" :key="item.label"
                    class="transition-all duration-700"
                    :style="{ width: vehiculos.length > 0 ? `${(item.val / vehiculos.length) * 100}%` : '0%', backgroundColor: item.color }">
                  </div>
                </div>
                <!-- Lista -->
                <div class="space-y-3">
                  <div v-for="item in estadoFlota" :key="item.label"
                    class="flex items-center justify-between py-2 border-b last:border-0"
                    :class="darkMode ? 'border-gray-700' : 'border-gray-50'">
                    <div class="flex items-center gap-3">
                      <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: item.color }"></div>
                      <span class="text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#757575]'">{{ item.label }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-24 h-1.5 rounded-full overflow-hidden" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'">
                        <div class="h-full rounded-full transition-all duration-700"
                          :style="{ width: vehiculos.length > 0 ? `${(item.val / vehiculos.length) * 100}%` : '0%', backgroundColor: item.color }">
                        </div>
                      </div>
                      <span class="text-sm font-bold w-6 text-right" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ item.val }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ranking de Repartidores -->
          <div class="rounded-2xl border shadow-sm p-6"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
            <h2 class="font-bold text-lg mb-6" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Mejores Repartidores</h2>

            <div v-if="cargando" class="space-y-4">
              <div v-for="i in 4" :key="i"
                class="h-16 rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
            </div>

            <div v-else>
              <div v-if="ranking.length === 0"
                class="text-center py-8 text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                Sin datos de ranking
              </div>
              <div v-else class="space-y-3">
                <div v-for="r in ranking" :key="r.usuarioId"
                  class="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                  :class="darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'">
                  <!-- Posición -->
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    :class="colorPosicion(r.posicion)">
                    #{{ r.posicion }}
                  </div>
                  <!-- Avatar inicial -->
                  <div class="w-9 h-9 rounded-full bg-[#E67E50] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {{ r.nombreUsuario.substring(0, 1).toUpperCase() }}
                  </div>
                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm truncate" :class="darkMode ? 'text-white' : 'text-[#424242]'">
                      {{ r.nombreUsuario }}
                    </p>
                    <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#9e9e9e]'">
                      {{ r.entregasTotales }} entregas
                    </p>
                  </div>
                  <!-- Puntos -->
                  <div class="text-right flex-shrink-0">
                    <p class="font-bold text-sm text-[#E67E50]">{{ r.puntos }}</p>
                    <p class="text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">puntos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
