<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Users, Search, Plus, Pencil, Trash2, Building2, MapPin, Phone,
  CheckCircle2, AlertCircle, RefreshCw, FileText, FileSpreadsheet
} from 'lucide-vue-next'
import clientesServicio from '@/servicios/clientesServicio'
import type { ClienteDto, CrearClienteDto, ActualizarClienteDto } from '@/modelos/Ruta'
import exportadorServicio from '@/servicios/exportadorServicio'

const props = defineProps<{
  darkMode: boolean
}>()

const clientes = ref<ClienteDto[]>([])
const cargando = ref(true)
const busqueda = ref('')

// Modales y formularios
const modalAbierto = ref(false)
const clienteEditando = ref<ClienteDto | null>(null)
const eliminandoId = ref<number | null>(null)
const guardando = ref(false)
const feedback = ref<'ok' | 'error' | null>(null)
const feedbackMensaje = ref('')

const formulario = ref<CrearClienteDto>({
  nombreEmpresa: '',
  direccion: '',
  telefono: '',
  latitud: null,
  longitud: null
})

// Cargar datos
async function cargarDatos() {
  cargando.value = true
  try {
    clientes.value = await clientesServicio.obtenerTodos()
  } catch (error) {
    console.error('Error al cargar clientes', error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDatos()
})

// Computados
const clientesFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  if (!q) return clientes.value
  return clientes.value.filter(c =>
    c.nombreEmpresa.toLowerCase().includes(q) ||
    c.direccion.toLowerCase().includes(q) ||
    (c.telefono && c.telefono.toLowerCase().includes(q))
  )
})

const kpis = computed(() => {
  const total = clientes.value.length
  const conTelefono = clientes.value.filter(c => c.telefono).length
  const geolocalizados = clientes.value.filter(c => c.latitud !== null && c.longitud !== null).length
  return [
    { icon: Building2, label: 'Total Clientes', value: total.toString(), subtitle: 'empresas registradas', color: '#092C4C' },
    { icon: Phone, label: 'Con Teléfono', value: conTelefono.toString(), subtitle: 'contacto directo', color: '#10b981' },
    { icon: MapPin, label: 'Geolocalizados', value: geolocalizados.toString(), subtitle: 'listos para entrega', color: '#3b82f6' }
  ]
})

function inferirComunidad(dir: string): string {
  const d = dir.toLowerCase()
  if (d.includes('madrid')) return 'Com. de Madrid'
  if (d.includes('barcelona') || d.includes('girona') || d.includes('lleida') || d.includes('tarragona') || d.includes('cataluña') || d.includes('catalunya')) return 'Cataluña'
  if (d.includes('valencia') || d.includes('alicante') || d.includes('castellón') || d.includes('castellon')) return 'Com. Valenciana'
  if (d.includes('sevilla') || d.includes('málaga') || d.includes('malaga') || d.includes('granada') || d.includes('córdoba') || d.includes('cordoba') || d.includes('andalucía') || d.includes('andalucia') || d.includes('cadiz') || d.includes('huelva') || d.includes('almería') || d.includes('almeria') || d.includes('jaen')) return 'Andalucía'
  if (d.includes('zaragoza') || d.includes('huesca') || d.includes('teruel') || d.includes('aragón')) return 'Aragón'
  if (d.includes('murcia')) return 'Región de Murcia'
  if (d.includes('galicia') || d.includes('coruña') || d.includes('lugo') || d.includes('ourense') || d.includes('pontevedra')) return 'Galicia'
  if (d.includes('país vasco') || d.includes('pais vasco') || d.includes('bilbao') || d.includes('vizcaya') || d.includes('alava') || d.includes('guipuzcoa') || d.includes('vitoria') || d.includes('san sebastian')) return 'País Vasco'
  return 'Otras'
}

const chartSeries = computed(() => {
  const counts: Record<string, number> = {}
  clientes.value.forEach(c => {
    const com = inferirComunidad(c.direccion)
    counts[com] = (counts[com] || 0) + 1
  })
  
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1])
  
  return [{
    name: 'Clientes',
    data: sorted.map(i => i[1])
  }]
})

const chartOptions = computed(() => {
  const counts: Record<string, number> = {}
  clientes.value.forEach(c => {
    const com = inferirComunidad(c.direccion)
    counts[com] = (counts[com] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1])

  return {
    chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
    theme: { mode: props.darkMode ? 'dark' : 'light' },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
        dataLabels: { position: 'bottom' }
      }
    },
    xaxis: {
      categories: sorted.map(i => i[0]),
      labels: { style: { colors: props.darkMode ? '#9ca3af' : '#6b7280' } }
    },
    yaxis: {
      labels: { style: { colors: props.darkMode ? '#9ca3af' : '#6b7280', fontWeight: 600 } }
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#64748b'],
    dataLabels: { 
      enabled: true,
      style: { colors: ['#fff'] }
    },
    grid: { show: false },
    legend: { show: false }
  }
})

// Acciones
function abrirModalCrear() {
  clienteEditando.value = null
  formulario.value = { nombreEmpresa: '', direccion: '', telefono: '', latitud: null, longitud: null }
  feedback.value = null
  modalAbierto.value = true
}

