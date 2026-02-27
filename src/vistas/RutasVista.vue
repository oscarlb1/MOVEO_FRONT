<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Map, Route, Truck, Package, Clock, Calendar, CheckCircle2,
  AlertCircle, Search, Eye, Filter, Loader2, Play, Square,
  MapPin, Check, ChevronRight, Share2, Printer, Plus, Trash2, Edit, X,
  RefreshCw, Navigation, FileText, FileSpreadsheet
} from 'lucide-vue-next';
import rutasServicio from '@/servicios/rutasServicio';
import vehiculosServicio from '@/servicios/vehiculosServicio';
import usuarioServicio from '@/servicios/usuarioServicio';
import clientesServicio from '@/servicios/clientesServicio';
import entregasServicio from '@/servicios/entregasServicio';
import ubicacionServicio from '@/servicios/ubicacionServicio';
import exportadorServicio from '@/servicios/exportadorServicio';
import type { RutaDto, RutaDetalleDto, RutaEstadisticasDto, EntregaDto, CrearRutaDto, CrearEntregaDto } from '@/modelos/Ruta';
import type { VehiculoItem } from '@/modelos/Dashboard';
import type { UsuarioItem } from '@/modelos/Dashboard';
import type { ClienteDto } from '@/modelos/Ruta';
import type { UbicacionDto } from '@/servicios/ubicacionServicio';
import { toast } from 'vue-sonner';

const props = defineProps<{
  darkMode: boolean
}>();

// Estado
const cargando = ref(true);
const cargandoDetalle = ref(false);
const rutas = ref<RutaDto[]>([]);
const rutaSeleccionada = ref<RutaDetalleDto | null>(null);

// Función auxiliar para obtener la fecha de la ubicación (maneja diferentes nombres de propiedad del backend)
function obtenerFechaUbicacion(ub: UbicacionDto | null): Date | null {
  if (!ub) return null;
  const fechaStr = ub.timestamp || ub.fecha || ub.fechaHora;
  if (!fechaStr) return null;
  const date = new Date(fechaStr);
  return isNaN(date.getTime()) ? null : date;
}
const estadisticas = ref<RutaEstadisticasDto | null>(null);
const rutaMetrics = ref<{distanciaKm: number; duracionMin: number} | null>(null);

// Ubicacion state
const historialUbicaciones = ref<UbicacionDto[]>([]);
const ultimaUbicacion = ref<UbicacionDto | null>(null);
const recargandoUbicacion = ref(false);

// Filtros
const filtroEstado = ref('');
const busqueda = ref('');

// --- MODALES Y CRUD ---
const mostrarModalRuta = ref(false);
const editandoRutaId = ref<number | null>(null);
const rutaFormData = ref<CrearRutaDto>({
  fecha: new Date().toISOString().split('T')[0] || '',
  conductorId: 0,
  vehiculoId: 0,
  estado: 'PENDIENTE',
  distanciaTotalEstimada: 0
});

const mostrarModalEntrega = ref(false);
const entregaFormData = ref<CrearEntregaDto>({
  rutaId: 0,
  clienteId: 0,
  ordenParada: 1,
  notas: ''
});

const rutaEliminandoId = ref<number | null>(null);
const eliminandoRuta = ref(false);
const entregaEliminandoId = ref<number | null>(null);
const eliminandoEntrega = ref(false);

// Selects options
const vehiculosDisponibles = ref<VehiculoItem[]>([]);
const conductoresDisponibles = ref<UsuarioItem[]>([]);
const clientesDisponibles = ref<ClienteDto[]>([]);

// Mapa
let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let routeLine: L.Polyline | null = null;

// Referencia al contenedor del mapa
const mapContainer = ref<HTMLElement | null>(null);

// Computeds
const rutasFiltradas = computed(() => {
  let resultado = rutas.value;
  if (filtroEstado.value) {
    resultado = resultado.filter(r => r.estado === filtroEstado.value);
  }
  if (busqueda.value) {
    const q = busqueda.value.toLowerCase();
    resultado = resultado.filter(r => 
      r.id.toString().includes(q) ||
      r.nombreConductor.toLowerCase().includes(q) ||
      r.matriculaVehiculo.toLowerCase().includes(q)
    );
  }
  return resultado;
});

const kpis = computed(() => {
  if (!estadisticas.value) return [];
  return [
    { label: 'Total Rutas', value: estadisticas.value.totalRutas, icon: Route, color: '#E67E50' },
    { label: 'En Progreso', value: estadisticas.value.enProgreso, icon: Play, color: '#3b82f6' },
    { label: 'Completadas', value: estadisticas.value.completadas, icon: CheckCircle2, color: '#22c55e' },
    { label: 'Planificadas', value: estadisticas.value.planificadas, icon: Calendar, color: '#f59e0b' },
  ];
});

