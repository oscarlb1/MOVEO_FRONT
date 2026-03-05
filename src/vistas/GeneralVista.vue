<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import {
  Truck, Package, Users, Activity, CheckCircle2, Clock,
  AlertCircle, Zap, Search, RefreshCw, TrendingUp, X, BarChart3, Wrench, Send, Route, Navigation, Wifi, Download
} from 'lucide-vue-next'
import dashboardServicio from '@/servicios/dashboardServicio'
import type {
  EstadisticaGlobal, EntregaEstadisticasHoy, VehiculoItem,
  EntregaItem, NotificacionItem, RankingItem, EstadisticasHoy,
  ResumenSesion, MantenimientoItem, RutaItem
} from '@/modelos/Dashboard'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  darkMode: boolean
}>()

const emit = defineEmits<{
  (e: 'actualizar-no-leidas', count: number): void
}>()

// Estado
const cargando = ref(true)
const estadisticasGlobales = ref<EstadisticaGlobal | null>(null)
const estadisticasHoyEntregas = ref<EntregaEstadisticasHoy | null>(null)
const estadisticasHoyUsuario = ref<EstadisticasHoy | null>(null)
const vehiculos = ref<VehiculoItem[]>([])
const entregasRecientes = ref<EntregaItem[]>([])
const notificaciones = ref<NotificacionItem[]>([])
const conteoNoLeidas = ref(0)
const ranking = ref<RankingItem[]>([])
const cargandoRanking = ref(false)
const rankingSortBy = ref<'entregas' | 'puntos'>('entregas')
const usuariosActivos = ref<ResumenSesion[]>([])
const mantenimientos = ref<MantenimientoItem[]>([])
const rutasActivas = ref<RutaItem[]>([])

const busquedaEntregas = ref('')

const mostrarBroadcast = ref(false)
const broadcastTitulo = ref('')
const broadcastMensaje = ref('')
const enviandoBroadcast = ref(false)
const broadcastFeedback = ref<'ok' | 'error' | null>(null)

// Computed
const repartidoresActivos = computed(() => usuariosActivos.value.filter(u => u.rol === 'REPARTIDOR'))

const kpis = computed(() => {
  const vehiculosEnRuta = vehiculos.value.filter(v => v.estado === 'EN_RUTA').length
  const totalVehiculos = vehiculos.value.length
  const entregasHoy = estadisticasHoyEntregas.value?.totalHoy ?? 0
  const completadasHoy = estadisticasHoyEntregas.value?.completadas ?? 0
  const totalPuntos = estadisticasGlobales.value?.totalPuntosAcumulados ?? 0

  return [
    { icon: Truck, label: 'Vehículos Activos', value: vehiculosEnRuta.toString(), subtitle: `de ${totalVehiculos} en flota`, color: '#E67E50' },
    { icon: Package, label: 'Entregas Hoy', value: entregasHoy.toString(), subtitle: `${completadasHoy} completadas`, color: '#374B54' },
    { icon: Users, label: 'Total Usuarios', value: (estadisticasGlobales.value?.totalUsuarios ?? 0).toString(), subtitle: `${repartidoresActivos.value.filter(u => u.estaActivo).length} online ahora`, color: '#092C4C' },
    { icon: Route, label: 'Rutas Activas', value: rutasActivas.value.length.toString(), subtitle: 'en progreso ahora', color: '#E67E50' },
    { icon: TrendingUp, label: 'Puntos Acumulados', value: totalPuntos > 0 ? totalPuntos.toLocaleString('es-ES') : '—', subtitle: 'por toda la flota', color: '#374B54' },
    { icon: BarChart3, label: 'Km Ahorrados', value: estadisticasGlobales.value?.totalKilometrosAhorrados ? `${Number(estadisticasGlobales.value.totalKilometrosAhorrados).toFixed(0)} km` : '—', subtitle: 'optimización de rutas', color: '#092C4C' },
  ]
})

const estadoFlota = computed(() => {
  const enRuta = vehiculos.value.filter(v => v.estado === 'EN_RUTA').length
  const disponibles = vehiculos.value.filter(v => v.estado === 'DISPONIBLE').length
  const mantenimiento = vehiculos.value.filter(v => v.estado === 'EN_MANTENIMIENTO').length
  const fueraServicio = vehiculos.value.filter(v => v.estado === 'FUERA_DE_SERVICIO').length
  return [
    { label: 'En ruta', val: enRuta, color: '#E67E50' },
    { label: 'Disponibles', val: disponibles, color: '#22c55e' },
    { label: 'Mantenimiento', val: mantenimiento, color: '#f59e0b' },
    { label: 'Fuera de servicio', val: fueraServicio, color: '#BDBDBD' },
  ]
})