function abrirModalEditar(c: ClienteDto) {
  clienteEditando.value = c
  formulario.value = {
    nombreEmpresa: c.nombreEmpresa,
    direccion: c.direccion,
    telefono: c.telefono,
    latitud: c.latitud,
    longitud: c.longitud
  }
  feedback.value = null
  modalAbierto.value = true
}

async function guardarCliente() {
  if (!formulario.value.nombreEmpresa.trim() || !formulario.value.direccion.trim()) return

  guardando.value = true
  feedback.value = null
  try {
    if (clienteEditando.value) {
      await clientesServicio.actualizar(clienteEditando.value.id, formulario.value)
      const idx = clientes.value.findIndex(c => c.id === clienteEditando.value!.id)
      if (idx !== -1) {
        const c = clientes.value[idx];
        if (c) {
          c.nombreEmpresa = formulario.value.nombreEmpresa
          c.direccion = formulario.value.direccion
          c.telefono = formulario.value.telefono
          c.latitud = formulario.value.latitud ?? null
          c.longitud = formulario.value.longitud ?? null
        }
      }
      feedbackMensaje.value = 'Cliente actualizado'
    } else {
      const nuevo = await clientesServicio.crear(formulario.value)
      clientes.value.push(nuevo)
      feedbackMensaje.value = 'Cliente creado'
    }
    feedback.value = 'ok'
    setTimeout(() => { modalAbierto.value = false }, 1200)
  } catch {
    feedback.value = 'error'
    feedbackMensaje.value = 'Error al guardar el cliente'
  } finally {
    guardando.value = false
  }
}

async function confirmarEliminar(id: number) {
  eliminandoId.value = id
  try {
    await clientesServicio.eliminar(id)
    clientes.value = clientes.value.filter(c => c.id !== id)
  } catch {
    // Manejar error silencioso
  } finally {
    eliminandoId.value = null
  }
}

function exportarPDF() {
  const columnas = ['Nombre Empresa', 'Dirección', 'Teléfono']
  const data = clientesFiltrados.value.map(c => [c.nombreEmpresa, c.direccion, c.telefono])
  exportadorServicio.exportarPDF('Reporte de Clientes', columnas, data, 'Clientes_Reporte')
}

