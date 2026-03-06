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
    { icon: Truck, label: 'Total Flota', value: total.toString(), subtitle: 'vehículos registrados', color: '#092C4C' },
    { icon: CheckCircle2, label: 'Disponibles', value: disponibles.toString(), subtitle: 'listos para asignar', color: '#22c55e' },
    { icon: Navigation, label: 'En Ruta', value: enRuta.toString(), subtitle: 'activos ahora', color: '#E67E50' },
    { icon: Wrench, label: 'Mantenimiento', value: mantenimientoV.toString(), subtitle: 'fuera de servicio', color: '#f59e0b' },
  ]
})

function badgeVehiculo(estado: string) {
  if (estado === 'DISPONIBLE') return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' }
  if (estado === 'EN_RUTA') return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' }
  if (estado === 'EN_MANTENIMIENTO') return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' }
  return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' }
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
    <!-- KPIs Flota -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="cargando">
        <div v-for="i in 4" :key="i" class="p-5 rounded-2xl border animate-pulse" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="h-4 rounded w-24 mb-4" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
          <div class="h-8 rounded w-16 mb-2" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
          <div class="h-3 rounded w-32" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
        </div>
      </template>
      <template v-else>
        <div v-for="(kpi, i) in kpisVehiculos" :key="i" class="p-5 rounded-2xl border transition-all hover:shadow-md" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'">
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

    <!-- Barra de herramientas -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="busquedaVehiculos" type="text" placeholder="Buscar por matrícula o modelo..." class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
      </div>
      <select v-model="filtroEstadoVehiculo" class="py-2.5 px-3 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-700 text-gray-300 bg-[#1a2332]' : 'border-gray-200 text-[#424242] bg-white'">
        <option value="">Todos los estados</option>
        <option value="DISPONIBLE">Disponible</option>
        <option value="EN_RUTA">En Ruta</option>
        <option value="EN_MANTENIMIENTO">Mantenimiento</option>
        <option value="FUERA_DE_SERVICIO">Fuera de servicio</option>
      </select>
      <button @click="exportarVehiculosPDF" class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shadow-sm" :class="darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : ''" title="Exportar Vehículos PDF"><FileText class="w-4 h-4 text-red-500" /> <span class="hidden sm:inline">PDF</span></button>
      <button @click="exportarVehiculosExcel" class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shadow-sm" :class="darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : ''" title="Exportar Vehículos Excel"><FileSpreadsheet class="w-4 h-4 text-green-600" /> <span class="hidden sm:inline">Excel</span></button>
      <button v-if="esAdmin" @click="abrirModalCrear" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors shadow-sm"><Plus class="w-4 h-4" />Nuevo Vehículo</button>
    </div>

    <!-- Tabla -->
    <div class="rounded-2xl border shadow-sm overflow-hidden" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
      <div v-if="cargando" class="p-6 space-y-3">
        <div v-for="i in 5" :key="i" class="h-14 rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
      </div>
      <div v-else-if="vehiculosFiltrados.length === 0" class="py-20 text-center">
        <Truck class="w-12 h-12 mx-auto mb-3" :class="darkMode ? 'text-gray-600' : 'text-gray-300'" />
        <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">No hay vehículos que coincidan</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-xs font-semibold uppercase tracking-wide" :class="darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-[#9e9e9e]'">
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
          <tbody class="divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-50'">
            <tr v-for="v in vehiculosFiltrados" :key="v.id" class="transition-colors" :class="darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'">
              <td class="py-4 px-6"><span class="font-bold tracking-wider text-xs px-2.5 py-1.5 rounded-lg" :class="darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-[#424242]'">{{ v.matricula }}</span></td>
              <td class="py-4 px-6"><p class="font-semibold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ v.marcaModelo }}</p></td>
              <td class="py-4 px-6"><span class="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold border" :class="[badgeVehiculo(v.estado).bg, badgeVehiculo(v.estado).text, badgeVehiculo(v.estado).border]"><span class="w-1.5 h-1.5 rounded-full" :class="badgeVehiculo(v.estado).dot"></span>{{ labelEstadoVehiculo(v.estado) }}</span></td>
              <td class="py-4 px-6"><span class="flex items-center gap-1 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#757575]'"><Package class="w-3.5 h-3.5 flex-shrink-0" />{{ v.capacidadCarga }} kg</span></td>
              <td class="py-4 px-6"><span class="flex items-center gap-1 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#757575]'"><Fuel class="w-3.5 h-3.5 flex-shrink-0" />{{ v.consumoMedio }} L/100</span></td>
              <td class="py-4 px-6"><span class="flex items-center gap-1 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#757575]'"><Gauge class="w-3.5 h-3.5 flex-shrink-0" />{{ v.kilometrajeActual.toLocaleString('es-ES') }} km</span></td>
              <td class="py-4 px-6"><span class="flex items-center gap-1 text-sm" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'"><Clock class="w-3.5 h-3.5 flex-shrink-0" />{{ fechaRevision(v.fechaUltimaRevision) }}</span></td>
              <td v-if="esAdmin" class="py-4 px-6">
                <div class="flex items-center gap-2">
                  <button @click="abrirModalEditar(v)" class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'" title="Editar"><Pencil class="w-4 h-4" /></button>
                  <button @click="abrirModalMantenimientos(v)" class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-green-400' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'" title="Mantenimientos"><Wrench class="w-4 h-4" /></button>
                  <button @click="vehiculoEliminandoId = v.id" class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'" title="Eliminar"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!cargando && vehiculosFiltrados.length > 0" class="px-6 py-3 border-t text-xs" :class="darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'">
        Mostrando {{ vehiculosFiltrados.length }} de {{ vehiculos.length }} vehículos
      </div>
    </div>
  </div>

  <!-- Modales Vehículo -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="vehiculoModalAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="vehiculoModalAbierto = false">
        <div class="w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden" :class="darkMode ? 'bg-[#111827] border-gray-700' : 'bg-white border-gray-200'">
          <div class="flex items-center justify-between px-6 py-5 border-b" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl" :class="darkMode ? 'bg-orange-900/30' : 'bg-orange-50'"><Truck class="w-5 h-5 text-[#E67E50]" /></div>
              <h3 class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ vehiculoEditando ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</h3>
            </div>
            <button @click="vehiculoModalAbierto = false" class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"><X class="w-5 h-5" /></button>
          </div>
          <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="vehiculo-matricula" class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Matrícula *</label>
                <input id="vehiculo-matricula" v-model="formularioVehiculo.matricula" type="text" placeholder="ej: 1234 ABC" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent uppercase" :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
              </div>
              <div>
                <label for="vehiculo-modelo" class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Marca / Modelo *</label>
                <input id="vehiculo-modelo" v-model="formularioVehiculo.marcaModelo" type="text" placeholder="ej: Renault Kangoo" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
              </div>
            </div>
            <div>
              <label for="vehiculo-estado" class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Estado</label>
              <select id="vehiculo-estado" v-model="formularioVehiculo.estado" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-white bg-[#111827]' : 'border-gray-200 text-[#424242] bg-white'">
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="EN_MANTENIMIENTO">Mantenimiento</option>
                <option value="FUERA_DE_SERVICIO">Fuera de servicio</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="vehiculo-capacidad" class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Capacidad de carga (kg)</label>
                <input id="vehiculo-capacidad" v-model.number="formularioVehiculo.capacidadCarga" type="number" min="0" step="0.1" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-[#424242]'" />
              </div>
              <div>
                <label for="vehiculo-consumo" class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Consumo medio (L/100km)</label>
                <input id="vehiculo-consumo" v-model.number="formularioVehiculo.consumoMedio" type="number" min="0" step="0.1" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-[#424242]'" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="vehiculo-kilometraje" class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Kilometraje actual (km)</label>
                <input id="vehiculo-kilometraje" v-model.number="formularioVehiculo.kilometrajeActual" type="number" min="0" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-[#424242]'" />
              </div>
              <div>
                <label for="vehiculo-revision" class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Última revisión</label>
                <input id="vehiculo-revision" v-model="formularioVehiculo.fechaUltimaRevision" type="date" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-gray-300 bg-[#111827]' : 'border-gray-200 text-[#424242]'" />
              </div>
            </div>
            <p v-if="feedbackVehiculo === 'ok'" class="flex items-center gap-1.5 text-xs text-green-500 font-semibold"><CheckCircle2 class="w-4 h-4" /> {{ feedbackMensaje }}</p>
            <p v-if="feedbackVehiculo === 'error'" class="flex items-center gap-1.5 text-xs text-red-500 font-semibold"><AlertCircle class="w-4 h-4" /> {{ feedbackMensaje }}</p>
          </div>
          <div class="px-6 py-4 flex gap-3 border-t" :class="darkMode ? 'border-gray-700 bg-[#0d1422]' : 'border-gray-100 bg-gray-50'">
            <button id="modal-save-button" @click="guardarVehiculo" :disabled="guardandoVehiculo || !formularioVehiculo.matricula.trim() || !formularioVehiculo.marcaModelo.trim()" class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 bg-[#E67E50] text-white hover:bg-[#d4703f]">{{ guardandoVehiculo ? 'Guardando...' : (vehiculoEditando ? 'Guardar Cambios' : 'Crear Vehículo') }}</button>
            <button id="modal-cancel-button" @click="vehiculoModalAbierto = false" class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors" :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'">Cancelar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="vehiculoEliminandoId !== null" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="vehiculoEliminandoId = null">
        <div class="w-full max-w-sm rounded-2xl shadow-2xl border p-6" :class="darkMode ? 'bg-[#111827] border-gray-700' : 'bg-white border-gray-200'">
          <div class="flex flex-col items-center text-center gap-4">
            <div class="w-14 h-14 rounded-full flex items-center justify-center bg-red-50"><Trash2 class="w-7 h-7 text-red-500" /></div>
            <div>
              <h3 class="text-lg font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">¿Eliminar vehículo?</h3>
              <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Esta acción no se puede deshacer. El vehículo será eliminado permanentemente del sistema.</p>
            </div>
            <div class="flex gap-3 w-full">
              <button id="confirm-delete-button" @click="confirmarEliminar(vehiculoEliminandoId!)" :disabled="eliminandoVehiculo" class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">{{ eliminandoVehiculo ? 'Eliminando...' : 'Sí, eliminar' }}</button>
              <button @click="vehiculoEliminandoId = null" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors" :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal Mantenimientos -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modalMantenimientosAbierto && vehiculoMantenimientoSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="modalMantenimientosAbierto = false">
        <div class="w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="flex items-center justify-between px-6 py-5 border-b shrink-0" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
            <div>
              <h2 class="font-bold text-xl flex items-center gap-2" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                <Wrench class="w-5 h-5 text-[#E67E50]" />Mantenimientos: {{ vehiculoMantenimientoSeleccionado.matricula }}
              </h2>
            </div>
            <button @click="modalMantenimientosAbierto = false" class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"><X class="w-5 h-5" /></button>
          </div>
          <div class="flex-1 overflow-auto p-6 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-lg" :class="darkMode ? 'text-gray-200' : 'text-gray-700'">Historial</h3>
              <button v-if="esAdmin && !mostrarFormMantenimiento" @click="abrirFormularioMantenimiento()" class="px-4 py-2 rounded-xl text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors flex items-center gap-2"><Plus class="w-4 h-4" /> Registrar</button>
            </div>
            <div v-if="cargandoMantenimientos" class="text-center py-10">
              <RefreshCw class="w-8 h-8 mx-auto animate-spin text-gray-400 mb-2" />
              <p class="text-sm text-gray-500">Cargando...</p>
            </div>
            <div v-else-if="mantenimientosListaActual.length === 0" class="text-center py-10 border rounded-xl" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
              <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">No hay mantenimientos registrados</p>
            </div>
            <div v-else class="overflow-x-auto rounded-xl border" :class="darkMode ? 'border-gray-700 bg-[#161d2b]' : 'border-gray-50 bg-gray-50/50'">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b" :class="darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'">
                    <th class="py-3 px-4 text-left font-semibold">Fecha</th>
                    <th class="py-3 px-4 text-left font-semibold">Tipo</th>
                    <th class="py-3 px-4 text-left font-semibold">Kilometraje</th>
                    <th class="py-3 px-4 text-left font-semibold">Coste</th>
                    <th v-if="esAdmin" class="py-3 px-4 text-left font-semibold w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-100'">
                  <tr v-for="m in mantenimientosListaActual" :key="m.id" :class="darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'">
                    <td class="py-3 px-4" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">{{ new Date(m.fechaServicio).toLocaleDateString() }}</td>
                    <td class="py-3 px-4 font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">{{ m.tipoMantenimiento }}</td>
                    <td class="py-3 px-4" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">{{ m.kilometrajeServicio.toLocaleString() }} km</td>
                    <td class="py-3 px-4" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">{{ m.coste.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</td>
                    <td v-if="esAdmin" class="py-3 px-4">
                      <div class="flex items-center gap-1">
                        <button @click="abrirFormularioMantenimiento(m)" class="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors" :class="darkMode ? 'hover:bg-gray-700' : ''"><Pencil class="w-3.5 h-3.5"/></button>
                        <button @click="eliminarMantenimiento(m.id)" class="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors" :class="darkMode ? 'hover:bg-gray-700' : ''"><Trash2 class="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="mostrarFormMantenimiento && esAdmin" class="mt-8 border-t pt-6" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
              <h4 class="font-bold mb-4" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ mantenimientoEditando ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento' }}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Tipo *</label>
                  <input v-model="formMantenimiento.tipoMantenimiento" type="text" placeholder="Ej: Cambio de aceite" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors" :class="darkMode ? 'border-gray-600 bg-[#1a2332] text-white' : 'border-gray-200 bg-white'" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Fecha *</label>
                  <input v-model="formMantenimiento.fechaServicio" type="date" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors" :class="darkMode ? 'border-gray-600 bg-[#1a2332] text-white' : 'border-gray-200 bg-white'" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Kilometraje (Opcional)</label>
                  <input v-model="formMantenimiento.kilometrajeServicio" type="number" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors" :class="darkMode ? 'border-gray-600 bg-[#1a2332] text-white' : 'border-gray-200 bg-white'" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Coste (€) *</label>
                  <input v-model="formMantenimiento.coste" type="number" step="0.01" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors" :class="darkMode ? 'border-gray-600 bg-[#1a2332] text-white' : 'border-gray-200 bg-white'" />
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button @click="mostrarFormMantenimiento = false" class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors border" :class="darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">Cancelar</button>
                <button @click="guardarMantenimiento" :disabled="guardandoMantenimiento || !formMantenimiento.tipoMantenimiento.trim() || !formMantenimiento.coste" class="px-4 py-2 rounded-lg text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors disabled:opacity-50 flex items-center gap-2"><RefreshCw v-if="guardandoMantenimiento" class="w-4 h-4 animate-spin" />{{ mantenimientoEditando ? 'Actualizar' : 'Guardar' }}</button>
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
