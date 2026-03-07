<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import {
  Package, CheckCircle2, AlertCircle, Clock,
  Search, Filter, Loader2, Edit, Trash2, ShieldAlert, Check, Plus, X, Eye, Truck, User, Download, FileText, FileSpreadsheet,
  Activity, Route // Añadido Route para que no falle el icono
} from 'lucide-vue-next';
import entregasServicio from '@/servicios/entregasServicio';
import rutasServicio from '@/servicios/rutasServicio';
import clientesServicio from '@/servicios/clientesServicio';
import exportadorServicio from '@/servicios/exportadorServicio';
import type { EntregaDto, CrearEntregaDto } from '@/modelos/Ruta';
import type { EntregasEstadisticasDto } from '@/servicios/entregasServicio';
import type { RutaDto, ClienteDto } from '@/modelos/Ruta';
import { toast } from 'vue-sonner';

const props = defineProps<{
}>();

// --- ESTADO PRINCIPAL ---
const cargando = ref(true);
const entregas = ref<EntregaDto[]>([]);
const estadisticas = ref<EntregasEstadisticasDto | null>(null);

// Filtros
const busqueda = ref('');
const filtroEstado = ref('');
const filtroRutaId = ref<number | ''>('');
const filtroClienteId = ref<number | ''>('');

// Datos para selectores
const rutasDisponibles = ref<RutaDto[]>([]);
const clientesDisponibles = ref<ClienteDto[]>([]);

// Modales
const mostrarModalNuevo = ref(false);
const mostrarModalEstado = ref(false);
const mostrarModalDetalle = ref(false);

const entregaSeleccionada = ref<EntregaDto | null>(null);
const entregaEditando = ref<EntregaDto | null>(null);

const nuevaEntregaFormData = ref<CrearEntregaDto>({
  rutaId: 0,
  clienteId: 0,
  ordenParada: 1,
  notas: ''
});

const nuevoEstadoFormData = ref({
  estado: ''
});

// Computed
const entregasFiltradas = computed(() => {
  let resultado = entregas.value;
  
  if (filtroEstado.value) {
    resultado = resultado.filter(e => e.estado === filtroEstado.value);
  }
  
  if (filtroRutaId.value) {
    resultado = resultado.filter(e => e.rutaId === filtroRutaId.value);
  }

  if (filtroClienteId.value) {
    resultado = resultado.filter(e => e.clienteId === filtroClienteId.value);
  }

  if (busqueda.value) {
    const q = busqueda.value.toLowerCase();
    resultado = resultado.filter(e => 
      e.id.toString().includes(q) ||
      e.cliente?.nombreEmpresa.toLowerCase().includes(q) ||
      e.cliente?.direccion.toLowerCase().includes(q)
    );
  }

  // Ordenar de más reciente a más antiguo
  return resultado.sort((a,b) => b.id - a.id);
});

const kpis = computed(() => {
  if (!estadisticas.value) return [];
  const pctx = estadisticas.value.totalHoy > 0 
    ? Math.round((estadisticas.value.completadas / estadisticas.value.totalHoy) * 100) 
    : 0;
    
  return [
    { label: 'Entregadas Hoy', value: estadisticas.value.completadas || 0, icon: CheckCircle2, color: '#22c55e', subtitulo: `${pctx}% de éxito` },
    { label: 'Pendientes Hoy', value: estadisticas.value.pendientes || 0, icon: Clock, color: '#f59e0b', subtitulo: 'En ruta o en almacén' },
    { label: 'Fallidas Hoy', value: estadisticas.value.fallidas || 0, icon: ShieldAlert, color: '#ef4444', subtitulo: 'Requieren atención' },
    { label: 'Total Histórico', value: entregas.value.length, icon: Package, color: '#3b82f6', subtitulo: 'Entregas registradas' },
  ];
});

// Helpers
function badgeEstado(estado: string) {
  switch (estado) {
    case 'ENTREGADO': return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' };
    case 'EN_CAMINO': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' };
    case 'FALLIDO': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' };
    case 'PENDIENTE': return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' };
    default: return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' };
  }
}

// Carga principal
async function cargarDatos() {
  cargando.value = true;
  try {
    const [entregasData, statsData, rutasData, clientesData] = await Promise.all([
      entregasServicio.obtenerTodas(),
      entregasServicio.obtenerEstadisticasHoy().catch(() => null),
      rutasServicio.obtenerTodas(),
      clientesServicio.obtenerTodos()
    ]);
    entregas.value = entregasData;
    if(statsData) estadisticas.value = statsData;
    rutasDisponibles.value = rutasData;
    clientesDisponibles.value = clientesData;
  } catch (err) {
    toast.error('Error al cargar datos de entregas');
  } finally {
    cargando.value = false;
  }
}