function exportarExcel() {
  const data = clientesFiltrados.value.map(c => ({
    NombreEmpresa: c.nombreEmpresa,
    Direccion: c.direccion,
    Telefono: c.telefono
  }))
  exportadorServicio.exportarExcel('Clientes', data, 'Clientes_Reporte')
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Encabezado y Acciones -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
         <h2 class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Gestión de Clientes</h2>
         <p class="text-sm mt-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
           Administra el directorio de clientes y sus ubicaciones
         </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Exportar -->
        <button @click="exportarPDF" class="px-4 py-2 border rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700 text-white hover:bg-gray-800' : 'bg-white border-gray-200 text-[#424242] hover:bg-gray-50'"
          title="Exportar Clientes PDF">
           <FileText class="w-4 h-4 text-red-500" /> PDF
        </button>
        <button @click="exportarExcel" class="px-4 py-2 border rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700 text-white hover:bg-gray-800' : 'bg-white border-gray-200 text-[#424242] hover:bg-gray-50'"
          title="Exportar Clientes Excel">
           <FileSpreadsheet class="w-4 h-4 text-green-600" /> Excel
        </button>
        <button @click="abrirModalCrear" class="px-4 py-2 bg-[#E67E50] hover:bg-[#d4603a] text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
          <Plus class="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid sm:grid-cols-3 gap-4">
      <div v-for="(kpi, i) in kpis" :key="i"
        class="p-5 rounded-2xl border transition-all hover:shadow-md"
        :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'">
        <div class="flex items-start justify-between mb-3">
          <div class="p-2.5 rounded-xl" :style="{ backgroundColor: `${kpi.color}18` }">
            <component :is="kpi.icon" class="w-5 h-5" :style="{ color: kpi.color }" />
          </div>
        </div>
        <p class="text-xs font-medium mb-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ kpi.label }}</p>
        <div class="text-2xl font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ kpi.value }}</div>
        <p class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-[#9e9e9e]'">{{ kpi.subtitle }}</p>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Gráfico Horizontal ancho completo -->
      <div class="border rounded-2xl p-5 shadow-sm transition-colors"
        :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <h3 class="font-bold text-sm mb-4 w-full" :class="darkMode ? 'text-gray-300' : 'text-[#092C4C]'">Distribución por Comunidad Autónoma</h3>
        <apexchart v-if="clientes.length > 0" type="bar" height="280" width="100%" :options="chartOptions" :series="chartSeries"></apexchart>
        <p v-if="clientes.length === 0" class="text-sm text-gray-500 text-center py-10">Sin datos</p>
      </div>

      <!-- Tabla de Clientes -->
      <div class="rounded-2xl border shadow-sm overflow-hidden" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
      <!-- Toolbar tabla -->
      <div class="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
        <div class="flex items-center gap-2">
          <div class="relative w-full sm:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="busqueda" type="text" placeholder="Buscar empresa o teléfono..."
              class="w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
              :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
          </div>
        </div>
        <button @click="cargarDatos" class="p-2 border rounded-xl transition-colors hover:bg-opacity-80"
          :class="darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': cargando }" />
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead :class="darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-[#757575]'">
            <tr>
              <th class="px-6 py-4 font-medium">Empresa</th>
              <th class="px-6 py-4 font-medium w-96">Dirección</th>
              <th class="px-6 py-4 font-medium">Teléfono</th>
              <th class="px-6 py-4 font-medium text-right w-24">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-100'">
            <tr v-if="cargando">
               <td colspan="4" class="px-6 py-8 text-center text-gray-500">Cargando clientes...</td>
            </tr>
            <tr v-else-if="clientesFiltrados.length === 0">
               <td colspan="4" class="px-6 py-8 text-center text-gray-500">No se encontraron clientes.</td>
            </tr>
            <tr v-for="c in clientesFiltrados" :key="c.id" class="transition-colors hover:bg-opacity-50" :class="darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner bg-gradient-to-br from-[#092C4C] to-[#374B54]">
                    {{ c.nombreEmpresa.substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium" :class="darkMode ? 'text-gray-200' : 'text-[#424242]'">
                      {{ c.nombreEmpresa }}
                    </p>
                    <p class="text-xs mt-0.5 text-gray-500">ID: CL-{{ String(c.id).padStart(4, '0') }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                  <MapPin class="w-4 h-4 text-gray-400 opacity-70" />
                  <span class="truncate max-w-[250px]">{{ c.direccion }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                  <Phone class="w-4 h-4 text-gray-400 opacity-70" />
                  <span>{{ c.telefono || 'Sin teléfono' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="abrirModalEditar(c)" class="p-2 rounded-lg transition-colors border hover:bg-opacity-80"
                    :class="darkMode ? 'bg-[#1a2332] border-gray-700 text-blue-400 hover:bg-gray-800' : 'bg-white border-gray-200 text-blue-600 hover:bg-blue-50'" title="Editar cliente">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmarEliminar(c.id)" :disabled="eliminandoId === c.id" class="p-2 rounded-lg transition-colors border hover:bg-opacity-80 disabled:opacity-50"
                    :class="darkMode ? 'bg-[#1a2332] border-gray-700 text-red-400 hover:bg-gray-800' : 'bg-white border-gray-200 text-red-600 hover:bg-red-50'" title="Eliminar cliente">
                    <RefreshCw v-if="eliminandoId === c.id" class="w-4 h-4 animate-spin" />
                    <Trash2 v-else class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </div>

  <!-- Modal Crear / Editar -->
  <div v-if="modalAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div class="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden" :class="darkMode ? 'bg-[#1a2332] border border-gray-700' : 'bg-white'">
      <div class="p-6 border-b" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
        <h3 class="text-xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
          {{ clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente' }}
        </h3>
        <p class="text-sm mt-1" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
          Completa los datos de la empresa cliente.
        </p>
      </div>

      <div class="p-6 space-y-4">
        <!-- Feedback -->
        <div v-if="feedback" class="p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2"
          :class="feedback === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
          <CheckCircle2 v-if="feedback === 'ok'" class="w-5 h-5" />
          <AlertCircle v-else class="w-5 h-5" />
          {{ feedbackMensaje }}
        </div>

        <div class="space-y-4" :class="{'opacity-50 pointer-events-none': guardando}">
          <div class="space-y-1.5">
            <label class="text-sm font-medium" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Nombre de Empresa *</label>
            <input v-model="formulario.nombreEmpresa" type="text"
              class="w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E67E50]/20 focus:border-[#E67E50] transition-all bg-transparent"
              :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-gray-900'"
              placeholder="Ej. Distribuciones Sur S.L." />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Teléfono de Contacto</label>
            <input v-model="formulario.telefono" type="text"
              class="w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E67E50]/20 focus:border-[#E67E50] transition-all bg-transparent"
              :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-gray-900'"
              placeholder="Ej. +34 600..." />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Dirección Completa *</label>
            <input v-model="formulario.direccion" type="text"
              class="w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E67E50]/20 focus:border-[#E67E50] transition-all bg-transparent"
              :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-gray-900'"
              placeholder="Ej. Calle Principal 123, Madrid" />
          </div>
        </div>
      </div>

      <div class="p-6 border-t bg-opacity-50 flex items-center justify-end gap-3"
        :class="darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-50 bg-gray-50'">
        <button @click="modalAbierto = false" :disabled="guardando"
          class="px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          :class="darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'">
          Cancelar
        </button>
        <button @click="guardarCliente" :disabled="guardando"
          class="px-5 py-2.5 bg-[#E67E50] hover:bg-[#d4603a] text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70">
          <RefreshCw v-if="guardando" class="w-4 h-4 animate-spin" />
          {{ guardando ? 'Guardando...' : 'Guardar Cliente' }}
        </button>
      </div>
    </div>
  </div>
</template>