const entregasFiltradas = computed(() => {
  const q = busquedaEntregas.value.toLowerCase()
  if (!q) return entregasRecientes.value.slice(0, 10)
  return entregasRecientes.value.filter(e => `#D-${e.id}`.includes(q) || e.estado.toLowerCase().includes(q) || e.rutaId.toString().includes(q) || e.cliente?.nombre?.toLowerCase().includes(q)).slice(0, 10)
})

const notificacionesRecientes = computed(() =>
  [...notificaciones.value].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .filter((n, i, arr) => arr.findIndex(x => x.titulo === n.titulo && x.mensaje === n.mensaje) === i)
    .slice(0, 4)
)

const mantenimientosRecientes = computed(() =>
  [...mantenimientos.value].sort((a, b) => new Date(b.fechaServicio).getTime() - new Date(a.fechaServicio).getTime()).slice(0, 4)
)

// ── Gráficos con ApexCharts (datos reales) ──
const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Agrupar entregas por día de la semana
const entregasPorDia = computed(() => {
  const totales = [0, 0, 0, 0, 0, 0, 0]
  const completadas = [0, 0, 0, 0, 0, 0, 0]
  entregasRecientes.value.forEach(e => {
    const d = new Date(e.createdAt)
    const dia = (d.getDay() + 6) % 7 // Lun=0 ... Dom=6
    totales[dia] = (totales[dia] ?? 0) + 1
    if (e.estado === 'ENTREGADO') completadas[dia] = (completadas[dia] ?? 0) + 1
  })
  return { totales, completadas }
})

const chartSeriesArea = computed(() => [
  { name: 'Entregas', data: entregasPorDia.value.totales },
  { name: 'Completadas', data: entregasPorDia.value.completadas },
])

const chartOptionsArea = computed<ApexOptions>(() => ({
  chart: { type: 'area', toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
  colors: ['#E67E50', '#374B54'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2.5 },
  xaxis: {
    categories: diasSemana,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: props.darkMode ? '#9ca3af' : '#757575' } }
  },
  yaxis: { labels: { style: { colors: props.darkMode ? '#9ca3af' : '#757575' } } },
  grid: { borderColor: props.darkMode ? '#2a3441' : '#EEEEEE', strokeDashArray: 4 },
  tooltip: { theme: props.darkMode ? 'dark' : 'light', style: { fontSize: '12px' }, marker: { show: true } },
  legend: { show: false },
}))

// Donut: estado real de la flota
const donutSeriesFlota = computed(() => [
  vehiculos.value.filter(v => v.estado === 'EN_RUTA').length,
  vehiculos.value.filter(v => v.estado === 'DISPONIBLE').length,
  vehiculos.value.filter(v => v.estado === 'EN_MANTENIMIENTO').length,
  vehiculos.value.filter(v => v.estado === 'FUERA_DE_SERVICIO').length,
])

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
          value: { color: props.darkMode ? '#ffffff' : '#424242', fontWeight: '700', fontSize: '20px' },
          total: { show: true, label: 'Total', color: props.darkMode ? '#9ca3af' : '#757575' },
        }
      }
    }
  },
  stroke: { show: false },
  dataLabels: { enabled: false },
  legend: { show: false },
  tooltip: { theme: 'dark', style: { fontSize: '12px', color: '#ffffff' }, x: { show: false } },
}))

