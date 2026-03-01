<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSesionStore } from '@/tiendas/sesion'
import {
  Users, Search, FileText, FileSpreadsheet, Plus, Phone, Calendar,
  BarChart2, Pencil, Trash2, X, Package, TrendingUp, BarChart3,
  AlertCircle, CheckCircle2, RefreshCw
} from 'lucide-vue-next'
import usuarioServicio from '@/servicios/usuarioServicio'
import dashboardServicio from '@/servicios/dashboardServicio'
import exportadorServicio from '@/servicios/exportadorServicio'
import type { UsuarioItem, ResumenSesion, EstadisticaUsuario } from '@/modelos/Dashboard'
import type { CrearUsuarioDto, ActualizarUsuarioDto } from '@/servicios/usuarioServicio'

const props = defineProps<{
  darkMode: boolean
}>()

const sesionStore = useSesionStore()
const esAdmin = computed(() => sesionStore.usuario?.rol === 'ADMIN')

const cargando = ref(true)
const usuarios = ref<UsuarioItem[]>([])
const usuariosActivos = ref<ResumenSesion[]>([])

const busquedaUsuarios = ref('')
const filtroRolUsuario = ref('')
const usuarioModalAbierto = ref(false)
const usuarioEditando = ref<UsuarioItem | null>(null)
const usuarioEliminandoId = ref<number | null>(null)
const guardandoUsuario = ref(false)
const eliminandoUsuario = ref(false)
const feedbackUsuario = ref<'ok' | 'error' | null>(null)
const feedbackMensajeUsuario = ref('')

const formularioUsuario = ref<CrearUsuarioDto>({
  nombre: '', email: '', password: '', rol: 'REPARTIDOR'
})

const usuarioViendoStats = ref<UsuarioItem | null>(null)
const statsUsuarioPanel = ref<EstadisticaUsuario | null>(null)
const cargandoStatsUsuario = ref(false)