// Inicialización de Leaflet
function initMap() {
  if (!mapContainer.value) return;
  
  // Iconos por defecto de Leaflet arreglados para vite
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  map = L.map(mapContainer.value).setView([40.4168, -3.7038], 6); // Centro de España por defecto
  
  L.tileLayer(
    props.darkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
    {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }
  ).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

// Carga inicial
async function cargarDatosGenerales() {
  cargando.value = true;
  try {
    const [rutasData, statsData, vehiculosData, conductoresData, clientesData] = await Promise.all([
      rutasServicio.obtenerTodas(),
      rutasServicio.obtenerEstadisticas(),
      vehiculosServicio.obtenerTodos(),
      usuarioServicio.obtenerTodos(),
      clientesServicio.obtenerTodos()
    ]);
    rutas.value = rutasData;
    estadisticas.value = statsData;
    vehiculosDisponibles.value = vehiculosData;
    
    // Filtrar solo los repartidores o admins que puedan conducir
    conductoresDisponibles.value = conductoresData.filter(u => u.rol === 'REPARTIDOR' || u.rol === 'ADMIN');
    clientesDisponibles.value = clientesData;
  } catch (error) {
    toast.error('Error al cargar datos de rutas');
  } finally {
    cargando.value = false;
  }
}

// --- LLAMADA A OSRM PARA RUTAS POR CARRETERA ---
async function obtenerRutaOSRM(coordenadas: [number, number][]) {
  if (coordenadas.length < 2) return null;
  
  // OSRM espera lng,lat
  const coordsString = coordenadas.map(c => `${c[1]},${c[0]}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes.length > 0) {
      return data.routes[0];
    }
    return null;
  } catch (error) {
    console.error("Error Obteniendo Ruta OSRM:", error);
    return null;
  }
}

// Dibujar ruta en el mapa
async function dibujarRutaMapa(entregas: EntregaDto[]) {
  if (!map || !markersLayer) return;
  
  markersLayer.clearLayers();
  if (routeLine) {
    map.removeLayer(routeLine);
  }

  // Filtrar clientes válidos
  const puntosValidos = entregas
    .filter(e => e.cliente && e.cliente.latitud && e.cliente.longitud)
    .sort((a, b) => a.ordenParada - b.ordenParada);

  if (puntosValidos.length === 0) {
    rutaMetrics.value = null;
    return;
  }

  const coordinates: [number, number][] = [];
  const bounds = L.latLngBounds([]);

  // Usar un registro para llevar la cuenta de ubicaciones idénticas y separarlas un poquito
  const seenCoords: Record<string, number> = {};

  puntosValidos.forEach((entrega, index) => {
    let lat = entrega.cliente!.latitud!;
    let lng = entrega.cliente!.longitud!;
    
    // Si la misma ubicación ya existe, la desplazamos mínimamente (~5-10 metros en el mapa)
    // para que el circulito 1 no se esconda debajo del circulito 2
    const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (seenCoords[coordKey]) {
      const offsetCount = seenCoords[coordKey];
      seenCoords[coordKey] = offsetCount + 1;
      // Offset de approx ~10 metros a la derecha/abajo
      lat -= (0.0001 * offsetCount);
      lng += (0.0001 * offsetCount);
    } else {
      seenCoords[coordKey] = 1;
    }
    
    // Crear marcador numerado (con DivIcon)
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${entrega.estado === 'ENTREGADO' ? '#22c55e' : '#E67E50'}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 1000;">${index + 1}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker([lat, lng], { icon }).addTo(markersLayer!);
    marker.bindPopup(`
      <div style="font-family: inherit; min-width: 150px;">
        <strong style="font-size: 14px; display: block; margin-bottom: 4px; color: ${entrega.estado === 'ENTREGADO' ? '#22c55e' : '#E67E50'};">Parada ${index + 1}</strong>
        <p style="margin: 0; font-size: 14px; font-weight: 600;">${entrega.cliente!.nombreEmpresa}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${entrega.cliente!.direccion}</p>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; font-weight: 600; color: #888;">
           ESTADO: <span style="color: ${entrega.estado === 'ENTREGADO' ? '#22c55e' : (entrega.estado === 'PENDIENTE' ? '#E67E50' : '#888')}">${entrega.estado}</span>
        </div>
      </div>
    `);

    coordinates.push([lat, lng]);
    bounds.extend([lat, lng]);
  });

  if (coordinates.length > 1) {
    // 1. Intentar obtener ruta real de OSRM
    const osrmData = await obtenerRutaOSRM(coordinates);
    
    if (osrmData && osrmData.geometry && osrmData.geometry.coordinates) {
      // OSRM devuelve [lng, lat], Leaflet usa [lat, lng]
      const latLngs = osrmData.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      
      routeLine = L.polyline(latLngs as any, {
        color: '#E67E50',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Calcular métricas
      rutaMetrics.value = {
        distanciaKm: +(osrmData.distance / 1000).toFixed(1),
        duracionMin: Math.ceil(osrmData.duration / 60)
      };

    } else {
      // Fallback a línea recta
      routeLine = L.polyline(coordinates, {
        color: '#E67E50',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round'
      }).addTo(map);
      rutaMetrics.value = null; // No tenemos routing real
    }
  } else {
      rutaMetrics.value = null;
  }

  // === DIBUJAR RUTA REAL (HISTORIAL UBICACIONES) ===
  if (historialUbicaciones.value.length > 1) {
    const realCoords: [number, number][] = historialUbicaciones.value.map(u => [u.latitud, u.longitud]);
    L.polyline(realCoords, {
      color: '#3b82f6', // Azul para ruta real
      weight: 5,
      opacity: 0.7,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    realCoords.forEach(c => bounds.extend(c));
  }

  // === DIBUJAR ÚLTIMA UBICACIÓN ===
  if (ultimaUbicacion.value) {
    const truckIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #3b82f6; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 2000;">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    
    const fechaObj = obtenerFechaUbicacion(ultimaUbicacion.value);
    const fechaFormat = fechaObj ? fechaObj.toLocaleTimeString() : 'Desconocida';
    
    L.marker([ultimaUbicacion.value.latitud, ultimaUbicacion.value.longitud], { icon: truckIcon, zIndexOffset: 1000 }).addTo(map!)
      .bindPopup(`
        <div style="font-family: inherit; min-width: 150px;">
          <strong style="font-size: 14px; display: block; margin-bottom: 4px; color: #3b82f6;">Última Ubicación</strong>
          <p style="margin: 0; font-size: 12px; color: #666;">Registrada: ${fechaFormat}</p>
        </div>
      `);
    bounds.extend([ultimaUbicacion.value.latitud, ultimaUbicacion.value.longitud]);
  }

  if (puntosValidos.length > 0 || historialUbicaciones.value.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }
}

// Seleccionar ruta
async function seleccionarRuta(id: number) {
  cargandoDetalle.value = true;
  historialUbicaciones.value = [];
  ultimaUbicacion.value = null;
  try {
    const [detalle, historial, ultima] = await Promise.all([
      rutasServicio.obtenerPorId(id),
      ubicacionServicio.obtenerHistorialPorRuta(id).catch(() => []),
      ubicacionServicio.obtenerUltimaConocida(id).catch(() => null)
    ]);
    rutaSeleccionada.value = detalle;
    historialUbicaciones.value = historial || [];
    ultimaUbicacion.value = ultima;
    console.log("ULTIMA UBICACIÓN:", ultima);
  } catch (error) {
    toast.error('Error al cargar detalle de ruta');
  } finally {
    cargandoDetalle.value = false;
  }
  
  // Esperar a que el DOM se actualice y el spinner desaparezca, mostrando el contenedor del mapa
  await nextTick();
  
  if (rutaSeleccionada.value) {
    // Si ya hay un mapa creado pero el DOM se destruyó por el cargando, destrúyelo y re-crealo
    if (map) {
      map.remove();
      map = null;
      routeLine = null;
      markersLayer = null;
    }
    
    initMap();
    
    if (map) {
      setTimeout(async () => {
        if (map) {
          map.invalidateSize();
          await dibujarRutaMapa(rutaSeleccionada.value!.entregas);
        }
      }, 50);
    }
  }
}

// Helpers visuales
function badgeEstado(estado: string) {
  if (estado === 'COMPLETADA') return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
  if (estado === 'EN_CURSO') return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  if (estado === 'PENDIENTE') return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
  return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
}

// Recargar Ubicacion Especifica
async function recargarUbicacion() {
  if (!rutaSeleccionada.value) return;
  recargandoUbicacion.value = true;
  try {
    const [historial, ultima] = await Promise.all([
      ubicacionServicio.obtenerHistorialPorRuta(rutaSeleccionada.value.id).catch(() => []),
      ubicacionServicio.obtenerUltimaConocida(rutaSeleccionada.value.id).catch(() => null)
    ]);
    historialUbicaciones.value = historial || [];
    ultimaUbicacion.value = ultima;
    
    // Redibujar mapa si es posible
    if (map && rutaSeleccionada.value) {
      dibujarRutaMapa(rutaSeleccionada.value.entregas);
    }
    toast.success('Ubicación actualizada');
  } catch (error) {
    toast.error('Error al actualizar ubicación');
  } finally {
    recargandoUbicacion.value = false;
  }
}

// --- OPERACIONES CRUD ---

function abrirModalNuevaRuta() {
  editandoRutaId.value = null;
  rutaFormData.value = {
    fecha: new Date().toISOString().split('T')[0] || '',
    conductorId: 0,
    vehiculoId: 0,
    estado: 'PENDIENTE',
    distanciaTotalEstimada: 0
  };
  mostrarModalRuta.value = true;
}

function abrirModalEditarRuta(ruta: RutaDetalleDto) {
  editandoRutaId.value = ruta.id;
  rutaFormData.value = {
    fecha: ruta.fecha.split('T')[0] || '',
    conductorId: ruta.conductorId,
    vehiculoId: ruta.vehiculoId,
    estado: ruta.estado,
    distanciaTotalEstimada: ruta.distanciaTotalEstimada
  };
  mostrarModalRuta.value = true;
}

async function guardarRuta() {
  if (!rutaFormData.value.conductorId || !rutaFormData.value.vehiculoId || !rutaFormData.value.fecha) {
    toast.error('Por favor, completa todos los campos requeridos');
    return;
  }
  
  // Convertir string YYYY-MM-DD a ISO 8601 con tiempo
  const payload = { ...rutaFormData.value };
  payload.fecha = new Date(payload.fecha).toISOString();

  try {
    if (editandoRutaId.value) {
      await rutasServicio.actualizar(editandoRutaId.value, payload);
      toast.success('Ruta actualizada exitosamente');
      if (rutaSeleccionada.value?.id === editandoRutaId.value) {
        seleccionarRuta(editandoRutaId.value);
      }
    } else {
      await rutasServicio.crear(payload);
      toast.success('Ruta creada exitosamente');
    }
    mostrarModalRuta.value = false;
    cargarDatosGenerales();
  } catch (err) {
    toast.error('Error al guardar la ruta');
  }
}

async function confirmarEliminarRuta(id: number) {
  rutaEliminandoId.value = id;
}

async function ejecutarEliminarRuta() {
  if (rutaEliminandoId.value === null) return;
  const id = rutaEliminandoId.value;
  eliminandoRuta.value = true;
  try {
    await rutasServicio.eliminar(id);
    toast.success('Ruta eliminada');
    if (rutaSeleccionada.value?.id === id) {
      rutaSeleccionada.value = null;
      if (map) { map.remove(); mapContainer.value!.innerHTML = ''; }
    }
    cargarDatosGenerales();
  } catch (err) {
    toast.error('Error al eliminar la ruta');
  } finally {
    eliminandoRuta.value = false;
    rutaEliminandoId.value = null;
  }
}

async function cambiarEstadoRuta(id: number, nuevoEstado: string) {
  try {
    await rutasServicio.actualizarEstado(id, nuevoEstado);
    toast.success(`Estado actualizado a ${nuevoEstado}`);
    seleccionarRuta(id);
    cargarDatosGenerales();
  } catch (err) {
    toast.error('Error al cambiar el estado');
  }
}

function abrirModalNuevaEntrega() {
  if (!rutaSeleccionada.value) return;
  const sigOrden = (rutaSeleccionada.value.entregas?.length || 0) + 1;
  entregaFormData.value = {
    rutaId: rutaSeleccionada.value.id,
    clienteId: 0,
    ordenParada: sigOrden,
    notas: ''
  };
  mostrarModalEntrega.value = true;
}

async function guardarEntrega() {
  if (!entregaFormData.value.clienteId) {
    toast.error('Selecciona un cliente');
    return;
  }
  try {
    await entregasServicio.crear(entregaFormData.value);
    toast.success('Entrega añadida a la ruta');
    mostrarModalEntrega.value = false;
    if (rutaSeleccionada.value) await seleccionarRuta(rutaSeleccionada.value.id);
  } catch (err) {
    toast.error('Error al crear la entrega');
  }
}

async function confirmarEliminarEntrega(id: number) {
  entregaEliminandoId.value = id;
}

async function ejecutarEliminarEntrega() {
  if (entregaEliminandoId.value === null) return;
  const id = entregaEliminandoId.value;
  eliminandoEntrega.value = true;
  try {
    await entregasServicio.eliminar(id);
    toast.success('Entrega eliminada');
    if (rutaSeleccionada.value) await seleccionarRuta(rutaSeleccionada.value.id);
  } catch (err) {
    toast.error('Error al eliminar la entrega');
  } finally {
    eliminandoEntrega.value = false;
    entregaEliminandoId.value = null;
  }
}

onMounted(() => {
  cargarDatosGenerales();
});

// --- EXPORTACIÓN ---
function exportarListaPDF() {
  const columnas = ['ID', 'Estado', 'Vehiculo', 'Conductor', 'Fecha'];
  const data = rutasFiltradas.value.map(r => [
    `#RT-${r.id}`,
    r.estado,
    r.matriculaVehiculo || '-',
    r.nombreConductor || 'Sin Asignar',
    new Date(r.fecha).toLocaleDateString()
  ]);
  exportadorServicio.exportarPDF('Reporte de Rutas', columnas, data, 'Rutas_Reporte');
}

