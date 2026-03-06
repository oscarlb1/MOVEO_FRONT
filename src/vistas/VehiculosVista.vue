<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSesionStore } from '@/tiendas/sesion'
import {
  Truck, CheckCircle2, Navigation, Wrench, Search, FileText, FileSpreadsheet,
  Plus, Package, Fuel, Gauge, Clock, Pencil, Trash2, AlertCircle, X, RefreshCw
} from 'lucide-vue-next'
import vehiculosServicio from '@/servicios/vehiculosServicio'
import mantenimientosServicio from '@/servicios/mantenimientosServicio'
import exportadorServicio from '@/servicios/exportadorServicio'
import type { CreateVehiculoDto, UpdateVehiculoDto } from '@/servicios/vehiculosServicio'
import type { VehiculoItem, MantenimientoItem, CrearMantenimientoDto, ActualizarMantenimientoDto } from '@/modelos/Dashboard'

const props = defineProps<{
  darkMode: boolean
}>()

const sesionStore = useSesionStore()
const esAdmin = computed(() => sesionStore.usuario?.rol === 'ADMIN')

const cargando = ref(true)
const vehiculos = ref<VehiculoItem[]>([])
const busquedaVehiculos = ref('')
const filtroEstadoVehiculo = ref('')
const vehiculoModalAbierto = ref(false)
const vehiculoEditando = ref<VehiculoItem | null>(null)
const vehiculoEliminandoId = ref<number | null>(null)
const guardandoVehiculo = ref(false)
const eliminandoVehiculo = ref(false)
const feedbackVehiculo = ref<'ok' | 'error' | null>(null)
const feedbackMensaje = ref('')

const formularioVehiculo = ref<CreateVehiculoDto>({
  matricula: '', marcaModelo: '', estado: 'DISPONIBLE', capacidadCarga: 0,
  consumoMedio: 0, kilometrajeActual: 0, fechaUltimaRevision: null,
})

const vehiculoMantenimientoSeleccionado = ref<VehiculoItem | null>(null)
const mantenimientosListaActual = ref<MantenimientoItem[]>([])
const cargandoMantenimientos = ref(false)
const modalMantenimientosAbierto = ref(false)
const mostrarFormMantenimiento = ref(false)
const formMantenimiento = ref<CrearMantenimientoDto>({
  vehiculoId: 0, fechaServicio: new Date().toISOString().split('T')[0] || '',
  tipoMantenimiento: '', kilometrajeServicio: 0, coste: 0
})
const mantenimientoEditando = ref<MantenimientoItem | null>(null)
const guardandoMantenimiento = ref(false)

const vehiculosFiltrados = computed(() => {
  let lista = vehiculos.value
  if (filtroEstadoVehiculo.value) {
    lista = lista.filter(v => v.estado === filtroEstadoVehiculo.value)
  }
  const q = busquedaVehiculos.value.toLowerCase().trim()
  if (!q) return lista
  return lista.filter(v => v.matricula.toLowerCase().includes(q) || v.marcaModelo.toLowerCase().includes(q))
})

const kpisVehiculos = computed(() => {
  const total = vehiculos.value.length
  const disponibles = vehiculos.value.filter(v => v.estado === 'DISPONIBLE').length
  const enRuta = vehiculos.value.filter(v => v.estado === 'EN_RUTA').length
  const mantenimientoV = vehiculos.value.filter(v => v.estado === 'EN_MANTENIMIENTO').length
  return [
    { icon: Truck, label: 'Total Flota', value: total.toString(), subtitle: 'vehículos registrados', color: '#E67E50' },
    { icon: CheckCircle2, label: 'Disponibles', value: disponibles.toString(), subtitle: 'listos para asignar', color: '#22c55e' },
    { icon: Navigation, label: 'En Ruta', value: enRuta.toString(), subtitle: 'activos ahora', color: '#3b82f6' },
    { icon: Wrench, label: 'Mantenimiento', value: mantenimientoV.toString(), subtitle: 'fuera de servicio', color: '#f59e0b' },
  ]
})

function badgeVehiculo(estado: string) {
  if (estado === 'DISPONIBLE') return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500' }
  if (estado === 'EN_RUTA') return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' }
  if (estado === 'EN_MANTENIMIENTO') return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' }
  return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' }
}

