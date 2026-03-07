<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Search, Plus, Pencil, Trash2, Building2, MapPin, Phone,
  CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-vue-next'
import clientesServicio from '@/servicios/clientesServicio'
import type { ClienteDto, CrearClienteDto, ActualizarClienteDto } from '@/modelos/Ruta'
import exportadorServicio from '@/servicios/exportadorServicio'

import BaseModuleView from '@/componentes/comunes/BaseModuleView.vue'

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

const kpiData = computed(() => {
  const total = clientes.value.length
  return [
    { icon: Building2, label: 'Total Clientes', value: total.toString(), subtitulo: 'empresas registradas', color: '#E67E50' }
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
  <BaseModuleView
    title="Gestión de Clientes"
    description="Directorio de empresas, ubicaciones y contactos de entrega"
    themeColor="orange"
    :headerIcon="Building2"
    viewMode="cards"
    :cargando="cargando"
    v-model:searchQuery="busqueda"
    searchPlaceholder="Buscar empresa o teléfono..."
    showNewButton
    newButtonLabel="Nuevo Cliente"
    @new-click="abrirModalCrear"
  >
    <template #title-icon>
      <Building2 class="w-6 h-6 text-[#E67E50]" />
    </template>

    <template #custom-kpis>
      <div v-if="cargando" class="col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-32 rounded-2xl border animate-pulse bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]"></div>
      </div>
      <div v-else class="col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="col-span-1 md:col-span-3 p-6 rounded-2xl border bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54] flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div class="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-orange-50/50 dark:from-orange-900/5 to-transparent pointer-events-none"></div>
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-[#82A1B1]">Empresas en Cartera</p>
            <h4 class="text-4xl font-black text-[#092C4C] dark:text-white mt-1">{{ clientes.length }}</h4>
            <p class="text-xs text-orange-600 dark:text-orange-400 mt-2 font-semibold">Total de ubicaciones geolocalizadas</p>
          </div>
          <div class="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-[#E67E50] group-hover:scale-110 transition-transform">
             <Building2 class="w-10 h-10" />
          </div>
        </div>
        
        <div class="p-5 rounded-2xl border bg-[#374B54] text-white border-transparent shadow-lg flex flex-col items-center justify-center text-center">
          <MapPin class="w-6 h-6 mb-2 opacity-80" />
          <p class="text-2xl font-bold">{{ clientes.filter(c => c.latitud).length }}</p>
          <p class="text-[10px] uppercase font-bold tracking-tighter opacity-70">Ubicaciones GPS</p>
        </div>
      </div>
    </template>

    <template #header-actions>
      <div class="relative group">
        <button class="px-4 py-2.5 border rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white hover:border-[#E67E50] dark:hover:border-[#E67E50]">
           Exportar
        </button>
        <div class="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
          <button @click="exportarPDF" class="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-orange-50 dark:hover:bg-[#E67E50]/10 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Descargar PDF
          </button>
          <button @click="exportarExcel" class="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-orange-50 dark:hover:bg-[#E67E50]/10 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Descargar Excel
          </button>
        </div>
      </div>
    </template>

    <template #filters>
      <button @click="cargarDatos" class="p-2.5 border rounded-xl transition-all hover:bg-orange-50 dark:hover:bg-[#E67E50]/10 border-gray-200 dark:border-[#374B54] text-gray-600 dark:text-[#82A1B1]">
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': cargando }" />
      </button>
    </template>

    <template #cards>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-if="clientesFiltrados.length === 0" class="col-span-full py-20 text-center">
          <Building2 class="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-[#374B54]" />
          <p class="text-gray-400 dark:text-gray-500">No hay clientes registrados o que coincidan</p>
        </div>
        
        <div v-for="c in clientesFiltrados" :key="c.id" 
             class="p-5 rounded-2xl border bg-white dark:bg-[#16181A] border-gray-100 dark:border-[#374B54] hover:border-[#E67E50]/50 transition-all group flex flex-col justify-between shadow-sm hover:shadow-md">
          <div>
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                {{ c.nombreEmpresa.substring(0, 2).toUpperCase() }}
              </div>
              <div class="flex gap-1 transition-opacity">
                <button @click="abrirModalEditar(c)" class="p-2 rounded-lg bg-gray-50 dark:bg-[#272A30] text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"><Pencil class="w-4 h-4" /></button>
                <button @click="confirmarEliminar(c.id)" class="p-2 rounded-lg bg-gray-50 dark:bg-[#272A30] text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
            
            <h5 class="font-bold text-[#092C4C] dark:text-white group-hover:text-[#E67E50] transition-colors line-clamp-1">{{ c.nombreEmpresa }}</h5>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-tighter uppercase mt-0.5">ID: CL-{{ String(c.id).padStart(4, '0') }}</p>
            
            <div class="mt-4 space-y-2.5">
              <div class="flex items-center gap-2.5 text-xs text-gray-600 dark:text-[#82A1B1]">
                <MapPin class="w-3.5 h-3.5 text-[#E67E50]" />
                <span class="line-clamp-1">{{ c.direccion }}</span>
              </div>
              <div class="flex items-center gap-2.5 text-xs text-gray-600 dark:text-[#82A1B1]">
                <Phone class="w-3.5 h-3.5 text-green-500" />
                <span>{{ c.telefono || 'Sin teléfono' }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-5 pt-4 border-t border-gray-50 dark:border-[#272A30] flex items-center justify-between">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-[#E67E50] font-bold">Cliente Activo</span>
            <div v-if="c.latitud" class="flex items-center gap-1 text-[10px] text-green-500 font-black">
              <CheckCircle2 class="w-3 h-3" /> LOCALIZADO
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #modals>
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
  </BaseModuleView>
</template>