// Acciones Entregas
function abrirModalNuevaEntrega() {
  entregaEditando.value = null;
  nuevaEntregaFormData.value = {
    rutaId: 0,
    clienteId: 0,
    ordenParada: 1,
    notas: ''
  };
  mostrarModalNuevo.value = true;
}

function abrirModalEditarEntrega(entrega: EntregaDto) {
  entregaEditando.value = entrega;
  nuevaEntregaFormData.value = {
    rutaId: entrega.rutaId,
    clienteId: entrega.clienteId,
    ordenParada: entrega.ordenParada,
    notas: entrega.notas || ''
  };
  mostrarModalNuevo.value = true;
}

async function guardarEntrega() {
  if (!nuevaEntregaFormData.value.rutaId || !nuevaEntregaFormData.value.clienteId) {
    toast.error('Selecciona una ruta y un cliente');
    return;
  }
  try {
    if (entregaEditando.value) {
      await entregasServicio.actualizar(entregaEditando.value.id, nuevaEntregaFormData.value);
      toast.success('Entrega actualizada con éxito');
    } else {
      await entregasServicio.crear(nuevaEntregaFormData.value);
      toast.success('Entrega creada con éxito');
    }
    mostrarModalNuevo.value = false;
    cargarDatos();
  } catch (err) {
    toast.error(entregaEditando.value ? 'Error al actualizar la entrega' : 'Error al crear la entrega');
  }
}

function abrirModalEstado(entrega: EntregaDto) {
  entregaSeleccionada.value = entrega;
  nuevoEstadoFormData.value.estado = entrega.estado;
  mostrarModalEstado.value = true;
}

async function guardarNuevoEstado() {
  if (!entregaSeleccionada.value) return;
  try {
    await entregasServicio.actualizarEstado(entregaSeleccionada.value.id, nuevoEstadoFormData.value.estado);
    toast.success('Estado actualizado');
    mostrarModalEstado.value = false;
    cargarDatos();
  } catch (err) {
    toast.error('Error al actualizar el estado');
  }
}

function abrirModalDetalle(entrega: EntregaDto) {
  entregaSeleccionada.value = entrega;
  mostrarModalDetalle.value = true;
}

async function confirmarEliminarEntrega(id: number) {
  if(confirm("¿Estás seguro de que quieres eliminar esta entrega?")) {
     try {
       await entregasServicio.eliminar(id);
       toast.success('Entrega eliminada');
       cargarDatos();
     } catch (err) {
       toast.error('Error al eliminar la entrega');
     }
  }
}

// --- EXPORTACIÓN ---
function exportarListaPDF() {
  const columnas = ['ID', 'Cliente', 'Direccion', 'Ruta', 'Estado', 'Hora Acc.'];
  const data = entregasFiltradas.value.map(e => [
    `#ENV-${e.id}`,
    e.cliente?.nombreEmpresa || `Cliente #${e.clienteId}`,
    e.cliente?.direccion || '',
    `RT-${e.rutaId}`,
    e.estado,
    e.horaEntregaReal ? new Date(e.horaEntregaReal).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) : '-'
  ]);
  exportadorServicio.exportarPDF('Reporte de Entregas', columnas, data, 'Entregas_Reporte');
}

function exportarListaExcel() {
  const data = entregasFiltradas.value.map(e => ({
    ID: `#ENV-${e.id}`,
    Cliente: e.cliente?.nombreEmpresa || `Cliente #${e.clienteId}`,
    Direccion: e.cliente?.direccion || '',
    RutaAsignada: `RT-${e.rutaId}`,
    Estado: e.estado,
    HoraActualizacion: e.horaEntregaReal ? new Date(e.horaEntregaReal).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) : '-'
  }));
  exportadorServicio.exportarExcel('Entregas', data, 'Entregas_Reporte');
}

onMounted(() => {
  cargarDatos();
});

</script>

