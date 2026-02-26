<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSesionStore } from '@/tiendas/sesion'
import DashboardDemoVista from './DashboardDemoVista.vue'
import PantallaCarga from '@/componentes/PantallaCarga.vue'
import {
  Truck, Package, Users, Activity, CheckCircle2, Clock,
  AlertCircle, Zap, Bell, Search, Eye, RefreshCw, TrendingUp,
  X, BarChart3, MapPin, Wrench, Wifi, Send, Route,
  Plus, Pencil, Trash2, Gauge, Fuel, Navigation, UserCheck, Shield,
  BarChart2, Phone, Mail, Calendar, ChevronRight
} from 'lucide-vue-next'
import vehiculosServicio from '@/servicios/vehiculosServicio'
import type { CreateVehiculoDto, UpdateVehiculoDto } from '@/servicios/vehiculosServicio'
import usuarioServicio from '@/servicios/usuarioServicio'
import type { CrearUsuarioDto, ActualizarUsuarioDto } from '@/servicios/usuarioServicio'
import dashboardServicio from '@/servicios/dashboardServicio'
import type {
  EstadisticaGlobal, EntregaEstadisticasHoy, VehiculoItem,
  EntregaItem, NotificacionItem, RankingItem, EstadisticasHoy,
  ResumenSesion, MantenimientoItem, RutaItem, UsuarioItem, EstadisticaUsuario
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
const cargandoRanking = ref(false)
const rankingSortBy = ref<'entregas' | 'puntos'>('entregas')
const usuariosActivos = ref<ResumenSesion[]>([])
const mantenimientos = ref<MantenimientoItem[]>([])
const rutasActivas = ref<RutaItem[]>([])

// Estado del panel de broadcast
const mostrarBroadcast = ref(false)
const broadcastTitulo = ref('')
const broadcastMensaje = ref('')
const enviandoBroadcast = ref(false)
const broadcastFeedback = ref<'ok' | 'error' | null>(null)

// ── Estado sección Vehículos ──
const cargandoVehiculos = ref(false)
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
  matricula: '',
  marcaModelo: '',
  estado: 'DISPONIBLE',
  capacidadCarga: 0,
  consumoMedio: 0,
  kilometrajeActual: 0,
  fechaUltimaRevision: null,
})

// ── Estado sección Usuarios ──
const usuarios = ref<UsuarioItem[]>([])
const cargandoUsuarios = ref(false)
const busquedaUsuarios = ref('')
const filtroRolUsuario = ref('')
const usuarioModalAbierto = ref(false)
const usuarioEditando = ref<UsuarioItem | null>(null)
const usuarioEliminandoId = ref<number | null>(null)
const guardandoUsuario = ref(false)
const eliminandoUsuario = ref(false)
const feedbackUsuario = ref<'ok' | 'error' | null>(null)
const feedbackMensajeUsuario = ref('')
const statsUsuarioPanel = ref<EstadisticaUsuario | null>(null)
const cargandoStatsUsuario = ref(false)
const usuarioViendoStats = ref<UsuarioItem | null>(null)
const formularioUsuario = ref<CrearUsuarioDto>({
  nombre: '',
  email: '',
  password: '',
  rol: 'REPARTIDOR',
})

// KPIs calculados a partir de los datos reales
const kpis = computed(() => {
  const vehiculosEnRuta = vehiculos.value.filter(v => v.estado === 'EN_RUTA').length
  const totalVehiculos = vehiculos.value.length
  const entregasHoy = estadisticasHoyEntregas.value?.totalHoy ?? 0
  const completadasHoy = estadisticasHoyEntregas.value?.completadas ?? 0
  const eficiencia = entregasHoy > 0 ? Math.round((completadasHoy / entregasHoy) * 100) : 0
  const totalPuntos = estadisticasGlobales.value?.totalPuntosAcumulados ?? 0

  return [
    {
      icon: Truck,
      label: 'Vehículos Activos',
      value: vehiculosEnRuta.toString(),
      subtitle: `de ${totalVehiculos} en flota`,
      color: '#E67E50',
    },
    {
      icon: Package,
      label: 'Entregas Hoy',
      value: entregasHoy.toString(),
      subtitle: `${completadasHoy} completadas`,
      color: '#374B54',
    },
    {
      icon: Users,
      label: 'Total Usuarios',
      value: (estadisticasGlobales.value?.totalUsuarios ?? 0).toString(),
      subtitle: `${repartidoresActivos.value.filter(u => u.estaActivo).length} online ahora`,
      color: '#092C4C',
    },
    {
      icon: Route,
      label: 'Rutas Activas',
      value: rutasActivas.value.length.toString(),
      subtitle: 'en progreso ahora',
      color: '#E67E50',
    },
    {
      icon: TrendingUp,
      label: 'Puntos Acumulados',
      value: totalPuntos > 0 ? totalPuntos.toLocaleString('es-ES') : '—',
      subtitle: 'por toda la flota',
      color: '#374B54',
    },
    {
      icon: BarChart3,
      label: 'Km Ahorrados',
      value: estadisticasGlobales.value?.totalKilometrosAhorrados
        ? `${Number(estadisticasGlobales.value.totalKilometrosAhorrados).toFixed(0)} km`
        : '—',
      subtitle: 'optimización de rutas',
      color: '#092C4C',
    },
  ]
})

// Estado de la flota agrupado real
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

// Entregas recientes filtradas por búsqueda
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

// Notificaciones recientes — deduplicadas por título+mensaje (broadcast crea 1 fila por usuario)
const notificacionesRecientes = computed(() =>
  [...notificaciones.value]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .filter((n, i, arr) =>
      arr.findIndex(x => x.titulo === n.titulo && x.mensaje === n.mensaje) === i
    )
    .slice(0, 4)
)

// Últimos 4 mantenimientos ordenados por fecha descendente
const mantenimientosRecientes = computed(() =>
  [...mantenimientos.value]
    .sort((a, b) => new Date(b.fechaServicio).getTime() - new Date(a.fechaServicio).getTime())
    .slice(0, 4)
)