function labelEstadoVehiculo(estado: string) {
  const m: Record<string, string> = { DISPONIBLE: 'Disponible', EN_RUTA: 'En Ruta', EN_MANTENIMIENTO: 'Mantenimiento', FUERA_DE_SERVICIO: 'Fuera de servicio' }
  return m[estado] ?? estado
}

function fechaRevision(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function abrirModalCrear() {
  vehiculoEditando.value = null
  formularioVehiculo.value = { matricula: '', marcaModelo: '', estado: 'DISPONIBLE', capacidadCarga: 0, consumoMedio: 0, kilometrajeActual: 0, fechaUltimaRevision: null }
  feedbackVehiculo.value = null
  vehiculoModalAbierto.value = true
}

function abrirModalEditar(v: VehiculoItem) {
  vehiculoEditando.value = v
  formularioVehiculo.value = {
    matricula: v.matricula, marcaModelo: v.marcaModelo, estado: v.estado, capacidadCarga: v.capacidadCarga, consumoMedio: v.consumoMedio, kilometrajeActual: v.kilometrajeActual,
    fechaUltimaRevision: (v.fechaUltimaRevision ?? null) ? new Date(v.fechaUltimaRevision!).toISOString().split('T')[0] ?? null : null,
  }
  feedbackVehiculo.value = null
  vehiculoModalAbierto.value = true
}

async function guardarVehiculo() {
  if (!formularioVehiculo.value.matricula.trim() || !formularioVehiculo.value.marcaModelo.trim()) return
  guardandoVehiculo.value = true
  feedbackVehiculo.value = null
  try {
    if (vehiculoEditando.value) {
      const actualizado = await vehiculosServicio.actualizar(vehiculoEditando.value.id, formularioVehiculo.value as UpdateVehiculoDto)
      const idx = vehiculos.value.findIndex(v => v.id === vehiculoEditando.value!.id)
      if (idx !== -1) vehiculos.value[idx] = actualizado
    } else {
      const nuevo = await vehiculosServicio.crear(formularioVehiculo.value)
      vehiculos.value.push(nuevo)
    }
    feedbackVehiculo.value = 'ok'
    feedbackMensaje.value = vehiculoEditando.value ? 'Vehículo actualizado' : 'Vehículo creado'
    setTimeout(() => { vehiculoModalAbierto.value = false }, 1200)
  } catch {
    feedbackVehiculo.value = 'error'
    feedbackMensaje.value = 'Error al guardar el vehículo'
  } finally {
    guardandoVehiculo.value = false
  }
}

async function confirmarEliminar(id: number) {
  eliminandoVehiculo.value = true
  try {
    await vehiculosServicio.eliminar(id)
    vehiculos.value = vehiculos.value.filter(v => v.id !== id)
    vehiculoEliminandoId.value = null
  } catch {} finally {
    eliminandoVehiculo.value = false
  }
}

async function abrirModalMantenimientos(v: VehiculoItem) {
  vehiculoMantenimientoSeleccionado.value = v
  modalMantenimientosAbierto.value = true
  mostrarFormMantenimiento.value = false
  cargandoMantenimientos.value = true
  mantenimientosListaActual.value = []
  try {
    mantenimientosListaActual.value = await mantenimientosServicio.obtenerPorVehiculo(v.id)
  } catch {} finally {
    cargandoMantenimientos.value = false
  }
}

function abrirFormularioMantenimiento(editar?: MantenimientoItem) {
  if (editar) {
    mantenimientoEditando.value = editar
    formMantenimiento.value = {
      vehiculoId: editar.vehiculoId, fechaServicio: new Date(editar.fechaServicio).toISOString().split('T')[0] || '',
      tipoMantenimiento: editar.tipoMantenimiento || '', kilometrajeServicio: editar.kilometrajeServicio || 0, coste: editar.coste || 0
    }
  } else {
    mantenimientoEditando.value = null
    formMantenimiento.value = {
      vehiculoId: vehiculoMantenimientoSeleccionado.value!.id, fechaServicio: new Date().toISOString().split('T')[0] || '',
      tipoMantenimiento: '', kilometrajeServicio: vehiculoMantenimientoSeleccionado.value!.kilometrajeActual || 0, coste: 0
    }
  }
  mostrarFormMantenimiento.value = true
}

async function guardarMantenimiento() {
  if (!formMantenimiento.value.tipoMantenimiento.trim() || !formMantenimiento.value.coste) return
  guardandoMantenimiento.value = true
  try {
    if (mantenimientoEditando.value) {
      await mantenimientosServicio.actualizar(mantenimientoEditando.value.id, formMantenimiento.value as ActualizarMantenimientoDto)
      if (vehiculoMantenimientoSeleccionado.value) {
          mantenimientosListaActual.value = await mantenimientosServicio.obtenerPorVehiculo(vehiculoMantenimientoSeleccionado.value.id)
      }
    } else {
      const nuevo = await mantenimientosServicio.crear(formMantenimiento.value)
      mantenimientosListaActual.value.push(nuevo)
    }
    mostrarFormMantenimiento.value = false
  } catch {} finally {
    guardandoMantenimiento.value = false
  }
}

async function eliminarMantenimiento(id: number) {
  if (confirm("¿Seguro que quieres borrar este registro?")) {
    try {
      await mantenimientosServicio.eliminar(id)
      mantenimientosListaActual.value = mantenimientosListaActual.value.filter(m => m.id !== id)
    } catch {}
  }
}

function exportarVehiculosPDF() {
  const columnas = ['Matrícula', 'Marca/Modelo', 'Estado', 'Capacidad', 'Consumo (L/100km)', 'Kilometraje', 'Última Revisión']
  const data = vehiculosFiltrados.value.map(v => [
    v.matricula, v.marcaModelo, v.estado, v.capacidadCarga, v.consumoMedio, v.kilometrajeActual,
    v.fechaUltimaRevision ? new Date(v.fechaUltimaRevision).toLocaleDateString() : '-'
  ])
  exportadorServicio.exportarPDF('Reporte de Vehículos', columnas, data, 'Vehiculos_Reporte')
}

function exportarVehiculosExcel() {
  const data = vehiculosFiltrados.value.map(v => ({
    Matricula: v.matricula, MarcaModelo: v.marcaModelo, Estado: v.estado, Capacidad: v.capacidadCarga,
    Consumo: v.consumoMedio, Kilometraje: v.kilometrajeActual, UltimaRevision: v.fechaUltimaRevision ? new Date(v.fechaUltimaRevision).toLocaleDateString() : '-'
  }))
  exportadorServicio.exportarExcel('Vehiculos', data, 'Vehiculos_Reporte')
}

onMounted(async () => {
  cargando.value = true
  try {
    const data = await vehiculosServicio.obtenerTodos()
    vehiculos.value = data
  } catch {} finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="cargando">
        <div v-for="i in 4" :key="i" class="p-5 rounded-2xl border animate-pulse bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#E67E50]/50">
          <div class="h-4 rounded w-24 mb-4 bg-gray-100 dark:bg-[#374B54]"></div>
          <div class="h-8 rounded w-16 mb-2 bg-gray-100 dark:bg-[#374B54]"></div>
          <div class="h-3 rounded w-32 bg-gray-100 dark:bg-[#374B54]"></div>
        </div>
      </template>
      <template v-else>
        <div v-for="(kpi, i) in kpisVehiculos" :key="i" class="p-5 rounded-2xl border transition-all hover:shadow-md bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#E67E50] shadow-sm">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2.5 rounded-xl" :style="{ backgroundColor: `${kpi.color}18` }">
              <component :is="kpi.icon" class="w-5 h-5" :style="{ color: kpi.color }" />
            </div>
          </div>
          <p class="text-xs font-medium mb-1 text-[#757575] dark:text-[#82A1B1]">{{ kpi.label }}</p>
          <div class="text-2xl font-bold mb-1 text-[#092C4C] dark:text-white">{{ kpi.value }}</div>
          <p class="text-xs text-[#9e9e9e] dark:text-gray-500">{{ kpi.subtitle }}</p>
        </div>
      </template>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#82A1B1]" />
        <input v-model="busquedaVehiculos" type="text" placeholder="Buscar por matrícula o modelo..." class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm" />
      </div>
      <select v-model="filtroEstadoVehiculo" class="py-2.5 px-3 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors shadow-sm bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white cursor-pointer">
        <option value="">Todos los estados</option>
        <option value="DISPONIBLE">Disponible</option>
        <option value="EN_RUTA">En Ruta</option>
        <option value="EN_MANTENIMIENTO">Mantenimiento</option>
        <option value="FUERA_DE_SERVICIO">Fuera de servicio</option>
      </select>
      <button @click="exportarVehiculosPDF" class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm bg-gray-100 dark:bg-[#16181A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#374B54]" title="Exportar Vehículos PDF">
        <FileText class="w-4 h-4 text-red-500" /> <span class="hidden sm:inline">PDF</span>
      </button>
      <button @click="exportarVehiculosExcel" class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm bg-gray-100 dark:bg-[#16181A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#374B54]" title="Exportar Vehículos Excel">
        <FileSpreadsheet class="w-4 h-4 text-green-600" /> <span class="hidden sm:inline">Excel</span>
      </button>
      <button v-if="esAdmin" @click="abrirModalCrear" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors shadow-sm">
        <Plus class="w-4 h-4" />Nuevo Vehículo
      </button>
    </div>

    <div class="rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
      <div v-if="cargando" class="p-6 space-y-3">
        <div v-for="i in 5" :key="i" class="h-16 rounded-xl animate-pulse bg-gray-50 dark:bg-[#16181A]"></div>
      </div>
      <div v-else-if="vehiculosFiltrados.length === 0" class="py-20 text-center">
        <Truck class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-[#82A1B1]" />
        <p class="text-sm text-gray-400 dark:text-gray-500">No hay vehículos que coincidan</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-xs font-semibold uppercase tracking-wide bg-gray-50 dark:bg-[#16181A] border-gray-100 dark:border-[#374B54] text-[#9e9e9e] dark:text-[#82A1B1]">
              <th class="py-4 px-6 text-left">Matrícula</th>
              <th class="py-4 px-6 text-left">Marca / Modelo</th>
              <th class="py-4 px-6 text-left">Estado</th>
              <th class="py-4 px-6 text-left">Capacidad</th>
              <th class="py-4 px-6 text-left">Consumo</th>
              <th class="py-4 px-6 text-left">Kilometraje</th>
              <th class="py-4 px-6 text-left">Última Revisión</th>
              <th v-if="esAdmin" class="py-4 px-6 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-[#374B54]">
            <tr v-for="v in vehiculosFiltrados" :key="v.id" class="transition-colors group hover:bg-gray-50 dark:hover:bg-[#16181A]/50">
              <td class="py-4 px-6">
                <span class="font-bold tracking-wider text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-[#16181A] text-[#424242] dark:text-gray-200">
                  {{ v.matricula }}
                </span>
              </td>
              <td class="py-4 px-6"><p class="font-semibold text-[#092C4C] dark:text-white">{{ v.marcaModelo }}</p></td>
              <td class="py-4 px-6">
                <span class="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold border" :class="[badgeVehiculo(v.estado).bg, badgeVehiculo(v.estado).text, badgeVehiculo(v.estado).border]">
                  <span class="w-1.5 h-1.5 rounded-full" :class="badgeVehiculo(v.estado).dot"></span>
                  {{ labelEstadoVehiculo(v.estado) }}
                </span>
              </td>
              <td class="py-4 px-6"><span class="flex items-center gap-1 text-sm text-[#757575] dark:text-[#82A1B1]"><Package class="w-3.5 h-3.5 flex-shrink-0" />{{ v.capacidadCarga }} kg</span></td>
              <td class="py-4 px-6"><span class="flex items-center gap-1 text-sm text-[#757575] dark:text-[#82A1B1]"><Fuel class="w-3.5 h-3.5 flex-shrink-0" />{{ v.consumoMedio }} L/100</span></td>
              <td class="py-4 px-6"><span class="flex items-center gap-1 text-sm text-[#757575] dark:text-[#82A1B1]"><Gauge class="w-3.5 h-3.5 flex-shrink-0" />{{ v.kilometrajeActual.toLocaleString('es-ES') }} km</span></td>
              <td class="py-4 px-6"><span class="flex items-center gap-1 text-sm text-[#757575] dark:text-[#82A1B1]"><Clock class="w-3.5 h-3.5 flex-shrink-0" />{{ fechaRevision(v.fechaUltimaRevision) }}</span></td>
              <td v-if="esAdmin" class="py-4 px-6">
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="abrirModalEditar(v)" class="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400" title="Editar"><Pencil class="w-4 h-4" /></button>
                  <button @click="abrirModalMantenimientos(v)" class="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400" title="Mantenimientos"><Wrench class="w-4 h-4" /></button>
                  <button @click="vehiculoEliminandoId = v.id" class="p-1.5 rounded-lg transition-colors text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400" title="Eliminar"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!cargando && vehiculosFiltrados.length > 0" class="px-6 py-3 border-t text-xs border-gray-100 dark:border-[#374B54] text-gray-400 dark:text-gray-500">
        Mostrando {{ vehiculosFiltrados.length }} de {{ vehiculos.length }} vehículos
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="vehiculoModalAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="vehiculoModalAbierto = false">
        <div class="w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
          <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#374B54] bg-[#f8fafc] dark:bg-[#16181A]">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/30"><Truck class="w-5 h-5 text-[#E67E50]" /></div>
              <h3 class="text-lg font-bold text-[#092C4C] dark:text-white">{{ vehiculoEditando ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</h3>
            </div>
            <button @click="vehiculoModalAbierto = false" class="p-1.5 rounded-lg transition-colors text-gray-500 dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50"><X class="w-5 h-5" /></button>
          </div>
          <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Matrícula *</label>
                <input v-model="formularioVehiculo.matricula" type="text" placeholder="ej: 1234 ABC" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 uppercase" />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Marca / Modelo *</label>
                <input v-model="formularioVehiculo.marcaModelo" type="text" placeholder="ej: Renault Kangoo" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Estado</label>
              <select v-model="formularioVehiculo.estado" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white">
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="EN_MANTENIMIENTO">Mantenimiento</option>
                <option value="FUERA_DE_SERVICIO">Fuera de servicio</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Capacidad de carga (kg)</label>
                <input v-model.number="formularioVehiculo.capacidadCarga" type="number" min="0" step="0.1" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white" />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Consumo medio (L/100km)</label>
                <input v-model.number="formularioVehiculo.consumoMedio" type="number" min="0" step="0.1" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Kilometraje actual (km)</label>
                <input v-model.number="formularioVehiculo.kilometrajeActual" type="number" min="0" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white" />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Última revisión</label>
                <input v-model="formularioVehiculo.fechaUltimaRevision" type="date" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white" />
              </div>
            </div>
            <p v-if="feedbackVehiculo === 'ok'" class="flex items-center gap-1.5 text-xs text-green-500 font-semibold"><CheckCircle2 class="w-4 h-4" /> {{ feedbackMensaje }}</p>
            <p v-if="feedbackVehiculo === 'error'" class="flex items-center gap-1.5 text-xs text-red-500 font-semibold"><AlertCircle class="w-4 h-4" /> {{ feedbackMensaje }}</p>
          </div>
          <div class="px-6 py-4 flex gap-3 border-t border-gray-100 dark:border-[#374B54] bg-gray-50 dark:bg-[#16181A]">
            <button @click="guardarVehiculo" :disabled="guardandoVehiculo || !formularioVehiculo.matricula.trim() || !formularioVehiculo.marcaModelo.trim()" class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-all disabled:opacity-50">
              {{ guardandoVehiculo ? 'Guardando...' : (vehiculoEditando ? 'Guardar Cambios' : 'Crear Vehículo') }}
            </button>
            <button @click="vehiculoModalAbierto = false" class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors border-gray-200 dark:border-[#374B54] text-gray-600 dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50">Cancelar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="vehiculoEliminandoId !== null" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="vehiculoEliminandoId = null">
        <div class="w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
          <div class="px-6 py-6 text-center">
            <div class="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"><Trash2 class="w-7 h-7 text-red-500 dark:text-red-400" /></div>
            <h3 class="font-bold text-lg mb-2 text-[#092C4C] dark:text-white">¿Eliminar vehículo?</h3>
            <p class="text-sm mb-6 text-gray-500 dark:text-[#82A1B1]">Esta acción no se puede deshacer. El vehículo será eliminado permanentemente del sistema.</p>
            <div class="flex gap-3">
              <button @click="confirmarEliminar(vehiculoEliminandoId!)" :disabled="eliminandoVehiculo" class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">{{ eliminandoVehiculo ? 'Eliminando...' : 'Sí, eliminar' }}</button>
              <button @click="vehiculoEliminandoId = null" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-gray-100 dark:bg-[#16181A] text-gray-600 dark:text-[#82A1B1] hover:bg-gray-200 dark:hover:bg-[#374B54]">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modalMantenimientosAbierto && vehiculoMantenimientoSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="modalMantenimientosAbierto = false">
        <div class="w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
          <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#374B54] bg-[#f8fafc] dark:bg-[#16181A]">
            <h2 class="font-bold text-xl flex items-center gap-2 text-[#092C4C] dark:text-white">
              <Wrench class="w-5 h-5 text-[#E67E50]" />Mantenimientos: {{ vehiculoMantenimientoSeleccionado.matricula }}
            </h2>
            <button @click="modalMantenimientosAbierto = false" class="p-1.5 rounded-lg transition-colors text-gray-500 dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50"><X class="w-5 h-5" /></button>
          </div>
          <div class="flex-1 overflow-auto p-6 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-lg text-gray-700 dark:text-gray-200">Historial</h3>
              <button v-if="esAdmin && !mostrarFormMantenimiento" @click="abrirFormularioMantenimiento()" class="px-4 py-2 rounded-xl text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors flex items-center gap-2"><Plus class="w-4 h-4" /> Registrar</button>
            </div>
            
            <div v-if="cargandoMantenimientos" class="text-center py-10">
              <RefreshCw class="w-8 h-8 mx-auto animate-spin text-gray-400 mb-2" />
              <p class="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
            </div>
            
            <div v-else-if="mantenimientosListaActual.length === 0" class="text-center py-10 border rounded-xl border-gray-100 dark:border-[#374B54]">
              <p class="text-sm text-gray-400 dark:text-gray-500">No hay mantenimientos registrados</p>
            </div>
            
            <div v-else class="overflow-x-auto rounded-xl border border-gray-50 dark:border-[#374B54] bg-gray-50/50 dark:bg-[#16181A]">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-[#374B54] text-gray-500 dark:text-[#82A1B1]">
                    <th class="py-3 px-4 text-left font-semibold">Fecha</th>
                    <th class="py-3 px-4 text-left font-semibold">Tipo</th>
                    <th class="py-3 px-4 text-left font-semibold">Kilometraje</th>
                    <th class="py-3 px-4 text-left font-semibold">Coste</th>
                    <th v-if="esAdmin" class="py-3 px-4 text-left font-semibold w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-[#374B54]">
                  <tr v-for="m in mantenimientosListaActual" :key="m.id" class="hover:bg-white dark:hover:bg-[#272A30] transition-colors">
                    <td class="py-3 px-4 text-gray-700 dark:text-gray-300">{{ new Date(m.fechaServicio).toLocaleDateString() }}</td>
                    <td class="py-3 px-4 font-medium text-gray-800 dark:text-white">{{ m.tipoMantenimiento }}</td>
                    <td class="py-3 px-4 text-gray-600 dark:text-[#82A1B1]">{{ m.kilometrajeServicio.toLocaleString() }} km</td>
                    <td class="py-3 px-4 text-gray-700 dark:text-gray-300">{{ m.coste.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</td>
                    <td v-if="esAdmin" class="py-3 px-4">
                      <div class="flex items-center gap-1">
                        <button @click="abrirFormularioMantenimiento(m)" class="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"><Pencil class="w-3.5 h-3.5"/></button>
                        <button @click="eliminarMantenimiento(m.id)" class="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"><Trash2 class="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="mostrarFormMantenimiento && esAdmin" class="mt-8 border-t pt-6 border-gray-200 dark:border-[#374B54]">
              <h4 class="font-bold mb-4 text-[#092C4C] dark:text-white">{{ mantenimientoEditando ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento' }}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-400">Tipo *</label>
                  <input v-model="formMantenimiento.tipoMantenimiento" type="text" placeholder="Ej: Cambio de aceite" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-black dark:text-white" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-400">Fecha *</label>
                  <input v-model="formMantenimiento.fechaServicio" type="date" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-black dark:text-white" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-400">Kilometraje (Opcional)</label>
                  <input v-model.number="formMantenimiento.kilometrajeServicio" type="number" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-black dark:text-white" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-400">Coste (€) *</label>
                  <input v-model.number="formMantenimiento.coste" type="number" step="0.01" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-black dark:text-white" />
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button @click="mostrarFormMantenimiento = false" class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-200 dark:border-[#374B54] text-gray-600 dark:text-[#82A1B1] hover:bg-gray-50 dark:hover:bg-[#374B54]/50">Cancelar</button>
                <button @click="guardarMantenimiento" :disabled="guardandoMantenimiento || !formMantenimiento.tipoMantenimiento.trim() || !formMantenimiento.coste" class="px-4 py-2 rounded-lg text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors disabled:opacity-50 flex items-center gap-2">
                  <RefreshCw v-if="guardandoMantenimiento" class="w-4 h-4 animate-spin" />
                  {{ mantenimientoEditando ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>