<template>
  <div class="space-y-6">
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="cargando">
        <div v-for="i in 4" :key="i" class="p-5 rounded-2xl border animate-pulse bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#E67E50]">
          <div class="h-10 bg-gray-200 dark:bg-[#374B54] rounded-lg w-10 mb-4"></div>
          <div class="h-6 bg-gray-200 dark:bg-[#374B54] w-16 mb-2 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-[#374B54] w-24 rounded"></div>
        </div>
      </template>
      <template v-else>
        <div v-for="kpi in kpis" :key="kpi.label" 
             class="p-5 rounded-2xl border transition-all shadow-sm bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#E67E50]">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2.5 rounded-xl" :style="{ backgroundColor: `${kpi.color}18` }">
              <component :is="kpi.icon" class="w-5 h-5" :style="{ color: kpi.color }" />
            </div>
            <p class="text-sm font-medium text-[#757575] dark:text-[#82A1B1]">{{ kpi.label }}</p>
          </div>
          <div class="flex items-end gap-3 mt-2">
            <p class="text-3xl font-bold text-[#092C4C] dark:text-white">{{ kpi.value }}</p>
            <p v-if="kpi.subtitulo" class="text-xs pb-1 font-medium text-gray-400 dark:text-[#82A1B1]">{{kpi.subtitulo}}</p>
          </div>
        </div>
      </template>
    </div>

    <div class="border rounded-2xl flex flex-col overflow-hidden bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] shadow-sm transition-colors duration-300">
      
      <div class="p-5 border-b space-y-4 border-gray-100 dark:border-[#374B54]">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 class="text-xl font-bold flex items-center gap-2 text-[#092C4C] dark:text-white">
            <Package class="w-5 h-5 text-[#E67E50]"/> Gestión de Entregas
          </h2>
          <div class="flex items-center gap-2">
            <button @click="exportarListaPDF" class="px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold shrink-0 bg-gray-100 dark:bg-[#16181A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#374B54]" title="Exportar PDF">
               <FileText class="w-4 h-4 text-red-500"/> <span class="hidden sm:inline">PDF</span>
            </button>
            <button @click="exportarListaExcel" class="px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold shrink-0 bg-gray-100 dark:bg-[#16181A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#374B54]" title="Exportar Excel">
               <FileSpreadsheet class="w-4 h-4 text-green-600"/> <span class="hidden sm:inline">Excel</span>
            </button>
            <button @click="abrirModalNuevaEntrega" class="bg-[#E67E50] text-white px-4 py-2.5 rounded-lg hover:bg-[#d46b3f] transition-colors flex items-center gap-2 text-sm font-semibold shrink-0 ml-2">
               <Plus class="w-4 h-4"/> Nueva Entrega
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
           <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input v-model="busqueda" type="text" placeholder="Buscar empresa o dirección..."
                     class="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"/>
            </div>
            
            <select v-model="filtroEstado" class="w-full p-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] cursor-pointer transition-colors bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white">
              <option value="">Todos los Estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_CAMINO">En Camino</option>
              <option value="ENTREGADO">Entregados</option>
              <option value="FALLIDO">Fallidos</option>
            </select>

            <select v-model="filtroRutaId" class="w-full p-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] cursor-pointer transition-colors bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white">
              <option value="">Cualquier Ruta</option>
              <option v-for="ruta in rutasDisponibles" :key="ruta.id" :value="ruta.id">Ruta #RT-{{ruta.id}}</option>
            </select>

            <select v-model="filtroClienteId" class="w-full p-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] cursor-pointer transition-colors bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white">
              <option value="">Cualquier Cliente</option>
              <option v-for="cliente in clientesDisponibles" :key="cliente.id" :value="cliente.id">{{cliente.nombreEmpresa}}</option>
            </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap text-left border-collapse">
          <thead>
            <tr class="text-xs uppercase tracking-wider font-semibold border-b bg-gray-50 dark:bg-[#16181A] text-gray-500 dark:text-[#82A1B1] border-gray-100 dark:border-[#374B54]">
              <th class="px-6 py-4">ID</th>
              <th class="px-6 py-4">Cliente / Destino</th>
              <th class="px-6 py-4">Ruta Asignada</th>
              <th class="px-6 py-4">Estado</th>
              <th class="px-6 py-4 text-center">Última Acc.</th>
              <th class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando" class="animate-pulse">
               <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-[#82A1B1]">
                  <Loader2 class="w-8 h-8 text-[#E67E50] animate-spin mx-auto" />
               </td>
            </tr>
            <tr v-else-if="entregasFiltradas.length === 0">
               <td colspan="6" class="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
                  No se encontraron entregas con los filtros actuales.
               </td>
            </tr>
            <tr v-for="entrega in entregasFiltradas" :key="entrega.id" 
                class="border-b transition-colors group border-gray-50 dark:border-[#374B54] hover:bg-gray-50/50 dark:hover:bg-[#16181A]/50 text-[#424242] dark:text-gray-300">
              <td class="px-6 py-4 font-semibold text-sm">
                #ENV-{{ entrega.id }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {{ entrega.cliente?.nombreEmpresa ? entrega.cliente.nombreEmpresa.substring(0,1) : 'C' }}
                  </div>
                  <div>
                    <p class="font-medium text-sm text-gray-900 dark:text-white">{{ entrega.cliente?.nombreEmpresa || `Cliente #${entrega.clienteId}` }}</p>
                    <p class="text-xs truncate w-48 text-gray-500 dark:text-[#82A1B1]"><MapPin class="w-3 h-3 inline mr-0.5 opacity-50"/>{{ entrega.cliente?.direccion }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                 <div class="inline-flex gap-1.5 items-center px-2 py-1 rounded text-xs font-semibold bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                    <Route class="w-3 h-3"/> RT-{{ entrega.rutaId }}
                 </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border"
                      :class="[badgeEstado(entrega.estado).bg, badgeEstado(entrega.estado).text, badgeEstado(entrega.estado).border]">
                  {{ entrega.estado.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-6 py-4 text-center text-xs text-gray-500 dark:text-[#82A1B1]">
                <span v-if="entrega.horaEntregaReal">{{ new Date(entrega.horaEntregaReal).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) }}</span>
                <span v-else class="text-gray-300 dark:text-gray-600">-</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button @click="abrirModalEstado(entrega)" class="p-1.5 rounded-md text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400" title="Cambiar Estado">
                      <Activity class="w-4 h-4"/>
                   </button>
                   <button @click="abrirModalEditarEntrega(entrega)" class="p-1.5 rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400" title="Editar Detalles">
                      <Edit class="w-4 h-4"/>
                   </button>
                   <button @click="abrirModalDetalle(entrega)" class="p-1.5 rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400" title="Ver Detalles">
                      <Eye class="w-4 h-4"/>
                   </button>
                   <button @click="confirmarEliminarEntrega(entrega.id)" class="p-1.5 rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400" title="Eliminar">
                      <Trash2 class="w-4 h-4"/>
                   </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div v-if="mostrarModalEstado" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="rounded-2xl max-w-sm w-full shadow-xl bg-white dark:bg-[#272A30]">
      <div class="p-6 border-b flex justify-between items-center border-gray-100 dark:border-[#374B54]">
        <h3 class="text-lg font-bold text-[#092C4C] dark:text-white">Cambiar Estado #ENV-{{entregaSeleccionada?.id}}</h3>
        <button @click="mostrarModalEstado = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X class="w-5 h-5"/></button>
      </div>
      <div class="p-6">
        <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nuevo Estado</label>
        <select v-model="nuevoEstadoFormData.estado" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50] dark:focus:ring-[#E67E50] bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white">
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_CAMINO">En Camino</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="FALLIDO">Fallido</option>
        </select>
      </div>
      <div class="p-4 border-t flex justify-end gap-3 rounded-b-2xl border-gray-100 dark:border-[#374B54] bg-gray-50 dark:bg-[#16181A]">
        <button @click="mostrarModalEstado = false" class="px-4 py-2 border rounded-lg font-medium transition-colors text-sm border-gray-200 dark:border-[#374B54] text-gray-600 dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50">Cancelar</button>
        <button @click="guardarNuevoEstado" class="px-4 py-2 bg-[#E67E50] text-white rounded-lg font-semibold hover:bg-[#d46b3f] transition-colors text-sm">Actualizar</button>
      </div>
    </div>
  </div>

  <div v-if="mostrarModalNuevo" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="rounded-2xl max-w-lg w-full shadow-xl bg-white dark:bg-[#272A30]">
      <div class="p-6 border-b flex justify-between items-center border-gray-100 dark:border-[#374B54]">
        <h3 class="text-xl font-bold text-[#092C4C] dark:text-white">{{ entregaEditando ? 'Editar Entrega #' + entregaEditando.id : 'Registrar Nueva Entrega' }}</h3>
        <button @click="mostrarModalNuevo = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X class="w-5 h-5"/></button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ruta Asignada *</label>
          <select v-model="nuevaEntregaFormData.rutaId" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50] dark:focus:ring-[#E67E50] bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white">
             <option value="0" disabled>Selecciona una ruta...</option>
             <option v-for="ruta in rutasDisponibles" :key="ruta.id" :value="ruta.id">Ruta #RT-{{ ruta.id }} ({{ruta.estado}})</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Cliente Destinatario *</label>
          <select v-model="nuevaEntregaFormData.clienteId" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50] dark:focus:ring-[#E67E50] bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white">
             <option value="0" disabled>Selecciona un cliente...</option>
             <option v-for="cliente in clientesDisponibles" :key="cliente.id" :value="cliente.id">{{ cliente.nombreEmpresa }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Orden de Parada (Opcional)</label>
          <input type="number" v-model="nuevaEntregaFormData.ordenParada" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50] dark:focus:ring-[#E67E50] bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notas (Opcional)</label>
          <textarea v-model="nuevaEntregaFormData.notas" rows="3" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50] dark:focus:ring-[#E67E50] bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white"></textarea>
        </div>
      </div>
      <div class="p-6 border-t flex justify-end gap-3 rounded-b-2xl border-gray-100 dark:border-[#374B54] bg-gray-50 dark:bg-[#16181A]">
        <button @click="mostrarModalNuevo = false" class="px-4 py-2 border rounded-lg font-medium transition-colors border-gray-200 dark:border-[#374B54] text-gray-600 dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50">Cancelar</button>
        <button @click="guardarEntrega" class="px-4 py-2 bg-[#E67E50] text-white rounded-lg font-semibold hover:bg-[#d46b3f] transition-colors">{{ entregaEditando ? 'Guardar Cambios' : 'Crear Entrega' }}</button>
      </div>
    </div>
  </div>

  <div v-if="mostrarModalDetalle" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="rounded-2xl max-w-md w-full shadow-xl overflow-hidden bg-white dark:bg-[#272A30]">
      <div class="p-6 border-b flex justify-between items-center border-gray-100 dark:border-[#374B54] bg-gray-50 dark:bg-[#16181A]">
        <h3 class="text-xl font-bold flex items-center gap-2 text-[#092C4C] dark:text-white">
           <Package class="w-5 h-5 text-[#E67E50]"/> Entrega #ENV-{{entregaSeleccionada?.id}}
        </h3>
        <button @click="mostrarModalDetalle = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X class="w-5 h-5"/></button>
      </div>
      <div class="p-6 space-y-5">
        
        <div class="flex justify-between items-start">
           <div>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#82A1B1] mb-1">Estado Actual</p>
              <span class="px-3 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider border"
                      :class="[badgeEstado(entregaSeleccionada?.estado || '').bg, badgeEstado(entregaSeleccionada?.estado || '').text, badgeEstado(entregaSeleccionada?.estado || '').border]">
                  {{ entregaSeleccionada?.estado }}
              </span>
           </div>
           <div class="text-right">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#82A1B1] mb-1">Hora Entrega Real</p>
              <p class="font-medium text-sm text-gray-800 dark:text-white">
                 {{ entregaSeleccionada?.horaEntregaReal ? new Date(entregaSeleccionada.horaEntregaReal).toLocaleString() : 'Aún no entregado' }}
              </p>
           </div>
        </div>

        <div class="p-4 rounded-xl border flex gap-4 items-start bg-gray-50 dark:bg-[#16181A] border-gray-100 dark:border-[#374B54]">
           <MapPin class="w-5 h-5 text-[#E67E50] mt-0.5" />
           <div>
              <p class="font-bold text-base text-gray-900 dark:text-white">{{ entregaSeleccionada?.cliente?.nombreEmpresa }}</p>
              <p class="text-sm mt-1 text-gray-600 dark:text-[#82A1B1]">{{ entregaSeleccionada?.cliente?.direccion }}</p>
              <p class="text-sm mt-1 flex items-center gap-1.5 text-gray-600 dark:text-[#82A1B1]">
                 <User class="w-3.5 h-3.5"/> Tel: {{ entregaSeleccionada?.cliente?.telefono || 'No disponible' }}
              </p>
           </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#82A1B1] mb-1">Orden de Parada</p>
              <p class="font-medium text-gray-700 dark:text-gray-300">Posición {{ entregaSeleccionada?.ordenParada }}</p>
           </div>
           <div>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#82A1B1] mb-1">Ruta Asociada</p>
              <p class="font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                 <Route class="w-4 h-4 text-orange-500" /> RT-{{ entregaSeleccionada?.rutaId }}
              </p>
           </div>
        </div>

        <div v-if="entregaSeleccionada?.notas" class="pt-4 border-t border-gray-100 dark:border-[#374B54]">
           <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#82A1B1] mb-2">Notas del conductor</p>
           <p class="text-sm italic text-gray-600 dark:text-gray-300">"{{ entregaSeleccionada?.notas }}"</p>
        </div>

        <div v-if="entregaSeleccionada?.codigoQr" class="pt-4 border-t border-gray-100 dark:border-[#374B54]">
           <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#82A1B1] mb-2">Código QR Escaneado</p>
           <p class="text-sm font-mono p-2 rounded text-center bg-gray-100 dark:bg-[#16181A] text-gray-800 dark:text-gray-300">{{ entregaSeleccionada?.codigoQr }}</p>
        </div>

      </div>
    </div>
  </div>

</template>