// Solo repartidores (el backend ya filtra por rol=REPARTIDOR, pero doble seguro)
const repartidoresActivos = computed(() =>
  usuariosActivos.value.filter(u => u.rol === 'REPARTIDOR')
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

function horaEntrega(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function fechaMantenimiento(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
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

// Marcar todas las notificaciones como leídas
async function marcarTodasLeidas() {
  try {
    await dashboardServicio.marcarTodasLeidas()
    notificaciones.value.forEach(n => n.leido = true)
    conteoNoLeidas.value = 0
  } catch {}
}

// Cambiar criterio del ranking y recargar
async function cambiarSortRanking(nuevoSort: 'entregas' | 'puntos') {
  if (rankingSortBy.value === nuevoSort) return
  rankingSortBy.value = nuevoSort
  cargandoRanking.value = true
  try {
    ranking.value = await dashboardServicio.obtenerRanking(5, nuevoSort)
  } catch {}
  finally {
    cargandoRanking.value = false
  }
}

// Enviar notificacion broadcast
async function enviarBroadcast() {
  if (!broadcastTitulo.value.trim() || !broadcastMensaje.value.trim()) return
  enviandoBroadcast.value = true
  broadcastFeedback.value = null
  try {
    await dashboardServicio.enviarBroadcast(broadcastTitulo.value.trim(), broadcastMensaje.value.trim())
    broadcastFeedback.value = 'ok'
    broadcastTitulo.value = ''
    broadcastMensaje.value = ''
    // Refrescar notificaciones
    dashboardServicio.obtenerTodasNotificacionesAdmin().then(d => { notificaciones.value = d }).catch(() => {})
    setTimeout(() => {
      broadcastFeedback.value = null
      mostrarBroadcast.value = false
    }, 2000)
  } catch {
    broadcastFeedback.value = 'error'
  } finally {
    enviandoBroadcast.value = false
  }
}

// Cargar todos los datos en paralelo
async function cargarDatos() {
  cargando.value = true
  try {
    const promesas: Promise<any>[] = [
      new Promise(resolve => setTimeout(resolve, 1500)), // Tiempo min. de carga para que la barra se llene
      dashboardServicio.obtenerEntregasEstadisticasHoy().then(d => { estadisticasHoyEntregas.value = d }).catch(() => {}),
      dashboardServicio.obtenerMisEstadisticasHoy().then(d => { estadisticasHoyUsuario.value = d }).catch(() => {}),
      dashboardServicio.obtenerVehiculos().then(d => { vehiculos.value = d }).catch(() => {}),
      dashboardServicio.obtenerEntregasRecientes().then(d => { entregasRecientes.value = d }).catch(() => {}),
      dashboardServicio.obtenerTodasNotificacionesAdmin().then(d => { notificaciones.value = d }).catch(() => {}),
      dashboardServicio.obtenerConteoNoLeidas().then(d => { conteoNoLeidas.value = d }).catch(() => {}),
      dashboardServicio.obtenerRanking(5, rankingSortBy.value).then(d => { ranking.value = d }).catch(() => {}),
      dashboardServicio.obtenerEstadisticasGlobales().then(d => { estadisticasGlobales.value = d }).catch(() => {}),
      dashboardServicio.obtenerUsuariosActivos('REPARTIDOR').then(d => { usuariosActivos.value = d }).catch(() => {}),
      dashboardServicio.obtenerMantenimientos().then(d => { mantenimientos.value = d }).catch(() => {}),
      dashboardServicio.obtenerRutasActivas().then(d => { rutasActivas.value = d }).catch(() => {}),
      usuarioServicio.obtenerTodos().then(d => { usuarios.value = d }).catch(() => {}),
    ]
    await Promise.all(promesas)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  if (sesionStore.estaAutenticado) cargarDatos()
})

// ── Computed Vehículos ──
const esAdmin = computed(() => sesionStore.usuario?.rol === 'ADMIN')

const vehiculosFiltrados = computed(() => {
  let lista = vehiculos.value
  if (filtroEstadoVehiculo.value) {
    lista = lista.filter(v => v.estado === filtroEstadoVehiculo.value)
  }
  const q = busquedaVehiculos.value.toLowerCase().trim()
  if (!q) return lista
  return lista.filter(v =>
    v.matricula.toLowerCase().includes(q) ||
    v.marcaModelo.toLowerCase().includes(q)
  )
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

// ── Helpers Vehículos ──
function badgeVehiculo(estado: string) {
  if (estado === 'DISPONIBLE') return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' }
  if (estado === 'EN_RUTA') return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' }
  if (estado === 'EN_MANTENIMIENTO') return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' }
  return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' }
}

function labelEstadoVehiculo(estado: string) {
  const m: Record<string, string> = {
    DISPONIBLE: 'Disponible',
    EN_RUTA: 'En Ruta',
    EN_MANTENIMIENTO: 'Mantenimiento',
    FUERA_DE_SERVICIO: 'Fuera de servicio',
  }
  return m[estado] ?? estado
}

function fechaRevision(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function abrirModalCrear() {
  vehiculoEditando.value = null
  formularioVehiculo.value = {
    matricula: '',
    marcaModelo: '',
    estado: 'DISPONIBLE',
    capacidadCarga: 0,
    consumoMedio: 0,
    kilometrajeActual: 0,
    fechaUltimaRevision: null,
  }
  feedbackVehiculo.value = null
  vehiculoModalAbierto.value = true
}

function abrirModalEditar(v: VehiculoItem) {
  vehiculoEditando.value = v
  formularioVehiculo.value = {
    matricula: v.matricula,
    marcaModelo: v.marcaModelo,
    estado: v.estado,
    capacidadCarga: v.capacidadCarga,
    consumoMedio: v.consumoMedio,
    kilometrajeActual: v.kilometrajeActual,
    fechaUltimaRevision: (v.fechaUltimaRevision ?? null)
      ? new Date(v.fechaUltimaRevision!).toISOString().split('T')[0] ?? null
      : null,
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
  } catch {
    // silencio
  } finally {
    eliminandoVehiculo.value = false
  }
}

// ── Computeds Usuarios ──
const kpisUsuarios = computed(() => {
  const total = usuarios.value.length
  const admins = usuarios.value.filter(u => u.rol === 'ADMIN').length
  const repartidores = usuarios.value.filter(u => u.rol === 'REPARTIDOR').length
  const onlineAhora = usuariosActivos.value.filter(u => u.estaActivo).length
  return [
    { icon: Users, label: 'Total Usuarios', value: total.toString(), subtitle: 'registrados en el sistema', color: '#092C4C' },
    { icon: Shield, label: 'Administradores', value: admins.toString(), subtitle: 'con acceso total', color: '#E67E50' },
    { icon: UserCheck, label: 'Repartidores', value: repartidores.toString(), subtitle: 'de la flota', color: '#374B54' },
    { icon: Wifi, label: 'Online Ahora', value: onlineAhora.toString(), subtitle: 'sesión activa', color: '#22c55e' },
  ]
})

const usuariosFiltrados = computed(() => {
  let lista = usuarios.value
  if (filtroRolUsuario.value) {
    lista = lista.filter(u => u.rol === filtroRolUsuario.value)
  }
  const q = busquedaUsuarios.value.toLowerCase().trim()
  if (!q) return lista
  return lista.filter(u =>
    u.nombre.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  )
})

// ── Helpers Usuarios ──
function avatarIniciales(nombre: string) {
  return nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}

function colorAvatar(rol: string) {
  if (rol === 'ADMIN') return 'from-[#092C4C] to-[#374B54]'
  return 'from-[#E67E50] to-[#d4603a]'
}

function badgeRol(rol: string) {
  if (rol === 'ADMIN') return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
}

function labelRol(rol: string) {
  return rol === 'ADMIN' ? 'Admin' : 'Repartidor'
}

function fechaRegistro(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function estaOnline(userId: number) {
  return usuariosActivos.value.some(u => u.usuarioId === userId && u.estaActivo)
}

// ── CRUD Usuarios ──
function abrirModalCrearUsuario() {
  usuarioEditando.value = null
  formularioUsuario.value = { nombre: '', email: '', password: '', rol: 'REPARTIDOR' }
  feedbackUsuario.value = null
  usuarioModalAbierto.value = true
}

function abrirModalEditarUsuario(u: UsuarioItem) {
  usuarioEditando.value = u
  formularioUsuario.value = {
    nombre: u.nombre,
    email: u.email,
    password: '',
    rol: u.rol,
  }
  feedbackUsuario.value = null
  usuarioModalAbierto.value = true
}

async function guardarUsuario() {
  if (!formularioUsuario.value.nombre.trim() || !formularioUsuario.value.email.trim()) return
  guardandoUsuario.value = true
  feedbackUsuario.value = null
  try {
    if (usuarioEditando.value) {
      const dto: ActualizarUsuarioDto = {
        nombre: formularioUsuario.value.nombre,
        email: formularioUsuario.value.email,
        rol: formularioUsuario.value.rol,
        password: formularioUsuario.value.password || undefined,
      }
      const actualizado = await usuarioServicio.actualizar(usuarioEditando.value.id, dto)
      const idx = usuarios.value.findIndex(u => u.id === usuarioEditando.value!.id)
      if (idx !== -1) usuarios.value[idx] = actualizado
      feedbackMensajeUsuario.value = 'Usuario actualizado'
    } else {
      const nuevo = await usuarioServicio.crear(formularioUsuario.value)
      usuarios.value.push(nuevo)
      feedbackMensajeUsuario.value = 'Usuario creado'
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
  } catch {
    // silencio
  } finally {
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
  cargandoStatsUsuario.value = true
  statsUsuarioPanel.value = null
  try {
    statsUsuarioPanel.value = await usuarioServicio.obtenerEstadisticas(u.id)
  } catch {
    statsUsuarioPanel.value = null
  } finally {
    cargandoStatsUsuario.value = false
  }
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
</script>

<template>
  <div class="animate-in fade-in duration-300">
    <!-- Pantalla de carga superpuesta -->
    <PantallaCarga v-if="cargando" />

    <!-- Si NO está autenticado, muestra el Demo -->
    <DashboardDemoVista v-if="!sesionStore.estaAutenticado" />

    <!-- Dashboard Real (Admin) -->
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

        <!-- ── SECCIÓN GENERAL ── -->
        <div v-show="seccionActiva === 'general'" class="space-y-6">

        <!-- Saludo -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm mt-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
              Resumen de operaciones — {{ new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) }}
            </p>
          </div>
          <!-- Repartidores online pill -->
          <div v-if="!cargando && usuariosActivos.length > 0"
            class="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
            :class="darkMode ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {{ repartidoresActivos.filter(u => u.estaActivo).length }} repartidores online
          </div>
        </div>

        <!-- ── KPIs ── -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <!-- Skeleton cargando -->
          <template v-if="cargando">
            <div v-for="i in 6" :key="i"
              class="p-5 rounded-2xl border animate-pulse"
              :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
              <div class="h-4 rounded w-24 mb-4" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
              <div class="h-8 rounded w-16 mb-2" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
              <div class="h-3 rounded w-32" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
            </div>
          </template>

          <!-- KPI cards reales -->
          <template v-else>
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
              <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Alertas y Notificaciones</h2>
              <div class="flex items-center gap-2">
                <template v-if="conteoNoLeidas > 0">
                  <span class="w-2 h-2 rounded-full bg-[#E67E50] animate-pulse"
                    :title="`${conteoNoLeidas} sin leer`"></span>
                  <button @click="marcarTodasLeidas"
                    class="text-xs font-medium transition-colors"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-[#424242]'">
                    Marcar todo
                  </button>
                </template>
                <!-- Botón nueva notificación -->
                <button @click="mostrarBroadcast = !mostrarBroadcast"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  :class="mostrarBroadcast
                    ? 'bg-[#E67E50] text-white'
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-[#E67E50] hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-[#E67E50] hover:text-white')">
                  <Send class="w-3.5 h-3.5" />
                  Nueva
                </button>
              </div>
            </div>

            <!-- Panel de broadcast inline -->
            <div v-if="mostrarBroadcast" class="mx-6 mb-4 p-4 rounded-xl border"
              :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-100'">
              <p class="text-xs font-bold mb-3 flex items-center gap-1.5"
                :class="darkMode ? 'text-orange-400' : 'text-[#E67E50]'">
                <Send class="w-3.5 h-3.5" />
                Notificación Global (todos los usuarios)
              </p>
              <input
                v-model="broadcastTitulo"
                type="text"
                placeholder="Título..."
                maxlength="100"
                class="w-full px-3 py-2 text-sm border rounded-lg mb-2 focus:outline-none focus:border-[#E67E50] bg-transparent transition-colors"
                :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-orange-200 text-[#424242]'"
              />
              <textarea
                v-model="broadcastMensaje"
                rows="2"
                placeholder="Mensaje para todos los repartidores..."
                maxlength="500"
                class="w-full px-3 py-2 text-sm border rounded-lg mb-3 focus:outline-none focus:border-[#E67E50] bg-transparent resize-none transition-colors"
                :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-orange-200 text-[#424242]'"
              />
              <!-- Feedback -->
              <p v-if="broadcastFeedback === 'ok'" class="text-xs text-green-500 font-semibold mb-2">✅ Notificación enviada correctamente</p>
              <p v-if="broadcastFeedback === 'error'" class="text-xs text-red-500 font-semibold mb-2">❌ Error al enviar. Inténtalo de nuevo.</p>
              <div class="flex gap-2">
                <button @click="enviarBroadcast"
                  :disabled="enviandoBroadcast || !broadcastTitulo.trim() || !broadcastMensaje.trim()"
                  class="flex-1 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  :class="darkMode ? 'bg-[#E67E50] text-white hover:bg-[#d4703f]' : 'bg-[#E67E50] text-white hover:bg-[#d4703f]'">
                  {{ enviandoBroadcast ? 'Enviando...' : 'Enviar a todos' }}
                </button>
                <button @click="mostrarBroadcast = false"
                  class="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                  :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'">
                  Cancelar
                </button>
              </div>
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
            <h2 class="font-bold text-lg mb-5" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Estado de Flota</h2>

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
                <div class="flex rounded-full overflow-hidden h-3 mb-5">
                  <div v-for="item in estadoFlota" :key="item.label"
                    class="transition-all duration-700"
                    :style="{ width: vehiculos.length > 0 ? `${(item.val / vehiculos.length) * 100}%` : '0%', backgroundColor: item.color }">
                  </div>
                </div>
                <!-- Lista -->
                <div class="space-y-3 mb-6">
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

                <!-- Mantenimientos recientes -->
                <div class="pt-4 border-t" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
                  <h3 class="text-sm font-semibold mb-3 flex items-center gap-2"
                    :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">
                    <Wrench class="w-4 h-4 text-amber-500" />
                    Mantenimientos Recientes
                  </h3>
                  <div v-if="mantenimientosRecientes.length === 0"
                    class="text-xs py-3 text-center" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                    Sin mantenimientos registrados
                  </div>
                  <div v-else class="space-y-2">
                    <div v-for="m in mantenimientosRecientes" :key="m.id"
                      class="flex items-center justify-between p-3 rounded-lg"
                      :class="darkMode ? 'bg-gray-800/60' : 'bg-gray-50'">
                      <div class="min-w-0">
                        <p class="text-xs font-semibold truncate" :class="darkMode ? 'text-white' : 'text-[#424242]'">
                          {{ m.tipoMantenimiento }}
                        </p>
                        <p class="text-[10px] mt-0.5" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                          Vehículo #{{ m.vehiculoId }} · {{ fechaMantenimiento(m.fechaServicio) }}
                        </p>
                      </div>
                      <span class="text-xs font-bold ml-3 flex-shrink-0" :class="darkMode ? 'text-amber-400' : 'text-amber-600'">
                        {{ m.coste.toFixed(0) }}€
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ranking de Repartidores -->
          <div class="rounded-2xl border shadow-sm p-6"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">

            <!-- Header con selector -->
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                Top Repartidores
              </h2>
              <!-- Selector Entregas / Puntos -->
              <div class="flex items-center gap-1 p-1 rounded-lg"
                :class="darkMode ? 'bg-gray-800' : 'bg-gray-100'">
                <button
                  @click="cambiarSortRanking('entregas')"
                  class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                  :class="rankingSortBy === 'entregas'
                    ? 'bg-[#E67E50] text-white shadow-sm'
                    : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#424242]')"
                >
                  Entregas
                </button>
                <button
                  @click="cambiarSortRanking('puntos')"
                  class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                  :class="rankingSortBy === 'puntos'
                    ? 'bg-[#E67E50] text-white shadow-sm'
                    : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#424242]')"
                >
                  Puntos
                </button>
              </div>
            </div>

            <div v-if="cargando || cargandoRanking" class="space-y-4">
              <div v-for="i in 5" :key="i"
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
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#E67E50] to-[#d4603a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                    <img v-if="r.imagenUrl" :src="r.imagenUrl" class="w-full h-full object-cover" />
                    <span v-else>{{ r.nombreUsuario.substring(0, 1).toUpperCase() }}</span>
                  </div>
                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm truncate" :class="darkMode ? 'text-white' : 'text-[#424242]'">
                      {{ r.nombreUsuario }}
                    </p>
                    <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#9e9e9e]'">
                      <template v-if="rankingSortBy === 'puntos'">
                        {{ r.entregasTotales }} entregas
                      </template>
                      <template v-else>
                        {{ r.puntos }} puntos acumulados
                      </template>
                    </p>
                  </div>
                  <!-- Valor principal según ordenación -->
                  <div class="text-right flex-shrink-0">
                    <p class="font-bold text-sm text-[#E67E50]">
                      {{ rankingSortBy === 'puntos' ? r.puntos.toLocaleString('es-ES') : r.entregasTotales }}
                    </p>
                    <p class="text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                      {{ rankingSortBy === 'puntos' ? 'puntos' : 'entregas' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Fila 4: Repartidores Online (solo ADMIN) ── -->
        <div class="rounded-2xl border shadow-sm p-6"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-bold text-lg flex items-center gap-2" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
              <Wifi class="w-5 h-5 text-green-500" />
              Repartidores Online
            </h2>
            <span class="text-sm font-medium px-3 py-1 rounded-full"
              :class="darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'">
              {{ repartidoresActivos.length }} en total · {{ repartidoresActivos.filter(u => u.estaActivo).length }} online
            </span>
          </div>

          <!-- Skeleton -->
          <div v-if="cargando" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <div v-for="i in 4" :key="i" class="h-20 rounded-xl animate-pulse"
              :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
          </div>

          <div v-else>
            <p v-if="repartidoresActivos.length === 0"
              class="text-sm py-6 text-center" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
              No hay datos de sesiones activas
            </p>
            <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div v-for="u in repartidoresActivos" :key="u.usuarioId"
                class="flex items-center gap-3 p-4 rounded-xl border transition-all"
                :class="[
                  darkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-100 bg-gray-50',
                  u.estaActivo ? '' : 'opacity-50'
                ]">
                <!-- Avatar -->
                <div class="relative flex-shrink-0">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden"
                    :style="{ background: u.estaActivo ? 'linear-gradient(135deg, #E67E50, #d4603a)' : '#9ca3af' }">
                    <img v-if="u.imagenUrl" :src="u.imagenUrl" class="w-full h-full object-cover" />
                    <span v-else>{{ u.nombreUsuario.substring(0, 1).toUpperCase() }}</span>
                  </div>
                  <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                    :class="[
                      u.estaActivo ? 'bg-green-500' : 'bg-gray-400',
                      darkMode ? 'border-[#1a2332]' : 'border-gray-50'
                    ]">
                  </span>
                </div>
                <!-- Info -->
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold truncate" :class="darkMode ? 'text-white' : 'text-[#424242]'">
                    {{ u.nombreUsuario }}
                  </p>
                  <p class="text-xs truncate" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                    {{ u.estaActivo ? 'En línea' : tiempoRelativo(u.ultimaConexion) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        </div>
        <!-- FIN SECCIÓN GENERAL -->

        <!-- ══════════════════════════════════════════════════════════
             SECCIÓN VEHÍCULOS
        ══════════════════════════════════════════════════════════ -->
        <div v-show="seccionActiva === 'vehiculos'" class="space-y-6">

          <!-- KPIs Flota -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <template v-if="cargando">
              <div v-for="i in 4" :key="i"
                class="p-5 rounded-2xl border animate-pulse"
                :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
                <div class="h-4 rounded w-24 mb-4" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
                <div class="h-8 rounded w-16 mb-2" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
                <div class="h-3 rounded w-32" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
              </div>
            </template>
            <template v-else>
              <div v-for="(kpi, i) in kpisVehiculos" :key="i"
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
            </template>
          </div>

          <!-- Barra de herramientas -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Búsqueda -->
            <div class="relative flex-1 min-w-[200px]">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="busquedaVehiculos"
                type="text"
                placeholder="Buscar por matrícula o modelo..."
                class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'"
              />
            </div>
            <!-- Filtro estado -->
            <select
              v-model="filtroEstadoVehiculo"
              class="py-2.5 px-3 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
              :class="darkMode ? 'border-gray-700 text-gray-300 bg-[#1a2332]' : 'border-gray-200 text-[#424242] bg-white'"
            >
              <option value="">Todos los estados</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="EN_MANTENIMIENTO">Mantenimiento</option>
              <option value="FUERA_DE_SERVICIO">Fuera de servicio</option>
            </select>
            <!-- Botón nuevo (solo ADMIN) -->
            <button
              v-if="esAdmin"
              @click="abrirModalCrear"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors shadow-sm"
            >
              <Plus class="w-4 h-4" />
              Nuevo Vehículo
            </button>
          </div>

          <!-- Tabla de vehículos -->
          <div class="rounded-2xl border shadow-sm overflow-hidden"
            :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">

            <!-- Skeleton -->
            <div v-if="cargando" class="p-6 space-y-3">
              <div v-for="i in 5" :key="i" class="h-14 rounded-xl animate-pulse"
                :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
            </div>

            <!-- Empty state -->
            <div v-else-if="vehiculosFiltrados.length === 0" class="py-20 text-center">
              <Truck class="w-12 h-12 mx-auto mb-3" :class="darkMode ? 'text-gray-600' : 'text-gray-300'" />
              <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">No hay vehículos que coincidan</p>
            </div>

            <!-- Tabla real -->
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b text-xs font-semibold uppercase tracking-wide"
                    :class="darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-[#9e9e9e]'">
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
                  <tr v-for="v in vehiculosFiltrados" :key="v.id"
                    class="transition-colors"
                    :class="darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'">

                    <!-- Matrícula -->
                    <td class="py-4 px-6">
                      <span class="font-bold tracking-wider text-xs px-2.5 py-1.5 rounded-lg"
                        :class="darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-[#424242]'">
                        {{ v.matricula }}
                      </span>
                    </td>

                    <!-- Marca/Modelo -->
                    <td class="py-4 px-6">
                      <p class="font-semibold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ v.marcaModelo }}</p>
                    </td>

                    <!-- Estado -->
                    <td class="py-4 px-6">
                      <span class="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold border"
                        :class="[badgeVehiculo(v.estado).bg, badgeVehiculo(v.estado).text, badgeVehiculo(v.estado).border]">
                        <span class="w-1.5 h-1.5 rounded-full" :class="badgeVehiculo(v.estado).dot"></span>
                        {{ labelEstadoVehiculo(v.estado) }}
                      </span>
                    </td>

                    <!-- Capacidad -->
                    <td class="py-4 px-6">
                      <span class="flex items-center gap-1 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#757575]'">
                        <Package class="w-3.5 h-3.5 flex-shrink-0" />
                        {{ v.capacidadCarga }} kg
                      </span>
                    </td>

                    <!-- Consumo -->
                    <td class="py-4 px-6">
                      <span class="flex items-center gap-1 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#757575]'">
                        <Fuel class="w-3.5 h-3.5 flex-shrink-0" />
                        {{ v.consumoMedio }} L/100
                      </span>
                    </td>

                    <!-- Kilometraje -->
                    <td class="py-4 px-6">
                      <span class="flex items-center gap-1 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#757575]'">
                        <Gauge class="w-3.5 h-3.5 flex-shrink-0" />
                        {{ v.kilometrajeActual.toLocaleString('es-ES') }} km
                      </span>
                    </td>

                    <!-- Última revisión -->
                    <td class="py-4 px-6">
                      <span class="flex items-center gap-1 text-sm" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                        <Clock class="w-3.5 h-3.5 flex-shrink-0" />
                        {{ fechaRevision(v.fechaUltimaRevision) }}
                      </span>
                    </td>

                    <!-- Acciones (ADMIN) -->
                    <td v-if="esAdmin" class="py-4 px-6">
                      <div class="flex items-center gap-2">
                        <button @click="abrirModalEditar(v)"
                          class="p-1.5 rounded-lg transition-colors"
                          :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'"
                          title="Editar">
                          <Pencil class="w-4 h-4" />
                        </button>
                        <button @click="vehiculoEliminandoId = v.id"
                          class="p-1.5 rounded-lg transition-colors"
                          :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'"
                          title="Eliminar">
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pie de tabla -->
            <div v-if="!cargando && vehiculosFiltrados.length > 0"
              class="px-6 py-3 border-t text-xs"
              :class="darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'">
              Mostrando {{ vehiculosFiltrados.length }} de {{ vehiculos.length }} vehículos
            </div>
          </div>
        </div>
        <!-- FIN SECCIÓN VEHÍCULOS -->

        <!-- ══════════════════════════════════════════════════════════
             SECCIÓN USUARIOS
        ══════════════════════════════════════════════════════════ -->
        <div v-show="seccionActiva === 'usuarios'" class="space-y-6">

          <!-- KPIs Usuarios -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <template v-if="cargando">
              <div v-for="i in 4" :key="i"
                class="p-5 rounded-2xl border animate-pulse"
                :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
                <div class="h-4 rounded w-24 mb-4" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
                <div class="h-8 rounded w-16 mb-2" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
                <div class="h-3 rounded w-32" :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
              </div>
            </template>
            <template v-else>
              <div v-for="(kpi, i) in kpisUsuarios" :key="i"
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
            </template>
          </div>

          <!-- Toolbar -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative flex-1 min-w-[200px]">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="busquedaUsuarios"
                type="text"
                placeholder="Buscar por nombre o email..."
                class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                :class="darkMode ? 'border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'"
              />
            </div>
            <select
              v-model="filtroRolUsuario"
              class="py-2.5 px-3 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
              :class="darkMode ? 'border-gray-700 text-gray-300 bg-[#1a2332]' : 'border-gray-200 text-[#424242] bg-white'"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Admin</option>
              <option value="REPARTIDOR">Repartidor</option>
            </select>
            <button
              v-if="esAdmin"
              @click="abrirModalCrearUsuario"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors shadow-sm"
            >
              <Plus class="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>

          <!-- Tabla + Panel Stats en grid -->
          <div class="flex gap-6" :class="usuarioViendoStats ? 'items-start' : ''">

            <!-- Tabla usuarios -->
            <div class="flex-1 rounded-2xl border shadow-sm overflow-hidden min-w-0"
              :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">

              <!-- Skeleton -->
              <div v-if="cargando" class="p-6 space-y-3">
                <div v-for="i in 5" :key="i" class="h-16 rounded-xl animate-pulse"
                  :class="darkMode ? 'bg-gray-700' : 'bg-gray-50'"></div>
              </div>

              <!-- Empty -->
              <div v-else-if="usuariosFiltrados.length === 0" class="py-20 text-center">
                <Users class="w-12 h-12 mx-auto mb-3" :class="darkMode ? 'text-gray-600' : 'text-gray-300'" />
                <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">No hay usuarios que coincidan</p>
              </div>

              <!-- Tabla real -->
              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b text-xs font-semibold uppercase tracking-wide"
                      :class="darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-[#9e9e9e]'">
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
                    <tr v-for="u in usuariosFiltrados" :key="u.id"
                      class="transition-colors"
                      :class="[
                        darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50',
                        usuarioViendoStats?.id === u.id ? (darkMode ? 'bg-gray-800/70' : 'bg-orange-50/60') : ''
                      ]">

                      <!-- Avatar + Nombre -->
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                          <div class="relative flex-shrink-0">
                            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br overflow-hidden"
                              :class="colorAvatar(u.rol)">
                              <img v-if="u.imagenUrl" :src="u.imagenUrl" class="w-full h-full object-cover" />
                              <span v-else>{{ avatarIniciales(u.nombre) }}</span>
                            </div>
                            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex-shrink-0"
                              :class="[
                                estaOnline(u.id) ? 'bg-green-500' : 'bg-gray-300',
                                darkMode ? 'border-[#1a2332]' : 'border-white'
                              ]"></span>
                          </div>
                          <span class="font-semibold text-sm" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                            {{ u.nombre }}
                          </span>
                        </div>
                      </td>

                      <!-- Email -->
                      <td class="py-4 px-6">
                        <span class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ u.email }}</span>
                      </td>

                      <!-- Rol badge -->
                      <td class="py-4 px-6">
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                          :class="[badgeRol(u.rol).bg, badgeRol(u.rol).text, badgeRol(u.rol).border]">
                          {{ labelRol(u.rol) }}
                        </span>
                      </td>

                      <!-- Teléfono -->
                      <td class="py-4 px-6">
                        <span class="text-sm flex items-center gap-1" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                          <Phone class="w-3.5 h-3.5 flex-shrink-0" v-if="u.telefono" />
                          {{ u.telefono || '—' }}
                        </span>
                      </td>

                      <!-- Última conexión -->
                      <td class="py-4 px-6">
                        <span class="text-xs flex items-center gap-1"
                          :class="estaOnline(u.id) ? 'text-green-500 font-semibold' : (darkMode ? 'text-gray-400' : 'text-[#757575]')">
                          <span v-if="estaOnline(u.id)" class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                          {{ estaOnline(u.id) ? 'En línea' : tiempoRelativo(u.ultimaConexion) }}
                        </span>
                      </td>

                      <!-- Fecha registro -->
                      <td class="py-4 px-6">
                        <span class="text-xs flex items-center gap-1" :class="darkMode ? 'text-gray-400' : 'text-[#9e9e9e]'">
                          <Calendar class="w-3.5 h-3.5 flex-shrink-0" />
                          {{ fechaRegistro(u.fechaRegistro) }}
                        </span>
                      </td>

                      <!-- Acciones -->
                      <td v-if="esAdmin" class="py-4 px-6">
                        <div class="flex items-center gap-1">
                          <!-- Ver stats -->
                          <button @click="verEstadisticasUsuario(u)"
                            class="p-1.5 rounded-lg transition-colors"
                            :class="usuarioViendoStats?.id === u.id
                              ? 'bg-[#E67E50] text-white'
                              : (darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-orange-50 text-gray-400 hover:text-[#E67E50]')"
                            title="Ver estadísticas">
                            <BarChart2 class="w-4 h-4" />
                          </button>
                          <!-- Editar -->
                          <button @click="abrirModalEditarUsuario(u)"
                            class="p-1.5 rounded-lg transition-colors"
                            :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'"
                            title="Editar">
                            <Pencil class="w-4 h-4" />
                          </button>
                          <!-- Eliminar -->
                          <button @click="usuarioEliminandoId = u.id"
                            class="p-1.5 rounded-lg transition-colors"
                            :class="darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'"
                            title="Eliminar">
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pie de tabla -->
              <div v-if="!cargando && usuariosFiltrados.length > 0"
                class="px-6 py-3 border-t text-xs"
                :class="darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'">
                Mostrando {{ usuariosFiltrados.length }} de {{ usuarios.length }} usuarios
              </div>
            </div>

            <!-- Panel de Estadísticas -->
            <Transition name="slide-panel">
              <div v-if="usuarioViendoStats"
                class="w-72 flex-shrink-0 rounded-2xl border shadow-sm overflow-hidden"
                :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">

                <!-- Cabecera panel -->
                <div class="p-5 border-b flex items-center justify-between"
                  :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br flex-shrink-0 overflow-hidden"
                      :class="colorAvatar(usuarioViendoStats.rol)">
                      <img v-if="usuarioViendoStats.imagenUrl" :src="usuarioViendoStats.imagenUrl" class="w-full h-full object-cover" />
                      <span v-else>{{ avatarIniciales(usuarioViendoStats.nombre) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-sm truncate" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                        {{ usuarioViendoStats.nombre }}
                      </p>
                      <p class="text-xs truncate" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ labelRol(usuarioViendoStats.rol) }}
                      </p>
                    </div>
                  </div>
                  <button @click="usuarioViendoStats = null; statsUsuarioPanel = null"
                    class="p-1 rounded-lg flex-shrink-0 transition-colors"
                    :class="darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'">
                    <X class="w-4 h-4" />
                  </button>
                </div>

                <!-- Estadísticas -->
                <div class="p-5 space-y-4">
                  <p class="text-xs font-bold uppercase tracking-wider"
                    :class="darkMode ? 'text-gray-500' : 'text-[#9e9e9e]'">
                    Rendimiento global
                  </p>

                  <!-- Skeleton -->
                  <div v-if="cargandoStatsUsuario" class="space-y-3">
                    <div v-for="i in 3" :key="i" class="h-14 rounded-xl animate-pulse"
                      :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'"></div>
                  </div>

                  <!-- Sin datos -->
                  <div v-else-if="!statsUsuarioPanel" class="text-center py-6">
                    <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                      Sin estadísticas disponibles
                    </p>
                  </div>

                  <!-- Datos reales -->
                  <template v-else>
                    <div class="p-4 rounded-xl flex items-center gap-4"
                      :class="darkMode ? 'bg-gray-800/60' : 'bg-[#E67E50]/8'">
                      <div class="p-2.5 rounded-xl bg-[#E67E50]/15">
                        <Package class="w-5 h-5 text-[#E67E50]" />
                      </div>
                      <div>
                        <p class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                          {{ statsUsuarioPanel.entregasTotales }}
                        </p>
                        <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Entregas totales</p>
                      </div>
                    </div>

                    <div class="p-4 rounded-xl flex items-center gap-4"
                      :class="darkMode ? 'bg-gray-800/60' : 'bg-[#374B54]/8'">
                      <div class="p-2.5 rounded-xl bg-[#374B54]/15">
                        <TrendingUp class="w-5 h-5 text-[#374B54]" :class="darkMode ? '!text-blue-400' : ''" />
                      </div>
                      <div>
                        <p class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                          {{ statsUsuarioPanel.puntosAcumulados.toLocaleString('es-ES') }}
                        </p>
                        <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Puntos acumulados</p>
                      </div>
                    </div>

                    <div class="p-4 rounded-xl flex items-center gap-4"
                      :class="darkMode ? 'bg-gray-800/60' : 'bg-green-50'">
                      <div class="p-2.5 rounded-xl bg-green-100">
                        <BarChart3 class="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                          {{ Number(statsUsuarioPanel.kilometrosAhorrados).toFixed(1) }}
                        </p>
                        <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Km ahorrados</p>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </Transition>
          </div>

        </div>
        <!-- FIN SECCIÓN USUARIOS -->

      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       MODAL CREAR / EDITAR VEHÍCULO
  ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="vehiculoModalAbierto"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
        @click.self="vehiculoModalAbierto = false">
        <div
          class="w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden"
          :class="darkMode ? 'bg-[#111827] border-gray-700' : 'bg-white border-gray-200'">

          <!-- Cabecera modal -->
          <div class="flex items-center justify-between px-6 py-5 border-b"
            :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl" :class="darkMode ? 'bg-orange-900/30' : 'bg-orange-50'">
                <Truck class="w-5 h-5 text-[#E67E50]" />
              </div>
              <h3 class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                {{ vehiculoEditando ? 'Editar Vehículo' : 'Nuevo Vehículo' }}
              </h3>
            </div>
            <button @click="vehiculoModalAbierto = false"
              class="p-1.5 rounded-lg transition-colors"
              :class="darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Cuerpo del formulario -->
          <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

            <!-- Fila 1: Matrícula + Marca/Modelo -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                  Matrícula *
                </label>
                <input
                  v-model="formularioVehiculo.matricula"
                  type="text"
                  placeholder="ej: 1234 ABC"
                  class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent uppercase"
                  :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                  Marca / Modelo *
                </label>
                <input
                  v-model="formularioVehiculo.marcaModelo"
                  type="text"
                  placeholder="ej: Renault Kangoo"
                  class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                  :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'"
                />
              </div>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                Estado
              </label>
              <select
                v-model="formularioVehiculo.estado"
                class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                :class="darkMode ? 'border-gray-600 text-white bg-[#111827]' : 'border-gray-200 text-[#424242] bg-white'">
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="FUERA_DE_SERVICIO">Fuera de servicio</option>
              </select>
            </div>

            <!-- Fila 2: Capacidad + Consumo -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                  Capacidad de carga (kg)
                </label>
                <input
                  v-model.number="formularioVehiculo.capacidadCarga"
                  type="number" min="0" step="0.1"
                  class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                  :class="darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-[#424242]'"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                  Consumo medio (L/100km)
                </label>
                <input
                  v-model.number="formularioVehiculo.consumoMedio"
                  type="number" min="0" step="0.1"
                  class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                  :class="darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-[#424242]'"
                />
              </div>
            </div>

            <!-- Fila 3: Kilometraje + Última revisión -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                  Kilometraje actual (km)
                </label>
                <input
                  v-model.number="formularioVehiculo.kilometrajeActual"
                  type="number" min="0"
                  class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                  :class="darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-[#424242]'"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                  Última revisión
                </label>
                <input
                  v-model="formularioVehiculo.fechaUltimaRevision"
                  type="date"
                  class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                  :class="darkMode ? 'border-gray-600 text-gray-300 bg-[#111827]' : 'border-gray-200 text-[#424242]'"
                />
              </div>
            </div>

            <!-- Feedback -->
            <p v-if="feedbackVehiculo === 'ok'" class="flex items-center gap-1.5 text-xs text-green-500 font-semibold">
              <CheckCircle2 class="w-4 h-4" /> {{ feedbackMensaje }}
            </p>
            <p v-if="feedbackVehiculo === 'error'" class="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
              <AlertCircle class="w-4 h-4" /> {{ feedbackMensaje }}
            </p>
          </div>

          <!-- Pie del modal -->
          <div class="px-6 py-4 flex gap-3 border-t"
            :class="darkMode ? 'border-gray-700 bg-[#0d1422]' : 'border-gray-100 bg-gray-50'">
            <button
              @click="guardarVehiculo"
              :disabled="guardandoVehiculo || !formularioVehiculo.matricula.trim() || !formularioVehiculo.marcaModelo.trim()"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 bg-[#E67E50] text-white hover:bg-[#d4703f]">
              {{ guardandoVehiculo ? 'Guardando...' : (vehiculoEditando ? 'Guardar Cambios' : 'Crear Vehículo') }}
            </button>
            <button
              @click="vehiculoModalAbierto = false"
              class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════════════════════════
       CONFIRMACIÓN ELIMINAR VEHÍCULO
  ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="vehiculoEliminandoId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
        @click.self="vehiculoEliminandoId = null">
        <div
          class="w-full max-w-sm rounded-2xl shadow-2xl border p-6"
          :class="darkMode ? 'bg-[#111827] border-gray-700' : 'bg-white border-gray-200'">
          <div class="flex flex-col items-center text-center gap-4">
            <div class="w-14 h-14 rounded-full flex items-center justify-center bg-red-50">
              <Trash2 class="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 class="text-lg font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">¿Eliminar vehículo?</h3>
              <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                Esta acción no se puede deshacer. El vehículo será eliminado permanentemente del sistema.
              </p>
            </div>
            <div class="flex gap-3 w-full">
              <button
                @click="confirmarEliminar(vehiculoEliminandoId!)"
                :disabled="eliminandoVehiculo"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {{ eliminandoVehiculo ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
              <button
                @click="vehiculoEliminandoId = null"
                class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>


  <!-- ══════════════════════════════════════════════════════════
       MODAL CREAR / EDITAR USUARIO
  ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="usuarioModalAbierto"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
        @click.self="usuarioModalAbierto = false">
        <div
          class="w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">

          <!-- Cabecera -->
          <div class="flex items-center justify-between px-6 py-5 border-b"
            :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
            <div>
              <h2 class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                {{ usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario' }}
              </h2>
              <p class="text-xs mt-0.5" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                {{ usuarioEditando ? usuarioEditando.email : 'Rellena los campos obligatorios' }}
              </p>
            </div>
            <button @click="usuarioModalAbierto = false"
              class="p-1.5 rounded-lg transition-colors"
              :class="darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Formulario -->
          <div class="px-6 py-5 space-y-4">

            <!-- Nombre -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Nombre *</label>
              <input v-model="formularioUsuario.nombre" type="text" placeholder="Nombre completo"
                class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Email *</label>
              <input v-model="formularioUsuario.email" type="email" placeholder="usuario@moveo.com"
                class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">
                Contraseña {{ usuarioEditando ? '(dejar en blanco para no cambiar)' : '*' }}
              </label>
              <input v-model="formularioUsuario.password" type="password" placeholder="••••••••"
                class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors bg-transparent"
                :class="darkMode ? 'border-gray-600 text-white placeholder-gray-500' : 'border-gray-200 text-[#424242]'" />
            </div>

            <!-- Rol -->
            <div>
              <label class="block text-xs font-semibold mb-1.5" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">Rol *</label>
              <select v-model="formularioUsuario.rol"
                class="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#E67E50] transition-colors"
                :class="darkMode ? 'border-gray-600 text-white bg-[#1a2332]' : 'border-gray-200 text-[#424242] bg-white'">
                <option value="REPARTIDOR">Repartidor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <!-- Feedback -->
            <div v-if="feedbackUsuario" class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
              :class="feedbackUsuario === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
              <CheckCircle2 v-if="feedbackUsuario === 'ok'" class="w-4 h-4" />
              <AlertCircle v-else class="w-4 h-4" />
              {{ feedbackMensajeUsuario }}
            </div>

            <!-- Botón -->
            <button @click="guardarUsuario"
              :disabled="guardandoUsuario || !formularioUsuario.nombre.trim() || !formularioUsuario.email.trim()"
              class="w-full py-2.5 rounded-xl text-sm font-bold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <RefreshCw v-if="guardandoUsuario" class="w-4 h-4 animate-spin" />
              {{ guardandoUsuario ? 'Guardando...' : (usuarioEditando ? 'Actualizar' : 'Crear Usuario') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══════════════════════════════════════════════════════════
       MODAL CONFIRMAR ELIMINAR USUARIO
  ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="usuarioEliminandoId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
        @click.self="usuarioEliminandoId = null">
        <div class="w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="px-6 py-6 text-center">
            <div class="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 class="w-7 h-7 text-red-500" />
            </div>
            <h3 class="font-bold text-lg mb-2" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Eliminar usuario</h3>
            <p class="text-sm mb-6" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
              ¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div class="flex gap-3">
              <button
                @click="confirmarEliminarUsuario(usuarioEliminandoId!)"
                :disabled="eliminandoUsuario"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {{ eliminandoUsuario ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
              <button @click="usuarioEliminandoId = null"
                class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.25s ease;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