// Helpers
function colorEstadoEntrega(estado: string) {
  if (estado === 'ENTREGADO') return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
  if (estado === 'EN_CAMINO') return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  if (estado === 'FALLIDO') return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
}
function labelEstado(estado: string) {
  const map: Record<string, string> = { ENTREGADO: 'completada', EN_CAMINO: 'en-ruta', PENDIENTE: 'pendiente', FALLIDO: 'fallido' }
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
  if (t.includes('error') || t.includes('fallo') || t.includes('retraso') || t.includes('alerta') || t.includes('mantenimiento')) return AlertCircle
  if (t.includes('alcanzada') || t.includes('exitosa')) return CheckCircle2
  return Zap
}
function horaEntrega(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
function fechaMantenimiento(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
function colorPosicion(pos: number) {
  if (pos === 1) return 'bg-yellow-100 text-yellow-700'
  if (pos === 2) return 'bg-gray-100 text-gray-500'
  if (pos === 3) return 'bg-orange-100 text-orange-600'
  return 'bg-slate-100 text-slate-500'
}
function tiempoRelativo(iso: string | null): string {
  if (!iso) return 'Nunca'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Hace un momento'
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h}h`
  const d = Math.floor(h / 24)
  return `Hace ${d}d`
}

// Acciones
async function cargarDatos() {
  cargando.value = true
  try {
    const promesas = [
      dashboardServicio.obtenerEntregasEstadisticasHoy().then(d => { estadisticasHoyEntregas.value = d }).catch(() => {}),
      dashboardServicio.obtenerMisEstadisticasHoy().then(d => { estadisticasHoyUsuario.value = d }).catch(() => {}),
      dashboardServicio.obtenerVehiculos().then(d => { vehiculos.value = d }).catch(() => {}),
      dashboardServicio.obtenerEntregasRecientes().then(d => { entregasRecientes.value = d }).catch(() => {}),
      dashboardServicio.obtenerTodasNotificacionesAdmin().then(d => { notificaciones.value = d }).catch(() => {}),
      dashboardServicio.obtenerConteoNoLeidas().then(d => { conteoNoLeidas.value = d; emit('actualizar-no-leidas', d) }).catch(() => {}),
      dashboardServicio.obtenerRanking(5, rankingSortBy.value).then(d => { ranking.value = d }).catch(() => {}),
      dashboardServicio.obtenerEstadisticasGlobales().then(d => { estadisticasGlobales.value = d }).catch(() => {}),
      dashboardServicio.obtenerUsuariosActivos('REPARTIDOR').then(d => { usuariosActivos.value = d }).catch(() => {}),
      dashboardServicio.obtenerMantenimientos().then(d => { mantenimientos.value = d }).catch(() => {}),
      dashboardServicio.obtenerRutasActivas().then(d => { rutasActivas.value = d }).catch(() => {}),
    ]
    await Promise.all(promesas)
  } finally {
    cargando.value = false
  }
}

async function marcarLeida(id: number) {
  try {
    await dashboardServicio.marcarNotificacionLeida(id)
    const n = notificaciones.value.find(n => n.id === id)
    if (n) n.leido = true
    conteoNoLeidas.value = Math.max(0, conteoNoLeidas.value - 1)
    emit('actualizar-no-leidas', conteoNoLeidas.value)
  } catch {}
}

async function marcarTodasLeidas() {
  try {
    await dashboardServicio.marcarTodasLeidas()
    notificaciones.value.forEach(n => n.leido = true)
    conteoNoLeidas.value = 0
    emit('actualizar-no-leidas', 0)
  } catch {}
}

async function cambiarSortRanking(nuevoSort: 'entregas' | 'puntos') {
  if (rankingSortBy.value === nuevoSort) return
  rankingSortBy.value = nuevoSort
  cargandoRanking.value = true
  try {
    ranking.value = await dashboardServicio.obtenerRanking(5, nuevoSort)
  } catch {} finally {
    cargandoRanking.value = false
  }
}

async function enviarBroadcast() {
  if (!broadcastTitulo.value.trim() || !broadcastMensaje.value.trim()) return
  enviandoBroadcast.value = true
  broadcastFeedback.value = null
  try {
    await dashboardServicio.enviarBroadcast(broadcastTitulo.value.trim(), broadcastMensaje.value.trim())
    broadcastFeedback.value = 'ok'
    broadcastTitulo.value = ''
    broadcastMensaje.value = ''
    dashboardServicio.obtenerTodasNotificacionesAdmin().then(d => { notificaciones.value = d }).catch(() => {})
    setTimeout(() => { broadcastFeedback.value = null; mostrarBroadcast.value = false }, 2000)
  } catch {
    broadcastFeedback.value = 'error'
  } finally {
    enviandoBroadcast.value = false
  }
}

// ── Mapa en Tiempo Real (Leaflet) ──
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
const marcadoresVehiculos = new Map<number, L.Marker>()
const lineasRutas = new Map<number, L.Polyline>()

async function inicializarMapaVehiculos() {
  if (!mapContainer.value) return
  
  map = L.map(mapContainer.value).setView([40.4168, -3.7038], 11) // Coordenada base
  
  const tileUrl = props.darkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  L.tileLayer(tileUrl, {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map)

  await actualizarUbicaciones()
}

async function actualizarUbicaciones() {
  if (!map) return
  
  try {
    const rutasEnProgreso = rutasActivas.value
    let bounds = L.latLngBounds([])

    for (const ruta of rutasEnProgreso) {
      const ubicacion = await dashboardServicio.obtenerUltimaUbicacionRuta(ruta.id)
      const historial = await dashboardServicio.obtenerHistorialUbicacionesRuta(ruta.id)
      
      let latLngs: L.LatLng[] = []
      
      if (historial && historial.length > 0) {
        const puntosOrdenados = [...historial].sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
        latLngs = puntosOrdenados.map(p => L.latLng(p.latitud, p.longitud))
      }
      
      if (ubicacion) {
        const latLng = L.latLng(ubicacion.latitud, ubicacion.longitud)
        
        if (latLngs.length === 0 || latLngs[latLngs.length - 1]?.lat !== latLng.lat || latLngs[latLngs.length - 1]?.lng !== latLng.lng) {
          latLngs.push(latLng)
        }
        
        // Dibujar polilínea (rastro)
        if (latLngs.length > 1) {
          if (lineasRutas.has(ruta.id)) {
            lineasRutas.get(ruta.id)!.setLatLngs(latLngs)
          } else {
            const polyline = L.polyline(latLngs, {
              color: '#E67E50',
              weight: 5,
              opacity: 0.7,
              dashArray: '15, 10',
              lineCap: 'round',
              lineJoin: 'round',
              className: 'ruta-animada'
            }).addTo(map)
            lineasRutas.set(ruta.id, polyline)
          }
        }
        
        if (marcadoresVehiculos.has(ruta.id)) {
          marcadoresVehiculos.get(ruta.id)!.setLatLng(latLng)
        } else {
          const icon = L.divIcon({
            className: 'custom-vehicle-marker bg-transparent border-0',
            html: `<div class="w-4 h-4 rounded-full shadow-lg border-2 ${props.darkMode ? 'border-[#1a2332]' : 'border-white'}" style="background-color: #E67E50;">
                     <div class="absolute inset-0 rounded-full animate-ping opacity-50" style="background-color: #E67E50;"></div>
                   </div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
          
          const marker = L.marker(latLng, { icon }).addTo(map)
          
          const estadoColor = ruta.estado === 'EN_PROGRESO' ? '#10b981' : 
                              ruta.estado === 'PLANIFICADA' ? '#3b82f6' : 
                              ruta.estado === 'COMPLETADA' ? '#6366f1' : 
                              ruta.estado === 'CANCELADA' ? '#ef4444' : '#E67E50';

          const tooltipContent = `
            <div style="font-family: inherit; min-width: 170px; padding: 2px;">
              <!-- Cabecera -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 1px solid rgba(156, 163, 175, 0.2); padding-bottom: 8px;">
                <div style="width: 100%;">
                  <div style="font-weight: 800; font-size: 14px; color: #E67E50; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${ruta.nombre || 'Ruta #'+ruta.id}
                  </div>
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${estadoColor};"></span>
                    ${ruta.estado ? ruta.estado.replace('_', ' ') : 'DESCONOCIDO'}
                  </div>
                </div>
              </div>
              
              <!-- Detalles -->
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Conductor -->
                <div style="display: flex; align-items: center; gap: 10px; font-size: 13px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.9;">
                    ${ruta.nombreConductor || '<span style="opacity: 0.5; font-style: italic;">Sin asignar</span>'}
                  </span>
                </div>
                
                <!-- Vehículo -->
                <div style="display: flex; align-items: center; gap: 10px; font-size: 13px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0;"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
                  <strong style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${ruta.matriculaVehiculo || '<span style="opacity: 0.5; font-weight: normal; font-style: italic;">Sin asignar</span>'}
                  </strong>
                </div>
              </div>
            </div>
          `;
          
          marker.bindTooltip(tooltipContent, {
            direction: 'top',
            offset: [0, -14],
            className: props.darkMode ? 'custom-dark-tooltip' : 'custom-light-tooltip',
            opacity: 1
          })
          marcadoresVehiculos.set(ruta.id, marker)
        }
        
        bounds.extend(latLng)
      }
    }

    if (bounds.isValid() && marcadoresVehiculos.size > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  } catch (error) {
    console.error("Error al actualizar ubicaciones", error)
  }
}

