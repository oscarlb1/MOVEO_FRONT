<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Users, Search, Plus, Pencil, Trash2, Building2, MapPin, Phone,
  CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-vue-next'
import clientesServicio from '@/servicios/clientesServicio'
import type { ClienteDto, CrearClienteDto, ActualizarClienteDto } from '@/modelos/Ruta'
import exportadorServicio from '@/servicios/exportadorServicio'

// Prop darkMode eliminada: Tailwind se encarga con la clase .dark

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
  return [
    { icon: Building2, label: 'Total Clientes', value: total.toString(), subtitle: 'empresas registradas', color: '#E67E50' } // Ajustado al naranja de marca
  ]
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
      // Intentar geocodificación antes de crear
      const coords = await obtenerCoordenadas(formulario.value.direccion)
      if (coords) {
        formulario.value.latitud = coords.lat
        formulario.value.longitud = coords.lon
      }

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
// Geocodificación con Nominatim
async function obtenerCoordenadas(direccion: string) {
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1`)
    const data = await resp.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      }
    }
  } catch (error) {
    console.error('Error en geocodificación:', error)
  }
  return null
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
         <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white transition-colors duration-300">Gestión de Clientes</h2>
         <p class="text-sm mt-1 text-[#757575] dark:text-[#82A1B1] transition-colors duration-300">
           Administra el directorio de clientes y sus ubicaciones
         </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative group">
          <button class="px-4 py-2 border rounded-xl font-medium text-sm transition-colors flex items-center gap-2 bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white hover:bg-gray-50 dark:hover:bg-[#374B54]">
             Exportar
          </button>
          <div class="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
            <button @click="exportarPDF" class="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-[#374B54] text-gray-700 dark:text-gray-200">
              Descargar PDF
            </button>
            <button @click="exportarExcel" class="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-[#374B54] text-gray-700 dark:text-gray-200">
              Descargar Excel
            </button>
          </div>
        </div>
        <button @click="abrirModalCrear" class="px-4 py-2 bg-[#E67E50] hover:bg-[#d4603a] text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
          <Plus class="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="(kpi, i) in kpis" :key="i"
        class="p-5 rounded-2xl border transition-all hover:shadow-md bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54] shadow-sm">
        <div class="flex items-start justify-between mb-3">
          <div class="p-2.5 rounded-xl bg-[#E67E50]/10">
            <component :is="kpi.icon" class="w-5 h-5 text-[#E67E50]" />
          </div>
        </div>
        <p class="text-xs font-medium mb-1 text-[#757575] dark:text-[#82A1B1]">{{ kpi.label }}</p>
        <div class="text-2xl font-bold mb-1 text-[#092C4C] dark:text-white">{{ kpi.value }}</div>
        <p class="text-xs text-[#9e9e9e] dark:text-gray-500">{{ kpi.subtitle }}</p>
      </div>
    </div>

    <div class="rounded-2xl border shadow-sm bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54] overflow-hidden transition-colors duration-300">
      <div class="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-gray-100 dark:border-[#374B54]">
        <div class="flex items-center gap-2">
          <div class="relative w-full sm:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#82A1B1]" />
            <input v-model="busqueda" type="text" placeholder="Buscar empresa o teléfono..."
              class="w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-transparent border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-500" />
          </div>
        </div>
        <button @click="cargarDatos" class="p-2 border rounded-xl transition-colors hover:bg-opacity-80 border-gray-200 dark:border-[#374B54] text-gray-600 dark:text-[#82A1B1] hover:bg-gray-50 dark:hover:bg-[#374B54]">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': cargando }" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead class="bg-gray-50 dark:bg-[#16181A] text-[#757575] dark:text-[#82A1B1]">
            <tr>
              <th class="px-6 py-4 font-medium">Empresa</th>
              <th class="px-6 py-4 font-medium w-96">Dirección</th>
              <th class="px-6 py-4 font-medium">Teléfono</th>
              <th class="px-6 py-4 font-medium text-right w-24">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-[#374B54]">
            <tr v-if="cargando">
               <td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-[#82A1B1]">Cargando clientes...</td>
            </tr>
            <tr v-else-if="clientesFiltrados.length === 0">
               <td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-[#82A1B1]">No se encontraron clientes.</td>
            </tr>
            <tr v-for="c in clientesFiltrados" :key="c.id" class="transition-colors hover:bg-gray-50 dark:hover:bg-[#16181A]/50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner bg-gradient-to-br from-[#E67E50] to-[#374B54]">
                    {{ c.nombreEmpresa.substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-[#424242] dark:text-gray-200">
                      {{ c.nombreEmpresa }}
                    </p>
                    <p class="text-xs mt-0.5 text-gray-500 dark:text-[#82A1B1]">ID: CL-{{ String(c.id).padStart(4, '0') }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin class="w-4 h-4 text-gray-400 dark:text-[#82A1B1] opacity-70" />
                  <span class="truncate max-w-[250px]">{{ c.direccion }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Phone class="w-4 h-4 text-gray-400 dark:text-[#82A1B1] opacity-70" />
                  <span>{{ c.telefono || 'Sin teléfono' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="abrirModalEditar(c)" class="p-2 rounded-lg transition-colors border hover:bg-opacity-80 bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#374B54]" title="Editar cliente">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmarEliminar(c.id)" :disabled="eliminandoId === c.id" class="p-2 rounded-lg transition-colors border hover:bg-opacity-80 disabled:opacity-50 bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-[#374B54]" title="Eliminar cliente">
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

  <div v-if="modalAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div class="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-[#272A30] border border-transparent dark:border-[#374B54] transition-colors duration-300">
      <div class="p-6 border-b border-gray-100 dark:border-[#374B54]">
        <h3 class="text-xl font-bold text-[#092C4C] dark:text-white">
          {{ clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente' }}
        </h3>
        <p class="text-sm mt-1 text-gray-500 dark:text-[#82A1B1]">
          Completa los datos de la empresa cliente.
        </p>
      </div>

      <div class="p-6 space-y-4">
        <div v-if="feedback" class="p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2"
          :class="feedback === 'ok' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'">
          <CheckCircle2 v-if="feedback === 'ok'" class="w-5 h-5" />
          <AlertCircle v-else class="w-5 h-5" />
          {{ feedbackMensaje }}
        </div>

        <div class="space-y-4" :class="{'opacity-50 pointer-events-none': guardando}">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de Empresa *</label>
            <input v-model="formulario.nombreEmpresa" type="text"
              class="w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E67E50]/20 focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-all bg-transparent border-gray-200 dark:border-[#374B54] text-gray-900 dark:text-white placeholder-gray-500"
              placeholder="Ej. Distribuciones Sur S.L." />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono de Contacto</label>
            <input v-model="formulario.telefono" type="text"
              class="w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E67E50]/20 focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-all bg-transparent border-gray-200 dark:border-[#374B54] text-gray-900 dark:text-white placeholder-gray-500"
              placeholder="Ej. +34 600..." />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Dirección Completa *</label>
            <input v-model="formulario.direccion" type="text"
              class="w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E67E50]/20 focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-all bg-transparent border-gray-200 dark:border-[#374B54] text-gray-900 dark:text-white placeholder-gray-500"
              placeholder="Ej. Calle Principal 123, Madrid" />
          </div>
        </div>
      </div>

      <div class="p-6 border-t flex items-center justify-end gap-3 border-gray-50 dark:border-[#374B54] bg-gray-50 dark:bg-[#16181A]">
        <button @click="modalAbierto = false" :disabled="guardando"
          class="px-5 py-2.5 rounded-xl font-medium text-sm transition-colors text-gray-600 dark:text-[#82A1B1] hover:bg-gray-200 dark:hover:bg-[#374B54]">
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