const usuariosFiltrados = computed(() => {
  let lista = usuarios.value
  if (filtroRolUsuario.value) {
    lista = lista.filter(u => u.rol === filtroRolUsuario.value)
  }
  const q = busquedaUsuarios.value.toLowerCase().trim()
  if (!q) return lista
  return lista.filter(u => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

const kpisUsuarios = computed(() => {
  const total = usuarios.value.length
  const admins = usuarios.value.filter(u => u.rol === 'ADMIN').length
  const repartidores = usuarios.value.filter(u => u.rol === 'REPARTIDOR').length
  const online = usuariosActivos.value.filter(u => u.estaActivo).length
  return [
    { icon: Users, label: 'Total Usuarios', value: total.toString(), subtitle: 'registrados en sistema', color: '#092C4C' },
    { icon: Package, label: 'Repartidores', value: repartidores.toString(), subtitle: 'personal de entrega', color: '#E67E50' },
    { icon: CheckCircle2, label: 'Administradores', value: admins.toString(), subtitle: 'con acceso total', color: '#374B54' },
    { icon: RefreshCw, label: 'En línea', value: online.toString(), subtitle: 'usuarios conectados', color: '#22c55e' },
  ]
})

const chartColors = computed(() => {
  const otros = usuarios.value.length - usuarios.value.filter(u => u.rol === 'ADMIN' || u.rol === 'REPARTIDOR').length;
  return otros > 0 ? ['#374B54', '#E67E50', '#94a3b8'] : ['#374B54', '#E67E50'];
});

const chartLabels = computed(() => {
  const otros = usuarios.value.length - usuarios.value.filter(u => u.rol === 'ADMIN' || u.rol === 'REPARTIDOR').length;
  return otros > 0 ? ['Administradores', 'Repartidores', 'Otros'] : ['Administradores', 'Repartidores'];
});

const chartOptions = computed(() => ({
  chart: { type: 'radialBar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  theme: { mode: props.darkMode ? 'dark' : 'light' },
  labels: chartLabels.value,
  colors: chartColors.value,
  plotOptions: { 
    radialBar: { 
      hollow: { size: '40%' },
      track: { background: props.darkMode ? '#334155' : '#e2e8f0' },
      dataLabels: {
        name: { fontSize: '13px' },
        value: { fontSize: '18px', fontWeight: 'bold' },
        total: { show: true, label: 'Total', formatter: () => usuarios.value.length.toString() }
      }
    } 
  },
  stroke: { lineCap: 'round' }
}));

const chartSeries = computed(() => {
  const admins = usuarios.value.filter(u => u.rol === 'ADMIN').length;
  const repartidores = usuarios.value.filter(u => u.rol === 'REPARTIDOR').length;
  const otros = usuarios.value.length - admins - repartidores;
  const total = usuarios.value.length || 1;
  const vals = otros > 0 ? [admins, repartidores, otros] : [admins, repartidores];
  return vals.map(v => Math.round((v / total) * 100));
});

function colorAvatar(rol: string) { return rol === 'ADMIN' ? 'from-purple-500 to-indigo-600' : 'from-[#E67E50] to-[#d4603a]' }
function avatarIniciales(nombre: string) { return nombre.substring(0, 1).toUpperCase() }
function badgeRol(rol: string) {
  if (rol === 'ADMIN') return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' }
  return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
}
function labelRol(rol: string) { return rol === 'ADMIN' ? 'Administrador' : 'Repartidor' }

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

function fechaRegistro(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function estaOnline(userId: number) {
  return usuariosActivos.value.some(u => u.usuarioId === userId && u.estaActivo)
}

function abrirModalCrearUsuario() {
  usuarioEditando.value = null
  formularioUsuario.value = { nombre: '', email: '', password: '', rol: 'REPARTIDOR' }
  feedbackUsuario.value = null
  usuarioModalAbierto.value = true
}

function abrirModalEditarUsuario(u: UsuarioItem) {
  usuarioEditando.value = u
  formularioUsuario.value = { nombre: u.nombre, email: u.email, password: '', rol: u.rol }
  feedbackUsuario.value = null
  usuarioModalAbierto.value = true
}

async function guardarUsuario() {
  if (!formularioUsuario.value.nombre.trim() || !formularioUsuario.value.email.trim()) return
  guardandoUsuario.value = true
  feedbackUsuario.value = null
  try {
    if (usuarioEditando.value) {
      const actualizarDto: ActualizarUsuarioDto = {
        nombre: formularioUsuario.value.nombre, email: formularioUsuario.value.email, rol: formularioUsuario.value.rol
      }
      if (formularioUsuario.value.password) {
        actualizarDto.password = formularioUsuario.value.password
      }
      const actualizado = await usuarioServicio.actualizar(usuarioEditando.value.id, actualizarDto)
      const idx = usuarios.value.findIndex(u => u.id === usuarioEditando.value!.id)
      if (idx !== -1) usuarios.value[idx] = actualizado
      feedbackMensajeUsuario.value = 'Usuario actualizado correctamente'
    } else {
      if (!formularioUsuario.value.password) throw new Error('Contraseña requerida')
      const nuevo = await usuarioServicio.crear(formularioUsuario.value)
      usuarios.value.push(nuevo)
      feedbackMensajeUsuario.value = 'Usuario creado correctamente'
    }
    feedbackUsuario.value = 'ok'
    setTimeout(() => { usuarioModalAbierto.value = false }, 1200)
  } catch {
    feedbackUsuario.value = 'error'
    feedbackMensajeUsuario.value = 'Error al guardar el usuario'
  } finally {
    guardandoUsuario.value = false
  }
}

async function confirmarEliminarUsuario(id: number) {
  eliminandoUsuario.value = true
  try {
    await usuarioServicio.eliminar(id)
    usuarios.value = usuarios.value.filter(u => u.id !== id)
    usuarioEliminandoId.value = null
    if (usuarioViendoStats.value?.id === id) usuarioViendoStats.value = null
  } catch {} finally {
    eliminandoUsuario.value = false
  }
}

async function verEstadisticasUsuario(u: UsuarioItem) {
  if (usuarioViendoStats.value?.id === u.id) {
    usuarioViendoStats.value = null
    statsUsuarioPanel.value = null
    return
  }
  usuarioViendoStats.value = u
  statsUsuarioPanel.value = null
  cargandoStatsUsuario.value = true
  try {
    statsUsuarioPanel.value = await usuarioServicio.obtenerEstadisticas(u.id)
  } catch {} finally {
    cargandoStatsUsuario.value = false
  }
}

function exportarUsuariosPDF() {
  const columnas = ['Nombre', 'Email', 'Rol', 'Teléfono', 'Última Conexión', 'Registro']
  const data = usuariosFiltrados.value.map(u => [
    u.nombre, u.email, labelRol(u.rol), u.telefono || '—',
    estaOnline(u.id) ? 'En línea' : (u.ultimaConexion ? new Date(u.ultimaConexion).toLocaleString() : 'Nunca'),
    new Date(u.fechaRegistro).toLocaleDateString()
  ])
  exportadorServicio.exportarPDF('Reporte de Usuarios', columnas, data, 'Usuarios_Reporte')
}

function exportarUsuariosExcel() {
  const data = usuariosFiltrados.value.map(u => ({
    Nombre: u.nombre, Email: u.email, Rol: labelRol(u.rol), Telefono: u.telefono || '',
    UltimaConexion: u.ultimaConexion ? new Date(u.ultimaConexion).toLocaleString() : '',
    Registro: new Date(u.fechaRegistro).toLocaleDateString()
  }))
  exportadorServicio.exportarExcel('Usuarios', data, 'Usuarios_Reporte')
}

onMounted(async () => {
  cargando.value = true
  try {
    const [usrs, actus] = await Promise.all([
      usuarioServicio.obtenerTodos(),
      dashboardServicio.obtenerUsuariosActivos()
    ])
    usuarios.value = usrs
    usuariosActivos.value = actus
  } catch {} finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Top Grid: KPIs + Chart -->
    <div class="grid lg:grid-cols-4 gap-6 items-stretch">
      <!-- KPIs Usuarios (2x2 grid) -->
      <div class="lg:col-span-3 grid sm:grid-cols-2 gap-4">
        <template v-if="cargando">
          <div v-for="i in 4" :key="i" class="p-5 rounded-2xl border animate-pulse h-full flex flex-col justify-center" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
            <div class="h-4 rounded w-24 mb-4" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
            <div class="h-8 rounded w-16 mb-2" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
            <div class="h-3 rounded w-32" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
          </div>
        </template>
        <template v-else>
          <div v-for="(kpi, i) in kpisUsuarios" :key="i" class="p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col h-full" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'">
            <div class="flex items-start justify-between mb-3">
              <div class="p-2.5 rounded-xl" :style="{ backgroundColor: `${kpi.color}18` }">
                <component :is="kpi.icon" class="w-5 h-5" :style="{ color: kpi.color }" />
              </div>
            </div>
            <p class="text-xs font-medium mb-1 mt-auto" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ kpi.label }}</p>
            <div class="text-2xl font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ kpi.value }}</div>
            <p class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-[#9e9e9e]'">{{ kpi.subtitle }}</p>
          </div>
        </template>
      </div>

      <!-- Gráfico de Roles Radial -->
      <div class="lg:col-span-1 rounded-2xl border p-5 shadow-sm flex flex-col items-center justify-center transition-colors h-full"
        :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <h3 class="font-bold text-sm mb-2 w-full text-center" :class="darkMode ? 'text-gray-300' : 'text-[#092C4C]'">Roles del Sistema</h3>
        <apexchart v-if="usuarios.length > 0" type="radialBar" height="240" width="100%" :options="chartOptions" :series="chartSeries"></apexchart>
        <p v-if="usuarios.length === 0" class="text-sm text-gray-500 py-10">Sin datos</p>
      </div>
    </div>

    <!-- Tabla y Funcionalidades (ancho completo) -->
    <div class="space-y-4">
      <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="busquedaUsuarios" type="text" placeholder="Buscar por nombre o email..." class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
      </div>
      <select v-model="filtroRolUsuario" class="py-2.5 px-3 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-700 text-gray-300 bg-[#1a2332]' : 'border-gray-200 text-[#424242] bg-white'">
        <option value="">Todos los roles</option>
        <option value="ADMIN">Admin</option>
        <option value="REPARTIDOR">Repartidor</option>
      </select>
      <button @click="exportarUsuariosPDF" class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shadow-sm" :class="darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : ''" title="Exportar Usuarios PDF"><FileText class="w-4 h-4 text-red-500" /> <span class="hidden sm:inline">PDF</span></button>
      <button @click="exportarUsuariosExcel" class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shadow-sm" :class="darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : ''" title="Exportar Usuarios Excel"><FileSpreadsheet class="w-4 h-4 text-green-600" /> <span class="hidden sm:inline">Excel</span></button>
      <button v-if="esAdmin" @click="abrirModalCrearUsuario" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors shadow-sm"><Plus class="w-4 h-4" />Nuevo Usuario</button>
    </div>

    <!-- Tabla + Panel Stats en grid -->
    <div class="flex gap-6" :class="usuarioViendoStats ? 'items-start' : ''">

      <!-- Tabla usuarios -->
      <div class="flex-1 rounded-2xl border shadow-sm overflow-hidden min-w-0" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
        <div v-if="cargando" class="p-6 space-y-3">
          <div v-for="i in 5" :key="i" class="h-16 rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
        </div>
        <div v-else-if="usuariosFiltrados.length === 0" class="py-20 text-center">
          <Users class="w-12 h-12 mx-auto mb-3" :class="darkMode ? 'text-gray-600' : 'text-gray-300'" />
          <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">No hay usuarios que coincidan</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-xs font-semibold uppercase tracking-wide" :class="darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-[#9e9e9e]'">
                <th class="py-4 px-6 text-left">Usuario</th>
                <th class="py-4 px-6 text-left">Email</th>
                <th class="py-4 px-6 text-left">Rol</th>
                <th class="py-4 px-6 text-left">Teléfono</th>
                <th class="py-4 px-6 text-left">Última Conexión</th>
                <th class="py-4 px-6 text-left">Registro</th>
                <th v-if="esAdmin" class="py-4 px-6 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-50'">
              <tr v-for="u in usuariosFiltrados" :key="u.id" class="transition-colors" :class="[darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50', usuarioViendoStats?.id === u.id ? (darkMode ? 'bg-gray-800/70' : 'bg-orange-50/60') : '']">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="relative flex-shrink-0">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br overflow-hidden" :class="colorAvatar(u.rol)">
                        <img v-if="u.imagenUrl" :src="u.imagenUrl" class="w-full h-full object-cover" />
                        <span v-else>{{ avatarIniciales(u.nombre) }}</span>
                      </div>
                      <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex-shrink-0" :class="[estaOnline(u.id) ? 'bg-green-500' : 'bg-gray-300', darkMode ? 'border-[#1a2332]' : 'border-white']"></span>
                    </div>
                    <span class="font-semibold text-sm" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ u.nombre }}</span>
                  </div>
                </td>
                <td class="py-4 px-6"><span class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ u.email }}</span></td>
                <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-xs font-semibold border" :class="[badgeRol(u.rol).bg, badgeRol(u.rol).text, badgeRol(u.rol).border]">{{ labelRol(u.rol) }}</span></td>
                <td class="py-4 px-6"><span class="text-sm flex items-center gap-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'"><Phone class="w-3.5 h-3.5 flex-shrink-0" v-if="u.telefono" />{{ u.telefono || '—' }}</span></td>
                <td class="py-4 px-6"><span class="text-xs flex items-center gap-1" :class="estaOnline(u.id) ? 'text-green-500 font-semibold' : (darkMode ? 'text-gray-400' : 'text-[#757575]')"><span v-if="estaOnline(u.id)" class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>{{ estaOnline(u.id) ? 'En línea' : tiempoRelativo(u.ultimaConexion) }}</span></td>
                <td class="py-4 px-6"><span class="text-xs flex items-center gap-1" :class="darkMode ? 'text-gray-400' : 'text-[#9e9e9e]'"><Calendar class="w-3.5 h-3.5 flex-shrink-0" />{{ fechaRegistro(u.fechaRegistro) }}</span></td>
                <td v-if="esAdmin" class="py-4 px-6">
                  <div class="flex items-center gap-1">
                    <button @click="verEstadisticasUsuario(u)" class="p-1.5 rounded-lg transition-colors" :class="usuarioViendoStats?.id === u.id ? 'bg-[#E67E50] text-white' : (darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-orange-50 text-gray-400 hover:text-[#E67E50]')" title="Ver estadísticas"><BarChart2 class="w-4 h-4" /></button>
                    <button @click="abrirModalEditarUsuario(u)" class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'" title="Editar"><Pencil class="w-4 h-4" /></button>
                    <button @click="usuarioEliminandoId = u.id" class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'" title="Eliminar"><Trash2 class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!cargando && usuariosFiltrados.length > 0" class="px-6 py-3 border-t text-xs" :class="darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'">
          Mostrando {{ usuariosFiltrados.length }} de {{ usuarios.length }} usuarios
        </div>
      </div>

      <!-- Panel de Estadísticas -->
      <Transition name="slide-panel">
        <div v-if="usuarioViendoStats" class="w-72 flex-shrink-0 rounded-2xl border shadow-sm overflow-hidden" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="p-5 border-b flex items-center justify-between" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br flex-shrink-0 overflow-hidden" :class="colorAvatar(usuarioViendoStats.rol)">
                <img v-if="usuarioViendoStats.imagenUrl" :src="usuarioViendoStats.imagenUrl" class="w-full h-full object-cover" />
                <span v-else>{{ avatarIniciales(usuarioViendoStats.nombre) }}</span>
              </div>
              <div class="min-w-0">
                <p class="font-bold text-sm truncate" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ usuarioViendoStats.nombre }}</p>
                <p class="text-xs truncate" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ labelRol(usuarioViendoStats.rol) }}</p>
              </div>
            </div>
            <button @click="usuarioViendoStats = null; statsUsuarioPanel = null" class="p-1 rounded-lg flex-shrink-0 transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"><X class="w-4 h-4" /></button>
          </div>
          <div class="p-5 space-y-4">
            <p class="text-xs font-bold uppercase tracking-wider" :class="darkMode ? 'text-gray-500' : 'text-[#9e9e9e]'">Rendimiento global</p>
            <div v-if="cargandoStatsUsuario" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-14 rounded-xl animate-pulse" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
            </div>
            <div v-else-if="!statsUsuarioPanel" class="text-center py-6">
              <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Sin estadísticas disponibles</p>
            </div>
            <template v-else>
              <div class="p-4 rounded-xl flex items-center gap-4" :class="darkMode ? 'bg-gray-800/60' : 'bg-[#E67E50]/8'">
                <div class="p-2.5 rounded-xl bg-[#E67E50]/15"><Package class="w-5 h-5 text-[#E67E50]" /></div>
                <div>
                  <p class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ statsUsuarioPanel.entregasTotales }}</p>
                  <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Entregas totales</p>
                </div>
              </div>
              <div class="p-4 rounded-xl flex items-center gap-4" :class="darkMode ? 'bg-gray-800/60' : 'bg-[#374B54]/8'">
                <div class="p-2.5 rounded-xl bg-[#374B54]/15"><TrendingUp class="w-5 h-5 text-[#374B54]" :class="darkMode ? '!text-blue-400' : ''" /></div>
                <div>
                  <p class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ statsUsuarioPanel.puntosAcumulados.toLocaleString('es-ES') }}</p>
                  <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Puntos acumulados</p>
                </div>
              </div>
              <div class="p-4 rounded-xl flex items-center gap-4" :class="darkMode ? 'bg-gray-800/60' : 'bg-green-50'">
                <div class="p-2.5 rounded-xl bg-green-100"><BarChart3 class="w-5 h-5 text-green-600" /></div>
                <div>
                  <p class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ Number(statsUsuarioPanel.kilometrosAhorrados).toFixed(1) }}</p>
                  <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Km ahorrados</p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="usuarioModalAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="usuarioModalAbierto = false">
        <div class="w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="flex items-center justify-between px-6 py-5 border-b" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
            <div>
              <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
              <p class="text-xs mt-0.5" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ usuarioEditando ? usuarioEditando.email : 'Rellena los campos obligatorios' }}</p>
            </div>
            <button @click="usuarioModalAbierto = false" class="p-1.5 rounded-lg transition-colors" :class="darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"><X class="w-5 h-5" /></button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Nombre *</label>
              <input v-model="formularioUsuario.nombre" type="text" placeholder="Nombre completo" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Email *</label>
              <input v-model="formularioUsuario.email" type="email" placeholder="usuario@moveo.com" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Contraseña {{ usuarioEditando ? '(dejar en blanco para no cambiar)' : '*' }}</label>
              <input v-model="formularioUsuario.password" type="password" placeholder="••••••••" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent" :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Rol *</label>
              <select v-model="formularioUsuario.rol" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors" :class="darkMode ? 'border-gray-600 text-white bg-[#1a2332]' : 'border-gray-200 text-[#424242] bg-white'">
                <option value="REPARTIDOR">Repartidor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div v-if="feedbackUsuario" class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" :class="feedbackUsuario === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
              <CheckCircle2 v-if="feedbackUsuario === 'ok'" class="w-4 h-4" /><AlertCircle v-else class="w-4 h-4" />{{ feedbackMensajeUsuario }}
            </div>
            <button @click="guardarUsuario" :disabled="guardandoUsuario || !formularioUsuario.nombre.trim() || !formularioUsuario.email.trim()" class="w-full py-2.5 rounded-xl text-sm font-bold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <RefreshCw v-if="guardandoUsuario" class="w-4 h-4 animate-spin" />{{ guardandoUsuario ? 'Guardando...' : (usuarioEditando ? 'Actualizar' : 'Crear Usuario') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="usuarioEliminandoId !== null" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="usuarioEliminandoId = null">
        <div class="w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="px-6 py-6 text-center">
            <div class="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 class="w-7 h-7 text-red-500" /></div>
            <h3 class="font-bold text-lg mb-2" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Eliminar usuario</h3>
            <p class="text-sm mb-6" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.</p>
            <div class="flex gap-3">
              <button @click="confirmarEliminarUsuario(usuarioEliminandoId!)" :disabled="eliminandoUsuario" class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">{{ eliminandoUsuario ? 'Eliminando...' : 'Sí, eliminar' }}</button>
              <button @click="usuarioEliminandoId = null" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors" :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">Cancelar</button>
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
.slide-panel-enter-active, .slide-panel-leave-active { transition: all 0.25s ease; }
.slide-panel-enter-from, .slide-panel-leave-to { opacity: 0; transform: translateX(20px); }
</style>