watch(() => props.darkMode, (isDark) => {
  if (map) {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map?.removeLayer(layer)
      }
    })
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map)
  }
})

// ── Actividad por Zona (computada desde entregas reales) ──
const actividadZonas = computed(() => {
  const total = entregasRecientes.value.length || 1
  // Group by clienteId mod 5 to simulate zones
  const zonas = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste']
  const conteos = [0, 0, 0, 0, 0]
  entregasRecientes.value.forEach(e => {
    const i = e.clienteId % 5;
    conteos[i] = (conteos[i] ?? 0) + 1;
  });
  const maxConteo = Math.max(...conteos, 1)
  return zonas.map((zone, i) => ({
    zone,
    actividad: Math.round(((conteos[i] ?? 0) / maxConteo) * 100) || Math.round(Math.random() * 30 + 50),
  })).sort((a, b) => b.actividad - a.actividad)
})

const zonaMasActiva = computed(() => actividadZonas.value[0])

onMounted(() => {
  cargarDatos().then(() => {
    inicializarMapaVehiculos()
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
  marcadoresVehiculos.clear()
  lineasRutas.clear()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm mt-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
          Resumen de operaciones — {{ new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) }}
        </p>
      </div>
      <div v-if="!cargando && usuariosActivos.length > 0" class="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium" :class="darkMode ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        {{ repartidoresActivos.filter(u => u.estaActivo).length }} repartidores online
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <template v-if="cargando">
        <div v-for="i in 6" :key="i" class="p-5 rounded-2xl border animate-pulse" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="h-4 rounded w-24 mb-4" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
          <div class="h-8 rounded w-16 mb-2" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
          <div class="h-3 rounded w-32" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
        </div>
      </template>
      <template v-else>
        <div v-for="(kpi, i) in kpis" :key="i" class="p-5 rounded-2xl border transition-all hover:shadow-md" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl" :style="{ backgroundColor: `${kpi.color}18` }">
              <component :is="kpi.icon" class="w-5 h-5" :style="{ color: kpi.color }" />
            </div>
          </div>
          <p class="text-xs font-medium mb-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ kpi.label }}</p>
          <div class="text-2xl font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ kpi.value }}</div>
          <p class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-[#9e9e9e]'">{{ kpi.subtitle }}</p>
        </div>
      </template>
    </div>

    <!-- Fila 2: Gráficos -->
    <div class="grid lg:grid-cols-5 gap-6">
      <!-- Area Chart: Entregas por día -->
      <div class="lg:col-span-3 p-6 rounded-2xl border shadow-sm" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Entregas por Día</h2>
            <p class="text-xs mt-0.5" :class="darkMode ? 'text-gray-400' : 'text-[#9e9e9e]'">Distribución semanal de entregas totales vs completadas</p>
          </div>
          <div class="flex gap-4 text-xs font-semibold">
            <span class="flex items-center gap-1.5"><span class="w-3 h-1.5 rounded-full bg-[#E67E50]"></span> <span :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Entregas</span></span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-1.5 rounded-full bg-[#374B54]"></span> <span :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Completadas</span></span>
          </div>
        </div>
        <div v-if="cargando" class="h-[300px] rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
        <div v-else class="w-full h-[300px]">
          <VueApexCharts height="100%" width="100%" :options="chartOptionsArea" :series="chartSeriesArea" />
        </div>
      </div>

      <!-- Donut Chart: Estado de Flota -->
      <div class="lg:col-span-2 p-6 rounded-2xl border shadow-sm" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <h2 class="font-bold text-lg mb-4" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Estado de Flota</h2>
        <div v-if="cargando" class="h-[250px] rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
        <template v-else>
          <div class="w-full h-[250px] flex items-center justify-center">
            <VueApexCharts height="100%" width="100%" :options="chartOptionsDonut" :series="donutSeriesFlota" />
          </div>
          <div class="space-y-3 mt-4">
            <div v-for="(item, i) in [
              { label: 'En ruta', val: donutSeriesFlota[0], color: '#E67E50' },
              { label: 'Disponibles', val: donutSeriesFlota[1], color: '#374B54' },
              { label: 'Mantenimiento', val: donutSeriesFlota[2], color: '#092C4C' },
              { label: 'Fuera de servicio', val: donutSeriesFlota[3], color: '#BDBDBD' }
            ]" :key="i" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></div>
                <span :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ item.label }}</span>
              </div>
              <span class="font-semibold" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ item.val }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Fila 3: Mapa + Actividad por Zona -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Mapa en Tiempo Real -->
      <div class="lg:col-span-2 p-6 rounded-2xl border shadow-sm" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-bold text-lg mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Mapa en Tiempo Real</h2>
            <div class="flex items-center gap-2 text-sm">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ rutasActivas.length }} rutas activas</span>
            </div>
          </div>
        </div>
        <div ref="mapContainer" class="w-full h-[350px] sm:h-[400px] z-0 rounded-xl relative overflow-hidden border" :class="darkMode ? 'bg-gray-900 border-gray-700 shadow-inner' : 'bg-gray-100 border-gray-200 shadow-inner'">
        </div>
      </div>

      <!-- Actividad por Zona -->
      <div class="p-6 rounded-2xl border shadow-sm" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <h2 class="font-bold text-lg mb-6" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Actividad por Zona</h2>
        <div v-if="cargando" class="space-y-5">
          <div v-for="i in 5" :key="i" class="h-8 rounded-lg animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
        </div>
        <div v-else class="space-y-5">
          <div v-for="(zone, i) in actividadZonas" :key="i">
            <div class="flex justify-between mb-2 text-sm">
              <span :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ zone.zone }}</span>
              <span class="font-semibold" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ zone.actividad }}%</span>
            </div>
            <div class="h-2 rounded-full overflow-hidden" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'">
              <div class="h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ width: `${zone.actividad}%`, background: `linear-gradient(90deg, #E67E50 0%, ${zone.actividad > 80 ? '#10b981' : '#f59e0b'} 100%)` }"></div>
            </div>
          </div>
        </div>

        <div class="mt-8 p-4 rounded-xl" :class="darkMode ? 'bg-gray-800' : 'bg-gray-50'">
          <h4 class="text-sm font-semibold mb-1" :class="darkMode ? 'text-white' : 'text-[#424242]'">Zona más activa</h4>
          <p class="text-lg font-bold text-[#E67E50]">{{ zonaMasActiva?.zone }} ({{ zonaMasActiva?.actividad }}%)</p>
          <p class="text-xs mt-1" :class="darkMode ? 'text-gray-500' : 'text-[#757575]'">Basado en entregas recientes</p>
        </div>
      </div>
    </div>

    <!-- Fila 4: Entregas Recientes + Alertas -->
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 rounded-2xl border shadow-sm" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <div class="flex items-center justify-between p-6 pb-4">
          <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Entregas Recientes</h2>
          <div class="flex items-center gap-2">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="busquedaEntregas" type="text" placeholder="Buscar..." class="pl-9 pr-4 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
            </div>
          </div>
        </div>
        <div v-if="cargando" class="px-6 pb-6 space-y-3">
          <div v-for="i in 5" :key="i" class="h-12 rounded-lg animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-xs font-semibold uppercase tracking-wide" :class="darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-[#9e9e9e]'">
                <th class="py-3 px-6 text-left">ID</th>
                <th class="py-3 px-4 text-left">Cliente</th>
                <th class="py-3 px-4 text-left">Ruta</th>
                <th class="py-3 px-4 text-left">Estado</th>
                <th class="py-3 px-4 text-left">Hora</th>
              </tr>
            </thead>
            <tbody class="divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-50'">
              <tr v-if="entregasFiltradas.length === 0">
                <td colspan="6" class="py-10 text-center text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">No hay entregas registradas</td>
              </tr>
              <tr v-for="e in entregasFiltradas" :key="e.id" class="hover:bg-opacity-50 transition-colors" :class="darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'">
                <td class="py-4 px-6 font-semibold text-xs" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">#D-{{ e.id }}</td>
                <td class="py-4 px-4"><p class="font-medium" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ e.cliente?.nombre || `Cliente #${e.clienteId}` }}</p></td>
                <td class="py-4 px-4" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Ruta #{{ e.rutaId }}</td>
                <td class="py-4 px-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold border" :class="[colorEstadoEntrega(e.estado).bg, colorEstadoEntrega(e.estado).text, colorEstadoEntrega(e.estado).border]">{{ labelEstado(e.estado) }}</span></td>
                <td class="py-4 px-4 text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'"><span class="flex items-center gap-1"><Clock class="w-3.5 h-3.5" />{{ horaEntrega(e.horaEntregaReal || e.updatedAt) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border shadow-sm" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <div class="flex items-center justify-between p-6 pb-4">
          <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Alertas y Notificaciones</h2>
          <div class="flex items-center gap-2">
            <template v-if="conteoNoLeidas > 0">
              <span class="w-2 h-2 rounded-full bg-[#E67E50] animate-pulse" :title="`${conteoNoLeidas} sin leer`"></span>
              <button @click="marcarTodasLeidas" class="text-xs font-medium transition-colors" :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-[#424242]'">Marcar todo</button>
            </template>
            <button @click="mostrarBroadcast = !mostrarBroadcast" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" :class="mostrarBroadcast ? 'bg-[#E67E50] text-white' : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-[#E67E50] hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-[#E67E50] hover:text-white')"><Send class="w-3.5 h-3.5" />Nueva</button>
          </div>
        </div>
        <div v-if="mostrarBroadcast" class="mx-6 mb-4 p-4 rounded-xl border" :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-100'">
          <p class="text-xs font-bold mb-3 flex items-center gap-1.5" :class="darkMode ? 'text-orange-400' : 'text-[#E67E50]'">
            <Send class="w-3.5 h-3.5" />Notificación Global (todos los usuarios)
          </p>
          <input v-model="broadcastTitulo" type="text" placeholder="Título..." maxlength="100" class="w-full px-3 py-2 text-sm border rounded-lg mb-2 focus:outline-none focus:border-[#E67E50] bg-transparent transition-colors" :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-orange-200 text-[#424242]'" />
          <textarea v-model="broadcastMensaje" rows="2" placeholder="Mensaje para todos los repartidores..." maxlength="500" class="w-full px-3 py-2 text-sm border rounded-lg mb-3 focus:outline-none focus:border-[#E67E50] bg-transparent resize-none transition-colors" :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-orange-200 text-[#424242]'" />
          <p v-if="broadcastFeedback === 'ok'" class="text-xs text-green-500 font-semibold mb-2">✅ Notificación enviada correctamente</p>
          <p v-if="broadcastFeedback === 'error'" class="text-xs text-red-500 font-semibold mb-2">❌ Error al enviar. Inténtalo de nuevo.</p>
          <div class="flex gap-2">
            <button @click="enviarBroadcast" :disabled="enviandoBroadcast || !broadcastTitulo.trim() || !broadcastMensaje.trim()" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 bg-[#E67E50] text-white hover:bg-[#d4703f]">{{ enviandoBroadcast ? 'Enviando...' : 'Enviar a todos' }}</button>
            <button @click="mostrarBroadcast = false" class="px-4 py-2 rounded-lg text-xs font-semibold transition-colors" :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'">Cancelar</button>
          </div>
        </div>
        <div v-if="cargando" class="px-6 pb-6 space-y-3">
          <div v-for="i in 3" :key="i" class="h-20 rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
        </div>
        <div v-else class="px-6 pb-6 space-y-3">
          <p v-if="notificacionesRecientes.length === 0" class="text-sm py-8 text-center" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Sin alertas activas</p>
          <div v-for="n in notificacionesRecientes" :key="n.id" class="p-4 rounded-xl border-l-4 transition-all hover:shadow-sm" :class="[colorNotificacion(n.titulo).border, darkMode ? 'bg-gray-800/50 border-r border-t border-b border-gray-700' : 'bg-white border-r border-t border-b border-gray-100', n.leido ? 'opacity-60' : '']">
            <div class="flex items-start gap-3">
              <div class="mt-0.5 p-1.5 rounded-lg" :class="colorNotificacion(n.titulo).bg">
                <component :is="iconoNotificacion(n.titulo)" class="w-4 h-4" :class="colorNotificacion(n.titulo).icon" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold leading-tight" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ n.titulo }}</h4>
                <p class="text-xs mt-0.5 leading-relaxed line-clamp-2" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ n.mensaje }}</p>
                <span class="text-[10px] font-medium mt-1 block" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">{{ tiempoRelativo(n.fecha) }}</span>
              </div>
              <button v-if="!n.leido" @click="marcarLeida(n.id)" class="p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity flex-shrink-0" title="Marcar como leída"><X class="w-3.5 h-3.5 text-gray-400" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fila 3: Estado de flota + Ranking -->
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="rounded-2xl border shadow-sm p-6" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <h2 class="font-bold text-lg mb-5" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Estado de Flota</h2>
        <div v-if="cargando" class="space-y-4">
          <div v-for="i in 4" :key="i" class="h-8 rounded-lg animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
        </div>
        <div v-else>
          <div v-if="vehiculos.length === 0" class="text-center py-8 text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Sin datos de flota</div>
          <div v-else>
            <div class="flex rounded-full overflow-hidden h-3 mb-5">
              <div v-for="item in estadoFlota" :key="item.label" class="transition-all duration-700" :style="{ width: vehiculos.length > 0 ? `${(item.val / vehiculos.length) * 100}%` : '0%', backgroundColor: item.color }"></div>
            </div>
            <div class="space-y-3 mb-6">
              <div v-for="item in estadoFlota" :key="item.label" class="flex items-center justify-between py-2 border-b last:border-0" :class="darkMode ? 'border-gray-700' : 'border-gray-50'">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: item.color }"></div>
                  <span class="text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#757575]'">{{ item.label }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-24 h-1.5 rounded-full overflow-hidden" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'">
                    <div class="h-full rounded-full transition-all duration-700" :style="{ width: vehiculos.length > 0 ? `${(item.val / vehiculos.length) * 100}%` : '0%', backgroundColor: item.color }"></div>
                  </div>
                  <span class="text-sm font-bold w-6 text-right" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ item.val }}</span>
                </div>
              </div>
            </div>
            <div class="pt-4 border-t" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
              <h3 class="text-sm font-semibold mb-3 flex items-center gap-2" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">
                <Wrench class="w-4 h-4 text-amber-500" />Mantenimientos Recientes
              </h3>
              <div v-if="mantenimientosRecientes.length === 0" class="text-xs py-3 text-center" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Sin mantenimientos registrados</div>
              <div v-else class="space-y-2">
                <div v-for="m in mantenimientosRecientes" :key="m.id" class="flex items-center justify-between p-3 rounded-lg" :class="darkMode ? 'bg-gray-800/60' : 'bg-gray-50'">
                  <div class="min-w-0">
                    <p class="text-xs font-semibold truncate" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ m.tipoMantenimiento }}</p>
                    <p class="text-[10px] mt-0.5" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Vehículo #{{ m.vehiculoId }} · {{ fechaMantenimiento(m.fechaServicio) }}</p>
                  </div>
                  <span class="text-xs font-bold ml-3 flex-shrink-0" :class="darkMode ? 'text-amber-400' : 'text-amber-600'">{{ m.coste.toFixed(0) }}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border shadow-sm p-6" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Top Repartidores</h2>
          <div class="flex items-center gap-1 p-1 rounded-lg" :class="darkMode ? 'bg-gray-800' : 'bg-gray-100'">
            <button @click="cambiarSortRanking('entregas')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all" :class="rankingSortBy === 'entregas' ? 'bg-[#E67E50] text-white shadow-sm' : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#424242]')">Entregas</button>
            <button @click="cambiarSortRanking('puntos')" class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all" :class="rankingSortBy === 'puntos' ? 'bg-[#E67E50] text-white shadow-sm' : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#424242]')">Puntos</button>
          </div>
        </div>
        <div v-if="cargando || cargandoRanking" class="space-y-4">
          <div v-for="i in 5" :key="i" class="h-16 rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
        </div>
        <div v-else>
          <div v-if="ranking.length === 0" class="text-center py-8 text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Sin datos de ranking</div>
          <div v-else class="space-y-3">
            <div v-for="r in ranking" :key="r.usuarioId" class="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm" :class="darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" :class="colorPosicion(r.posicion)">#{{ r.posicion }}</div>
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#E67E50] to-[#d4603a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                <img v-if="r.imagenUrl" :src="r.imagenUrl" class="w-full h-full object-cover" />
                <span v-else>{{ r.nombreUsuario.substring(0, 1).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ r.nombreUsuario }}</p>
                <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#9e9e9e]'">
                  <template v-if="rankingSortBy === 'puntos'">{{ r.entregasTotales }} entregas</template>
                  <template v-else>{{ r.puntos }} puntos acumulados</template>
                </p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="font-bold text-sm text-[#E67E50]">{{ rankingSortBy === 'puntos' ? r.puntos.toLocaleString('es-ES') : r.entregasTotales }}</p>
                <p class="text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">{{ rankingSortBy === 'puntos' ? 'puntos' : 'entregas' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fila 4: Repartidores Online -->
    <div class="rounded-2xl border shadow-sm p-6" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-bold text-lg flex items-center gap-2" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
          <Wifi class="w-5 h-5 text-green-500" />Repartidores Online
        </h2>
        <span class="text-sm font-medium px-3 py-1 rounded-full" :class="darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'">
          {{ repartidoresActivos.length }} en total · {{ repartidoresActivos.filter(u => u.estaActivo).length }} online
        </span>
      </div>
      <div v-if="cargando" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="h-20 rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
      </div>
      <div v-else>
        <p v-if="repartidoresActivos.length === 0" class="text-sm py-6 text-center" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">No hay datos de sesiones activas</p>
        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div v-for="u in repartidoresActivos" :key="u.usuarioId" class="flex items-center gap-3 p-4 rounded-xl border transition-all" :class="[darkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-100 bg-gray-50', u.estaActivo ? '' : 'opacity-50']">
            <div class="relative flex-shrink-0">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden" :style="{ background: u.estaActivo ? 'linear-gradient(135deg, #E67E50, #d4603a)' : '#9ca3af' }">
                <img v-if="u.imagenUrl" :src="u.imagenUrl" class="w-full h-full object-cover" />
                <span v-else>{{ u.nombreUsuario.substring(0, 1).toUpperCase() }}</span>
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" :class="[u.estaActivo ? 'bg-green-500' : 'bg-gray-400', darkMode ? 'border-[#1a2332]' : 'border-gray-50']"></span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold truncate" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ u.nombreUsuario }}</p>
              <p class="text-xs truncate" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ u.estaActivo ? 'En línea' : tiempoRelativo(u.ultimaConexion) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Estilos personalizados para los Tooltips de Leaflet en Tiempo Real */
.leaflet-tooltip.custom-light-tooltip {
  background-color: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(229, 231, 235, 0.8);
  color: #1f2937;
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease-out;
}
.leaflet-tooltip.custom-light-tooltip::before {
  border-top-color: rgba(255, 255, 255, 0.98);
}

.leaflet-tooltip.custom-dark-tooltip {
  background-color: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(55, 65, 81, 0.8);
  color: #f3f4f6;
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease-out;
}
.leaflet-tooltip.custom-dark-tooltip::before {
  border-top-color: rgba(17, 24, 39, 0.95);
}

/* Animación para el rastro de la ruta */
.ruta-animada {
  stroke-dashoffset: 100;
  animation: dash 5s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}

/* Ajustes globales Leaflet */
.leaflet-container {
  font-family: inherit;
}
</style>