function exportarListaExcel() {
  const data = rutasFiltradas.value.map(r => ({
    ID: `#RT-${r.id}`,
    Estado: r.estado,
    Vehiculo: r.matriculaVehiculo || '-',
    Conductor: r.nombreConductor || 'Sin Asignar',
    Fecha: new Date(r.fecha).toLocaleDateString()
  }));
  exportadorServicio.exportarExcel('Rutas', data, 'Rutas_Reporte');
}

// Respetar Dark Mode del dashboard
watch(() => props.darkMode, (isDark) => {
  if (map) {
    map.remove();
    map = null;
    routeLine = null;
    markersLayer = null;
    nextTick(() => {
      initMap();
      if (rutaSeleccionada.value) {
        dibujarRutaMapa(rutaSeleccionada.value.entregas);
      }
    });
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header y KPIs -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="cargando">
        <div v-for="i in 4" :key="i" class="p-5 rounded-2xl border animate-pulse" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="h-10 bg-gray-200 rounded-lg w-10 mb-4" :class="darkMode ? 'bg-gray-700' : ''"></div>
          <div class="h-6 bg-gray-200 w-16 mb-2 rounded" :class="darkMode ? 'bg-gray-700' : ''"></div>
          <div class="h-4 bg-gray-200 w-24 rounded" :class="darkMode ? 'bg-gray-700' : ''"></div>
        </div>
      </template>
      <template v-else>
        <div v-for="kpi in kpis" :key="kpi.label" 
             class="p-5 rounded-2xl border transition-all"
             :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2.5 rounded-xl" :style="{ backgroundColor: `${kpi.color}18` }">
              <component :is="kpi.icon" class="w-5 h-5" :style="{ color: kpi.color }" />
            </div>
            <p class="text-sm font-medium" :class="darkMode ? 'text-gray-400' : 'text-[#757575]'">{{ kpi.label }}</p>
          </div>
          <p class="text-3xl font-bold mt-2" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ kpi.value }}</p>
        </div>
      </template>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-3 gap-6">
      
      <!-- Lista de Rutas (Columna Izquierda) -->
      <div class="lg:col-span-1 border rounded-2xl flex flex-col h-[700px] overflow-hidden"
           :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'">
        <!-- Search & Filter -->
        <div class="p-4 border-b space-y-3" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="busqueda" type="text" placeholder="Buscar por ID, Vehículo o Conductor"
                     class="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] transition-colors"
                     :class="darkMode ? 'bg-transparent border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-[#424242]'"/>
            </div>
            <button @click="exportarListaPDF" class="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 shrink-0" :class="darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : ''" title="Exportar PDF">
              <FileText class="w-4 h-4 text-red-500"/>
            </button>
            <button @click="exportarListaExcel" class="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 shrink-0" :class="darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : ''" title="Exportar Excel">
              <FileSpreadsheet class="w-4 h-4 text-green-600"/>
            </button>
            <button @click="abrirModalNuevaRuta" class="bg-[#E67E50] text-white px-3 py-2 rounded-lg hover:bg-[#d46b3f] transition-colors flex items-center gap-1 shrink-0" title="Nueva Ruta">
              <Plus class="w-5 h-5"/>
            </button>
          </div>
          <select v-model="filtroEstado"
                  class="w-full p-2 text-sm border rounded-lg focus:outline-none focus:border-[#E67E50] cursor-pointer transition-colors"
                  :class="darkMode ? 'bg-transparent border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#424242]'">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Planificadas</option>
            <option value="EN_CURSO">En Progreso</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>

        <!-- Lista scrolleable -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div v-if="cargando" class="flex justify-center items-center h-full">
            <Loader2 class="w-8 h-8 text-[#E67E50] animate-spin" />
          </div>
          <div v-else-if="rutasFiltradas.length === 0" class="text-center py-10" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
            No se encontraron rutas.
          </div>
          <template v-else>
            <div v-for="ruta in rutasFiltradas" :key="ruta.id"
                 @click="seleccionarRuta(ruta.id)"
                 class="p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden"
                 :class="[
                   darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-100 hover:border-gray-300 hover:shadow-md',
                   rutaSeleccionada?.id === ruta.id ? (darkMode ? 'bg-gray-800 border-[#E67E50]' : 'bg-orange-50 border-[#E67E50]') : (darkMode ? 'bg-transparent' : 'bg-white')
                 ]">
              
              <!-- Indicator of selected -->
              <div v-if="rutaSeleccionada?.id === ruta.id" class="absolute left-0 top-0 bottom-0 w-1 bg-[#E67E50]"></div>
              
              <div class="flex justify-between items-start mb-2 pl-1">
                <span class="font-bold text-lg" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">#RT-{{ ruta.id }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border"
                      :class="[badgeEstado(ruta.estado).bg, badgeEstado(ruta.estado).text, badgeEstado(ruta.estado).border]">
                  {{ ruta.estado }}
                </span>
              </div>
              
              <div class="space-y-1.5 pl-1">
                <div class="flex items-center gap-2 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">
                  <Truck class="w-4 h-4 text-gray-500" />
                  <span>{{ ruta.matriculaVehiculo }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">
                  <Clock class="w-4 h-4 text-gray-500" />
                  <span>Conductor: {{ ruta.nombreConductor }}</span>
                </div>
                <!-- <div v-if="ruta.distanciaTotalEstimada" class="flex items-center gap-2 text-sm" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">
                  <MapPin class="w-4 h-4 text-gray-500" />
                  <span>{{ ruta.distanciaTotalEstimada }} km</span>
                </div> -->
                <div class="flex justify-between items-center text-xs mt-3 pt-2 border-t" :class="darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'">
                  <span>{{ new Date(ruta.fecha).toLocaleDateString() }}</span>
                  <span class="flex items-center gap-1 group-hover:text-[#E67E50] transition-colors"><Eye class="w-3 h-3"/> Ver detalle</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Mapa y Detalle (Columna Derecha) -->
      <div class="lg:col-span-2 flex flex-col h-[700px] border rounded-2xl overflow-hidden"
           :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100 shadow-sm'">
        
        <div v-if="!rutaSeleccionada && !cargandoDetalle" class="flex flex-col items-center justify-center h-full text-center p-8">
          <Map class="w-16 h-16 text-gray-300 mb-4" :class="darkMode ? 'opacity-20' : ''"/>
          <h3 class="text-xl font-medium mb-2" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Ninguna ruta seleccionada</h3>
          <p :class="darkMode ? 'text-gray-500' : 'text-[#757575]'">Selecciona una ruta de la lista para visualizar su trayecto en el mapa y los detalles de cada parada.</p>
        </div>

        <div v-else-if="cargandoDetalle" class="flex justify-center items-center h-full">
          <Loader2 class="w-10 h-10 text-[#E67E50] animate-spin" />
        </div>

        <div v-else class="flex flex-col h-full">
          <!-- Detalles Header -->
          <div class="p-6 border-b flex justify-between items-start" :class="darkMode ? 'border-gray-700 bg-[#1e293b]' : 'border-gray-100 bg-[#f8fafc]'">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h2 class="text-2xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Ruta #RT-{{ rutaSeleccionada?.id }}</h2>
                <span class="px-3 py-1 rounded text-xs font-bold border"
                      :class="[badgeEstado(rutaSeleccionada?.estado || '').bg, badgeEstado(rutaSeleccionada?.estado || '').text, badgeEstado(rutaSeleccionada?.estado || '').border]">
                  {{ rutaSeleccionada?.estado }}
                </span>
              </div>
              <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                Planificada para: {{ new Date(rutaSeleccionada?.fecha || '').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
              </p>
            </div>
            
            <div class="flex gap-4 p-3 rounded-lg border" :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-200 shadow-sm'">
              <div class="flex items-center gap-2">
                <Truck class="w-5 h-5 text-gray-400" />
                <div class="text-sm">
                  <p class="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Vehículo</p>
                  <p class="font-medium mt-0.5" :class="darkMode ? 'text-gray-200' : 'text-gray-700'">{{ rutaSeleccionada?.matriculaVehiculo }}</p>
                </div>
              </div>
              <div class="w-px bg-gray-200 mx-2" :class="darkMode ? 'bg-gray-700' : ''"></div>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0"
                     :class="darkMode ? 'bg-gray-800 text-gray-400' : ''">
                  {{ rutaSeleccionada?.nombreConductor ? rutaSeleccionada.nombreConductor.substring(0,2).toUpperCase() : 'ND' }}
                </div>
                <div class="text-sm max-w-[120px] truncate">
                  <p class="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Conductor</p>
                  <p class="font-medium mt-0.5 truncate" :class="darkMode ? 'text-gray-200' : 'text-gray-700'">{{ rutaSeleccionada?.nombreConductor || 'Sin Asignar' }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 mt-2 sm:mt-0 items-end">
              <div class="flex gap-2">
                 <button @click="recargarUbicacion" :disabled="recargandoUbicacion" class="p-2 border rounded-md hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50" :class="darkMode ? 'border-gray-700 text-gray-400 hover:border-green-600' : 'border-gray-200 text-gray-500'" title="Actualizar Ubicación">
                   <RefreshCw class="w-4 h-4" :class="{'animate-spin': recargandoUbicacion}"/>
                 </button>
                 <button @click="abrirModalEditarRuta(rutaSeleccionada!)" class="p-2 border rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors" :class="darkMode ? 'border-gray-700 text-gray-400 hover:border-blue-600' : 'border-gray-200 text-gray-500'" title="Editar Ruta">
                   <Edit class="w-4 h-4"/>
                 </button>
                 <button @click="confirmarEliminarRuta(rutaSeleccionada!.id)" class="p-2 border rounded-md hover:bg-red-50 hover:text-red-600 transition-colors" :class="darkMode ? 'border-gray-700 text-gray-400 hover:border-red-600' : 'border-gray-200 text-gray-500'" title="Eliminar Ruta">
                   <Trash2 class="w-4 h-4"/>
                 </button>
              </div>
              
              <!-- Ultima actualizacion texto -->
              <div v-if="ultimaUbicacion && obtenerFechaUbicacion(ultimaUbicacion)" class="text-xs flex items-center gap-1.5 mt-1" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                <Navigation class="w-3 h-3 text-blue-500" />
                <span>Última pos: {{ obtenerFechaUbicacion(ultimaUbicacion)!.toLocaleTimeString() }}</span>
              </div>
            </div>
          </div>

          <!-- Métricas OSRM y Botones Rápidos -->
          <div class="flex flex-wrap items-center justify-between p-4 border-b text-sm" :class="darkMode ? 'border-gray-700 bg-[#1a2332]' : 'border-gray-100 bg-white'">
             
             <!-- Metrics -->
             <div class="flex items-center gap-6">
                 <div class="flex items-center gap-2" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">
                     <Route class="w-4 h-4 text-[#E67E50]" />
                     <span class="font-medium">Distancia Total:</span>
                     <span v-if="rutaMetrics" class="font-bold">{{ rutaMetrics.distanciaKm }} km</span>
                     <span v-else class="text-gray-400 italic font-medium">Calculando...</span>
                 </div>
                 
                 <div class="flex items-center gap-2" :class="darkMode ? 'text-gray-300' : 'text-[#424242]'">
                     <Clock class="w-4 h-4 text-blue-500" />
                     <span class="font-medium">Tiempo de Conducción:</span>
                     <span v-if="rutaMetrics" class="font-bold">{{ Math.floor(rutaMetrics.duracionMin / 60) }}h {{ rutaMetrics.duracionMin % 60 }}min</span>
                     <span v-else class="text-gray-400 italic font-medium">Calculando...</span>
                 </div>
             </div>
          </div>

          <!-- Contenedor del Mapa -->
          <div class="h-[300px] w-full relative shrink-0 bg-[#e5e5e5] leaflet-wrapper">
            <div ref="mapContainer" class="w-full h-full absolute inset-0"></div>
          </div>

          <!-- Entregas / Timeline -->
          <div class="flex-1 overflow-y-auto p-6" :class="darkMode ? 'bg-[#1a2332]' : 'bg-white'">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold text-lg flex items-center gap-2" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">
                <Route class="w-5 h-5 text-[#E67E50]" />
                Itinerario de Entregas ({{ rutaSeleccionada?.entregas.length }})
              </h3>
              <button @click="abrirModalNuevaEntrega" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold transition-colors" :class="darkMode ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400' : ''">
                 <Plus class="w-4 h-4"/> Añadir Parada
              </button>
            </div>

            <div v-if="rutaSeleccionada?.entregas.length === 0" class="text-gray-500 text-center py-4">
              Esta ruta no tiene entregas asignadas.
            </div>
            
            <div v-else class="relative pl-6 border-l-2 ml-4 space-y-6" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
              <div v-for="(entrega, index) in rutaSeleccionada?.entregas.slice().sort((a,b)=>a.ordenParada-b.ordenParada)" :key="entrega.id" class="relative">
                <!-- Punto en el timeline -->
                <div class="absolute -left-[35px] w-8 h-8 rounded-full border-[3px] flex items-center justify-center font-bold text-xs"
                     :class="[
                       darkMode ? 'bg-[#1a2332]' : 'bg-white',
                       entrega.estado === 'ENTREGADO' ? 'border-green-500 text-green-500' : 
                       entrega.estado === 'FALLIDO' ? 'border-red-500 text-red-500' : 
                       'border-[#E67E50] text-[#E67E50]'
                     ]">
                  {{ index + 1 }}
                </div>

                <div class="p-4 rounded-xl border transition-colors hover:shadow-sm"
                     :class="darkMode ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-100 hover:border-gray-200'">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-md" :class="darkMode ? 'text-white' : 'text-[#424242]'">{{ entrega.cliente?.nombreEmpresa || `Cliente #${entrega.clienteId}` }}</h4>
                    <span class="text-xs font-semibold px-2 py-1 rounded"
                          :class="entrega.estado === 'ENTREGADO' ? (darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700') : 
                                  entrega.estado === 'FALLIDO' ? (darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700') : 
                                  (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')">
                      {{ entrega.estado }}
                    </span>
                    <button @click="confirmarEliminarEntrega(entrega.id)" class="text-gray-400 ml-2 hover:text-red-500 p-1" title="Eliminar Parada">
                      <Trash2 class="w-3.5 h-3.5"/>
                    </button>
                  </div>
                  
                  <div class="flex items-start gap-4 mb-3">
                    <div class="flex items-start gap-2 max-w-[60%]">
                      <MapPin class="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <span class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">{{ entrega.cliente?.direccion }}</span>
                    </div>
                  </div>

                  <!-- Optional Action/Footer -->
                  <div v-if="entrega.horaEntregaReal || entrega.codigoQr" class="text-xs pt-3 border-t flex justify-between items-center" :class="darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'">
                    <span v-if="entrega.horaEntregaReal" class="flex gap-1.5 items-center">
                      <Check class="w-3.5 h-3.5 outline outline-1 outline-green-500 outline-offset-1 rounded-full text-green-500 bg-transparent" />
                      Realizada: {{ new Date(entrega.horaEntregaReal).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) }}
                    </span>
                    <span v-else></span>
                    <span v-if="entrega.codigoQr" class="font-mono bg-gray-100 px-1.5 py-0.5 rounded" :class="darkMode ? 'bg-gray-700 text-gray-300' : ''">QR: {{ entrega.codigoQr.substring(0,8) }}...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>

  <!-- MODAL RUTA -->
  <div v-if="mostrarModalRuta" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" :class="darkMode ? 'bg-[#1a2332]' : 'bg-white shadow-xl'">
      <div class="p-6 border-b flex justify-between items-center" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
        <h3 class="text-xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">{{ editandoRutaId ? 'Editar Ruta #' + editandoRutaId : 'Nueva Ruta' }}</h3>
        <button @click="mostrarModalRuta = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5"/></button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Fecha Planificada *</label>
          <input type="date" v-model="rutaFormData.fecha" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50]" :class="darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#424242]'" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Conductor Asignado *</label>
          <select v-model="rutaFormData.conductorId" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50]" :class="darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#424242]'" required>
             <option value="0" disabled>Selecciona un conductor...</option>
             <option v-for="user in conductoresDisponibles" :key="user.id" :value="user.id">{{ user.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Vehículo Asignado *</label>
          <select v-model="rutaFormData.vehiculoId" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50]" :class="darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#424242]'" required>
             <option value="0" disabled>Selecciona un vehículo...</option>
             <option v-for="veh in vehiculosDisponibles" :key="veh.id" :value="veh.id">{{ veh.matricula }} - {{ veh.marcaModelo }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Estado Opcional</label>
          <select v-model="rutaFormData.estado" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50]" :class="darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#424242]'">
             <option value="PENDIENTE">Planificada (Pendiente)</option>
             <option value="EN_CURSO">En Progreso</option>
             <option value="COMPLETADA">Completada</option>
             <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>
      <div class="p-6 border-t flex justify-end gap-3 bg-gray-50" :class="darkMode ? 'bg-[#1e293b] border-gray-700' : 'border-gray-100'">
        <button @click="mostrarModalRuta = false" class="px-4 py-2 border rounded-lg font-medium transition-colors" :class="darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'">Cancelar</button>
        <button @click="guardarRuta" class="px-4 py-2 bg-[#E67E50] text-white rounded-lg font-semibold hover:bg-[#d46b3f] transition-colors">Guardar Ruta</button>
      </div>
    </div>
  </div>

  <!-- MODAL ENTREGA -->
  <div v-if="mostrarModalEntrega" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" :class="darkMode ? 'bg-[#1a2332]' : 'bg-white shadow-xl'">
      <div class="p-6 border-b flex justify-between items-center" :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
        <h3 class="text-xl font-bold" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Añadir Parada a #RT-{{rutaSeleccionada?.id}}</h3>
        <button @click="mostrarModalEntrega = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5"/></button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Cliente *</label>
          <select v-model="entregaFormData.clienteId" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50]" :class="darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#424242]'" required>
             <option value="0" disabled>Selecciona el cliente a entregar...</option>
             <option v-for="cli in clientesDisponibles" :key="cli.id" :value="cli.id">{{ cli.nombreEmpresa }} ({{ cli.direccion }})</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Número de Parada en la Ruta (Orden)</label>
          <input type="number" v-model="entregaFormData.ordenParada" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50]" :class="darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#424242]'" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Notas (Opcional)</label>
          <textarea v-model="entregaFormData.notas" class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E50]" :class="darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#424242]'" rows="3" placeholder="Instrucciones para la entrega..."></textarea>
        </div>
      </div>
      <div class="p-6 border-t flex justify-end gap-3 bg-gray-50" :class="darkMode ? 'bg-[#1e293b] border-gray-700' : 'border-gray-100'">
        <button @click="mostrarModalEntrega = false" class="px-4 py-2 border rounded-lg font-medium transition-colors" :class="darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'">Cancelar</button>
        <button @click="guardarEntrega" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Añadir Parada</button>
      </div>
    </div>
  </div>

  <!-- MODAL ELIMINAR RUTA -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="rutaEliminandoId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
        @click.self="rutaEliminandoId = null">
        <div class="w-full max-w-sm rounded-2xl shadow-2xl border p-6"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="flex flex-col items-center text-center gap-4">
            <div class="w-14 h-14 rounded-full flex items-center justify-center bg-red-50">
              <Trash2 class="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 class="text-lg font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Eliminar ruta</h3>
              <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                ¿Seguro que quieres eliminar la ruta #RT-{{ rutaEliminandoId }} y todas sus paradas asociadas? Esta acción no se puede deshacer.
              </p>
            </div>
            <div class="flex gap-3 w-full">
              <button
                @click="ejecutarEliminarRuta"
                :disabled="eliminandoRuta"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {{ eliminandoRuta ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
              <button
                @click="rutaEliminandoId = null"
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

  <!-- MODAL ELIMINAR ENTREGA -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="entregaEliminandoId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
        @click.self="entregaEliminandoId = null">
        <div class="w-full max-w-sm rounded-2xl shadow-2xl border p-6"
          :class="darkMode ? 'bg-[#1a2332] border-gray-700' : 'bg-white border-gray-100'">
          <div class="flex flex-col items-center text-center gap-4">
            <div class="w-14 h-14 rounded-full flex items-center justify-center bg-orange-50">
              <AlertCircle class="w-7 h-7 text-[#E67E50]" />
            </div>
            <div>
              <h3 class="text-lg font-bold mb-1" :class="darkMode ? 'text-white' : 'text-[#092C4C]'">Quitar parada</h3>
              <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                ¿Seguro que quieres eliminar esta parada de la ruta?
              </p>
            </div>
            <div class="flex gap-3 w-full">
              <button
                @click="ejecutarEliminarEntrega"
                :disabled="eliminandoEntrega"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#E67E50] text-white hover:bg-[#d4703f] transition-colors disabled:opacity-50">
                {{ eliminandoEntrega ? 'Quitando...' : 'Sí, quitar' }}
              </button>
              <button
                @click="entregaEliminandoId = null"
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

<style>
/* Leaflet customizations to match theme - global styling for stability */
.leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.leaflet-popup-tip {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.leaflet-container {
  z-index: 10;
}
.leaflet-pane {
  z-index: 10;
}
.leaflet-top,
.leaflet-bottom {
  z-index: 1000;
}
</style>
