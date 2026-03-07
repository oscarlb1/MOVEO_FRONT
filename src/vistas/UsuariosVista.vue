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
import BaseModuleView from '@/componentes/comunes/BaseModuleView.vue'

const props = defineProps<{
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
    { icon: Users, label: 'Total Usuarios', value: total.toString(), subtitle: 'registrados en sistema', color: '#E67E50' }, // Ajustado al naranja Moveo
    { icon: Package, label: 'Repartidores', value: repartidores.toString(), subtitle: 'personal de entrega', color: '#374B54' }, // Ajustado al azul secundario
    { icon: CheckCircle2, label: 'Administradores', value: admins.toString(), subtitle: 'con acceso total', color: '#092C4C' }, // Ajustado al azul oscuro
    { icon: RefreshCw, label: 'En línea', value: online.toString(), subtitle: 'usuarios conectados', color: '#22c55e' },
  ]
})

function colorAvatar(rol: string) { return rol === 'ADMIN' ? 'from-[#374B54] to-[#092C4C]' : 'from-[#E67E50] to-[#d4603a]' } // Ajustado a paleta Moveo
function avatarIniciales(nombre: string) { return nombre.substring(0, 1).toUpperCase() }

function badgeRol(rol: string) {
  if (rol === 'ADMIN') return { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' }
  return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' }
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
  formularioUsuario.value = { nombre: '', email: '', password: '', rol: 'REPARTIDOR', telefono: '', imagen: undefined }
  feedbackUsuario.value = null
  usuarioModalAbierto.value = true
}

function abrirModalEditarUsuario(u: UsuarioItem) {
  usuarioEditando.value = u
  formularioUsuario.value = { nombre: u.nombre, email: u.email, password: '', rol: u.rol, telefono: u.telefono || '', imagen: undefined }
  feedbackUsuario.value = null
  usuarioModalAbierto.value = true
}

function manejarArchivo(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formularioUsuario.value.imagen = target.files[0]
  } else {
    formularioUsuario.value.imagen = undefined
  }
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
      if (formularioUsuario.value.telefono) {
        actualizarDto.telefono = formularioUsuario.value.telefono
      }
      if (formularioUsuario.value.imagen) {
        actualizarDto.imagen = formularioUsuario.value.imagen
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
  <BaseModuleView
    title="Gestión de Usuarios"
    description="Administra los accesos, permisos y actividad del personal"
    themeColor="blue"
    :headerIcon="Users"
    :cargando="cargando"
    v-model:searchQuery="busquedaUsuarios"
    searchPlaceholder="Buscar por nombre o email..."
    :showNewButton="esAdmin"
    newButtonLabel="Nuevo Usuario"
    @new-click="abrirModalCrearUsuario"
  >
    <template #title-icon>
      <Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
    </template>

    <template #custom-kpis>
      <div v-if="cargando" class="col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-32 rounded-2xl border animate-pulse bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]"></div>
      </div>
      <div v-else class="col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Resumen de Roles -->
        <div class="col-span-1 md:col-span-2 p-6 rounded-2xl border bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54] flex items-center justify-between shadow-sm group">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-500 dark:text-[#82A1B1]">Personal Registrado</p>
            <h4 class="text-4xl font-black text-[#092C4C] dark:text-white mt-1">{{ usuarios.length }}</h4>
            <div class="flex flex-wrap gap-2 mt-4">
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30">
                {{ usuarios.filter(u => u.rol === 'ADMIN').length }} Admins
              </span>
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                {{ usuarios.filter(u => u.rol === 'REPARTIDOR').length }} Repartidores
              </span>
            </div>
          </div>
          <div class="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 transition-transform group-hover:scale-110">
            <Users class="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <!-- Estatus Online -->
        <div class="p-5 rounded-2xl border bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-transparent shadow-lg shadow-blue-200 dark:shadow-none relative overflow-hidden group">
          <div class="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
             <RefreshCw class="w-24 h-24 rotate-12" />
          </div>
          <p class="text-xs font-medium opacity-80 uppercase tracking-widest text-blue-100 relative z-10">Activos Ahora</p>
          <div class="flex items-end justify-between mt-2 relative z-10">
            <span class="text-4xl font-bold">{{ usuariosActivos.filter(u => u.estaActivo).length }}</span>
            <div class="flex -space-x-2">
              <div v-for="u in usuariosActivos.filter(u => u.estaActivo).slice(0, 3)" :key="u.usuarioId" class="w-7 h-7 rounded-full border-2 border-blue-500 bg-blue-400 overflow-hidden">
                <div class="w-full h-full flex items-center justify-center text-[10px] font-bold">{{ u.nombreUsuario.substring(0,1) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl border bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54] shadow-sm flex flex-col justify-center">
          <p class="text-xs font-medium text-gray-500 dark:text-[#82A1B1] uppercase tracking-widest mb-1">Crecimiento</p>
          <div class="flex items-center gap-3">
             <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500"><TrendingUp class="w-5 h-5" /></div>
             <div>
               <p class="text-xl font-bold text-[#092C4C] dark:text-white">+{{ usuarios.filter(u => new Date(u.fechaRegistro) > new Date(Date.now() - 7*24*60*60*1000)).length }}</p>
               <p class="text-[10px] text-gray-400 dark:text-[#82A1B1]">Esta semana</p>
             </div>
          </div>
        </div>
      </div>
    </template>

    <template #header-actions>
      <button @click="exportarUsuariosPDF" class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm bg-gray-100 dark:bg-[#16181A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#374B54]" title="Exportar Usuarios PDF">
        <FileText class="w-4 h-4 text-red-500" /> <span class="hidden sm:inline">PDF</span>
      </button>
      <button @click="exportarUsuariosExcel" class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm bg-gray-100 dark:bg-[#16181A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#374B54]" title="Exportar Usuarios Excel">
        <FileSpreadsheet class="w-4 h-4 text-green-600" /> <span class="hidden sm:inline">Excel</span>
      </button>
    </template>

    <template #filters>
      <select v-model="filtroRolUsuario" class="py-2.5 px-3 text-sm border rounded-xl focus:outline-none focus:border-blue-500 transition-colors shadow-sm bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white cursor-pointer">
        <option value="">Todos los roles</option>
        <option value="ADMIN">Admin</option>
        <option value="REPARTIDOR">Repartidor</option>
      </select>
    </template>

    <template #table>
      <table class="w-full text-sm min-w-[1000px]">
        <thead>
          <tr class="border-b text-xs font-semibold uppercase tracking-wide bg-gray-50 dark:bg-[#16181A] border-gray-100 dark:border-[#374B54] text-[#9e9e9e] dark:text-[#82A1B1]">
            <th class="py-4 px-6 text-left">Usuario</th>
            <th class="py-4 px-6 text-left">Email</th>
            <th class="py-4 px-6 text-left">Rol</th>
            <th class="py-4 px-6 text-left">Teléfono</th>
            <th class="py-4 px-6 text-left">Última Conexión</th>
            <th class="py-4 px-6 text-left">Registro</th>
            <th v-if="esAdmin" class="py-4 px-6 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-[#374B54]">
          <tr v-if="usuariosFiltrados.length === 0" class="py-20 text-center">
             <td colspan="7" class="py-20 text-center">
                <Users class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-[#82A1B1]" />
                <p class="text-sm text-gray-400 dark:text-gray-500">No hay usuarios que coincidan</p>
             </td>
          </tr>
          <tr v-for="u in usuariosFiltrados" :key="u.id" class="transition-colors group hover:bg-gray-50 dark:hover:bg-[#16181A]/50" :class="usuarioViendoStats?.id === u.id ? 'bg-orange-50/60 dark:bg-[#16181A]/80' : ''">
            <td class="py-4 px-6">
              <div class="flex items-center gap-3">
                <div class="relative flex-shrink-0">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br overflow-hidden" :class="colorAvatar(u.rol)">
                    <img v-if="u.imagenUrl" :src="u.imagenUrl" class="w-full h-full object-cover" />
                    <span v-else>{{ avatarIniciales(u.nombre) }}</span>
                  </div>
                  <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex-shrink-0 border-white dark:border-[#272A30]" :class="estaOnline(u.id) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'"></span>
                </div>
                <span class="font-semibold text-sm text-[#092C4C] dark:text-white">{{ u.nombre }}</span>
              </div>
            </td>
            <td class="py-4 px-6"><span class="text-sm text-[#757575] dark:text-[#82A1B1]">{{ u.email }}</span></td>
            <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-xs font-semibold border" :class="[badgeRol(u.rol).bg, badgeRol(u.rol).text, badgeRol(u.rol).border]">{{ labelRol(u.rol) }}</span></td>
            <td class="py-4 px-6"><span class="text-sm flex items-center gap-1 text-[#757575] dark:text-[#82A1B1]"><Phone class="w-3.5 h-3.5 flex-shrink-0" v-if="u.telefono" />{{ u.telefono || '—' }}</span></td>
            <td class="py-4 px-6"><span class="text-xs flex items-center gap-1" :class="estaOnline(u.id) ? 'text-green-500 font-semibold dark:text-green-400' : 'text-[#757575] dark:text-[#82A1B1]'"><span v-if="estaOnline(u.id)" class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>{{ estaOnline(u.id) ? 'En línea' : tiempoRelativo(u.ultimaConexion) }}</span></td>
            <td class="py-4 px-6"><span class="text-xs flex items-center gap-1 text-[#9e9e9e] dark:text-gray-500"><Calendar class="w-3.5 h-3.5 flex-shrink-0" />{{ fechaRegistro(u.fechaRegistro) }}</span></td>
            <td v-if="esAdmin" class="py-4 px-6">
              <div class="flex items-center gap-1 border-transparent">
                <button @click="verEstadisticasUsuario(u)" class="p-1.5 rounded-lg transition-colors border border-transparent" :class="usuarioViendoStats?.id === u.id ? 'bg-[#E67E50] text-white' : 'text-gray-400 hover:bg-orange-50 hover:text-[#E67E50] dark:hover:bg-orange-900/20 dark:hover:text-orange-400'" title="Ver estadísticas"><BarChart2 class="w-4 h-4" /></button>
                <button @click="abrirModalEditarUsuario(u)" class="p-1.5 rounded-lg transition-colors border border-transparent text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400" title="Editar"><Pencil class="w-4 h-4" /></button>
                <button @click="usuarioEliminandoId = u.id" class="p-1.5 rounded-lg transition-colors border border-transparent text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400" title="Eliminar"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template #side>
      <Transition name="slide-panel">
        <div v-if="usuarioViendoStats" class="w-72 flex-shrink-0 rounded-2xl border shadow-sm overflow-hidden bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
          <div class="p-5 border-b flex items-center justify-between border-gray-100 dark:border-[#374B54] bg-[#f8fafc] dark:bg-[#16181A]">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br flex-shrink-0 overflow-hidden" :class="colorAvatar(usuarioViendoStats.rol)">
                <img v-if="usuarioViendoStats.imagenUrl" :src="usuarioViendoStats.imagenUrl" class="w-full h-full object-cover" />
                <span v-else>{{ avatarIniciales(usuarioViendoStats.nombre) }}</span>
              </div>
              <div class="min-w-0">
                <p class="font-bold text-sm truncate text-[#092C4C] dark:text-white">{{ usuarioViendoStats.nombre }}</p>
                <p class="text-xs truncate text-gray-500 dark:text-[#82A1B1]">{{ labelRol(usuarioViendoStats.rol) }}</p>
              </div>
            </div>
            <button @click="usuarioViendoStats = null; statsUsuarioPanel = null" class="p-1 rounded-lg flex-shrink-0 transition-colors text-gray-500 dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50"><X class="w-4 h-4" /></button>
          </div>
          <div class="p-5 space-y-4">
            <p class="text-xs font-bold uppercase tracking-wider text-[#9e9e9e] dark:text-gray-500">Rendimiento global</p>
            <div v-if="cargandoStatsUsuario" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-14 rounded-xl animate-pulse bg-gray-100 dark:bg-[#16181A]"></div>
            </div>
            <div v-else-if="!statsUsuarioPanel" class="text-center py-6">
              <p class="text-sm text-gray-400 dark:text-gray-500">Sin estadísticas disponibles</p>
            </div>
            <template v-else>
              <div class="p-4 rounded-xl flex items-center gap-4 bg-[#E67E50]/5 dark:bg-[#16181A]/50 border dark:border-[#374B54]">
                <div class="p-2.5 rounded-xl bg-[#E67E50]/15 dark:bg-[#E67E50]/10"><Package class="w-5 h-5 text-[#E67E50]" /></div>
                <div>
                  <p class="text-2xl font-bold text-[#092C4C] dark:text-white">{{ statsUsuarioPanel.entregasTotales }}</p>
                  <p class="text-xs text-[#757575] dark:text-[#82A1B1]">Entregas totales</p>
                </div>
              </div>
              <div class="p-4 rounded-xl flex items-center gap-4 bg-[#374B54]/5 dark:bg-[#16181A]/50 border dark:border-[#374B54]">
                <div class="p-2.5 rounded-xl bg-[#374B54]/15 dark:bg-[#374B54]/30"><TrendingUp class="w-5 h-5 text-[#374B54] dark:text-blue-400" /></div>
                <div>
                  <p class="text-2xl font-bold text-[#092C4C] dark:text-white">{{ statsUsuarioPanel.puntosAcumulados.toLocaleString('es-ES') }}</p>
                  <p class="text-xs text-[#757575] dark:text-[#82A1B1]">Puntos acumulados</p>
                </div>
              </div>
              <div class="p-4 rounded-xl flex items-center gap-4 bg-green-50/50 dark:bg-[#16181A]/50 border dark:border-[#374B54]">
                <div class="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30"><BarChart3 class="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                <div>
                  <p class="text-2xl font-bold text-[#092C4C] dark:text-white">{{ Number(statsUsuarioPanel.kilometrosAhorrados).toFixed(1) }}</p>
                  <p class="text-xs text-[#757575] dark:text-[#82A1B1]">Km ahorrados</p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </template>

    <template #modals>
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="usuarioModalAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" @click.self="usuarioModalAbierto = false">
            <div class="w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
              <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#374B54] bg-[#f8fafc] dark:bg-[#16181A]">
                <div>
                  <h2 class="font-bold text-lg text-[#092C4C] dark:text-white">{{ usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
                  <p class="text-xs mt-0.5 text-gray-500 dark:text-[#82A1B1]">{{ usuarioEditando ? usuarioEditando.email : 'Rellena los campos obligatorios' }}</p>
                </div>
                <button @click="usuarioModalAbierto = false" class="p-1.5 rounded-lg transition-colors text-gray-500 dark:text-[#82A1B1] hover:bg-gray-100 dark:hover:bg-[#374B54]/50"><X class="w-5 h-5" /></button>
              </div>
              <div class="px-6 py-5 space-y-4">
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Nombre *</label>
                  <input v-model="formularioUsuario.nombre" type="text" placeholder="Nombre completo" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Email *</label>
                  <input v-model="formularioUsuario.email" type="email" placeholder="usuario@moveo.com" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Teléfono</label>
                  <input v-model="formularioUsuario.telefono" type="tel" placeholder="+34 600 000 000" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Contraseña {{ usuarioEditando ? '(dejar en blanco para no cambiar)' : '*' }}</label>
                  <input v-model="formularioUsuario.password" type="password" placeholder="••••••••" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Rol *</label>
                  <select v-model="formularioUsuario.rol" class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] dark:focus:border-[#E67E50] transition-colors bg-white dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white">
                    <option value="REPARTIDOR">Repartidor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1.5 text-[#757575] dark:text-gray-300">Imagen de Perfil</label>
                  <input type="file" accept="image/*" @change="manejarArchivo" class="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#E67E50]/10 dark:file:bg-[#E67E50]/20 file:text-[#E67E50] hover:file:bg-[#E67E50]/20 dark:hover:file:bg-[#E67E50]/30 transition-colors text-[#424242] dark:text-[#82A1B1]" />
                </div>
                <div v-if="feedbackUsuario" class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" :class="feedbackUsuario === 'ok' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'">
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
            <div class="w-full max-sm rounded-2xl shadow-2xl border overflow-hidden bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
              <div class="px-6 py-6 text-center">
                <div class="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"><Trash2 class="w-7 h-7 text-red-500 dark:text-red-400" /></div>
                <h3 class="font-bold text-lg mb-2 text-[#092C4C] dark:text-white">Eliminar usuario</h3>
                <p class="text-sm mb-6 text-gray-500 dark:text-[#82A1B1]">¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.</p>
                <div class="flex gap-3">
                  <button @click="confirmarEliminarUsuario(usuarioEliminandoId!)" :disabled="eliminandoUsuario" class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">{{ eliminandoUsuario ? 'Eliminando...' : 'Sí, eliminar' }}</button>
                  <button @click="usuarioEliminandoId = null" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-gray-100 dark:bg-[#16181A] text-gray-600 dark:text-[#82A1B1] hover:bg-gray-200 dark:hover:bg-[#374B54]">Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </BaseModuleView>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-panel-enter-active, .slide-panel-leave-active { transition: all 0.25s ease; }
.slide-panel-enter-from, .slide-panel-leave-to { opacity: 0; transform: translateX(20px); }
</style>