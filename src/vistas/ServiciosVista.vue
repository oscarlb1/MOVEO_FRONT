<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  MapPin, Package, Smartphone, BarChart3, Wrench, Shield, 
  CheckCircle2, TrendingUp, Clock, Camera, FileText, Bell, 
  Star, Users, Zap, Activity, DollarSign, Truck, ArrowRight 
} from 'lucide-vue-next'
import ContadorAnimado from '@/componentes/comunes/ContadorAnimado.vue'

const router = useRouter()

// --- Lógica de Animación Progresiva ---
const activeEventIndex = ref(0)
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    activeEventIndex.value = (activeEventIndex.value + 1) % maintenanceEvents.length
  }, 4000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// --- Data ---
const pricingPlans = [
  {
    name: "Starter",
    price: "99",
    description: "Para pequeñas empresas",
    features: [
      "Hasta 10 vehículos",
      "50 entregas/día",
      "Seguimiento GPS",
      "App móvil básica",
      "Soporte email"
    ],
    popular: false
  },
  {
    name: "Professional",
    price: "299",
    description: "Para empresas en crecimiento",
    features: [
      "Hasta 50 vehículos",
      "500 entregas/día",
      "Optimización de rutas IA",
      "Mantenimiento predictivo",
      "Soporte prioritario",
      "API access"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Para grandes operaciones",
    features: [
      "Vehículos ilimitados",
      "Entregas ilimitadas",
      "Todas las funciones",
      "Onboarding dedicado",
      "SLA garantizado",
      "Soporte 24/7"
    ],
    popular: false
  }
]

const roles = [
  {
    name: "Administrador",
    icon: Shield,
    permissions: ["Acceso total", "Gestión usuarios", "Configuración sistema", "Reportes avanzados"],
    color: "#E67E50"
  },
  {
    name: "Supervisor",
    icon: Activity,
    permissions: ["Ver dashboard", "Asignar rutas", "Monitoreo flota", "Gestión incidencias"],
    color: "#374B54"
  },
  {
    name: "Repartidor",
    icon: Truck,
    permissions: ["Ver ruta asignada", "Confirmar entregas", "Reportar incidencias", "Chat soporte"],
    color: "#092C4C"
  },
  {
    name: "Cliente",
    icon: Users,
    permissions: ["Seguimiento pedido", "Notificaciones", "Valoración servicio", "Historial"],
    color: "#757575"
  }
]

const maintenanceEvents = [
  { date: "10 Mar 2025", event: "Revisión de frenos", status: "scheduled", icon: Clock, color: "#E67E50" },
  { date: "15 Feb 2025", event: "Cambio de aceite", status: "completed", icon: CheckCircle2, color: "#374B54" },
  { date: "03 Ene 2025", event: "ITV pasada", status: "completed", icon: CheckCircle2, color: "#092C4C" },
]

const mobileFeatures = [
    { icon: Package, title: "Escaneo QR", desc: "Confirma entregas escaneando el código QR del paquete. Rápido y sin errores.", color: "#E67E50" },
    { icon: FileText, title: "Firma Digital", desc: "Captura la firma del cliente directamente en el móvil. 100% digital.", color: "#374B54" },
    { icon: Camera, title: "Fotos de Entrega", desc: "Adjunta foto como prueba de entrega. Protección para ambas partes.", color: "#092C4C" },
    { icon: Bell, title: "Reportes", desc: "Informa incidencias al instante con geolocalización y detalles.", color: "#E67E50" }
]

const trackingFeatures = [
  { icon: MapPin, title: "GPS Preciso", desc: "Localización exacta en tiempo real", color: "#E67E50" },
  { icon: Bell, title: "Alertas", desc: "Notificaciones instantáneas", color: "#374B54" },
  { icon: Clock, title: "Histórico", desc: "Consulta rutas pasadas", color: "#092C4C" },
  { icon: Shield, title: "Geovallas", desc: "Zonas de seguridad", color: "#E67E50" }
]

const navegar = (ruta: string) => {
  router.push(ruta)
}
</script>

<template>
  <div class="bg-white dark:bg-[#16181A] min-h-screen font-sans text-slate-800 transition-colors duration-300">
    
    <section class="bg-gradient-to-br from-[#092C4C] to-[#374B54] text-white py-24 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
        </div>
        <div class="max-w-7xl mx-auto px-6 relative">
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 800 } }"
            class="text-center max-w-3xl mx-auto"
          >
            <div
              v-motion
              :initial="{ scale: 0.9 }"
              :enter="{ scale: 1, transition: { duration: 500 } }"
              class="inline-block px-6 py-3 bg-[#E67E50]/20 border border-[#E67E50]/30 rounded-full mb-8"
            >
              <span class="text-[#E67E50] font-medium">7 Módulos Profesionales</span>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold mb-6">
              Soluciones <span class="text-[#E67E50]">completas</span> para tu logística
            </h1>
            <p class="text-xl text-gray-300 leading-relaxed">
              Plataforma integral que transforma la gestión de flotas, repartidores y entregas con tecnología de última generación
            </p>
          </div>
        </div>
    </section>

    <section class="py-24 bg-white dark:bg-[#16181A] transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          >
            <div class="inline-flex items-center gap-2 bg-[#E67E50]/10 border border-[#E67E50]/20 rounded-full px-5 py-2.5 mb-6">
              <MapPin class="w-4 h-4 text-[#E67E50]" />
              <span class="text-[#E67E50] font-bold text-sm">Módulo #1</span>
            </div>
            <h2 class="text-3xl font-bold text-[#092C4C] dark:text-white mb-4">Optimización de Rutas con IA</h2>
            <p class="text-[#757575] dark:text-[#82A1B1] text-xl mb-8 leading-relaxed">
              Algoritmos inteligentes que calculan la ruta perfecta considerando 
              tráfico en tiempo real, condiciones climáticas e histórico de entregas.
            </p>

            <div class="space-y-4 mb-8">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-[#E67E50]/10 border border-[#E67E50]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 class="w-6 h-6 text-[#E67E50]" />
                </div>
                <div>
                  <h4 class="font-bold text-[#092C4C] dark:text-white mb-1">30% menos tiempo de entrega</h4>
                  <p class="text-[#757575] dark:text-[#82A1B1]">Reducción promedio en tiempo total de ruta</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-[#374B54]/10 dark:bg-[#374B54]/30 border border-[#374B54]/20 dark:border-[#374B54]/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp class="w-6 h-6 text-[#374B54] dark:text-[#82A1B1]" />
                </div>
                <div>
                  <h4 class="font-bold text-[#092C4C] dark:text-white mb-1">Aprendizaje continuo</h4>
                  <p class="text-[#757575] dark:text-[#82A1B1]">La IA mejora con cada ruta completada</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-[#092C4C]/10 dark:bg-[#E67E50]/10 border border-[#092C4C]/20 dark:border-[#E67E50]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap class="w-6 h-6 text-[#092C4C] dark:text-[#E67E50]" />
                </div>
                <div>
                  <h4 class="font-bold text-[#092C4C] dark:text-white mb-1">Replanificación dinámica</h4>
                  <p class="text-[#757575] dark:text-[#82A1B1]">Adaptación automática a cambios e imprevistos</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-[#EEEEEE] to-white dark:from-[#272A30] dark:to-[#16181A] border border-gray-200 dark:border-[#374B54] p-8 rounded-2xl shadow-sm">
              <h4 class="font-bold text-[#092C4C] dark:text-white mb-6">Comparativa de eficiencia</h4>
              <div class="space-y-5">
                <div>
                  <div class="flex justify-between mb-3 text-sm font-medium">
                    <span class="text-[#757575] dark:text-[#82A1B1]">Ruta manual</span>
                    <span class="text-[#424242] dark:text-white">125 min</span>
                  </div>
                  <div class="h-3 bg-gray-200 dark:bg-[#16181A] rounded-full overflow-hidden border dark:border-[#374B54]">
                    <div class="h-full bg-[#757575] dark:bg-[#374B54] w-full"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-3 text-sm font-medium">
                    <span class="text-[#757575] dark:text-[#82A1B1]">Ruta optimizada con IA</span>
                    <span class="text-[#E67E50]">87 min</span>
                  </div>
                  <div class="h-3 bg-gray-200 dark:bg-[#16181A] rounded-full overflow-hidden border dark:border-[#374B54]">
                    <div 
                      v-motion
                      :initial="{ width: '0%' }"
                      :visible="{ width: '70%', transition: { duration: 1000, delay: 300 } }"
                      class="h-full bg-gradient-to-r from-[#E67E50] to-[#374B54] dark:to-[#E67E50]/50"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
            class="relative"
          >
            <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#374B54] bg-gray-100 dark:bg-[#16181A]">
              <img src="https://cdn.prod.website-files.com/64ca37391046bd0e764dc522/680908635f18d63db57e9e23_planificacion-de-rutas%2043%201000x750%20px.png" alt="Optimización de Rutas" class="w-full h-auto object-cover min-h-[400px]" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#092C4C]/90 dark:from-[#16181A]/90 via-[#092C4C]/30 dark:via-[#16181A]/30 to-transparent flex items-end p-8">
                <div class="text-white w-full">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-3 h-3 bg-[#E67E50] rounded-full animate-pulse"></div>
                      <span class="text-lg font-medium">Calculando ruta óptima...</span>
                    </div>
                    <div class="text-[#E67E50] font-bold">87%</div>
                  </div>
                  <div class="h-2 bg-white/20 dark:bg-[#374B54] rounded-full overflow-hidden">
                    <div class="h-full bg-[#E67E50] rounded-full w-[87%] animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-[#EEEEEE] dark:bg-[#1A1D23] transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div
            v-motion
            :initial="{ opacity: 0, x: -50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
            class="order-2 lg:order-1"
          >
            <div class="bg-white dark:bg-[#272A30] rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-[#374B54]">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-[#092C4C] dark:text-white">Mapa en vivo</h3>
                <div class="flex gap-2">
                  <button class="px-4 py-2 bg-[#E67E50] text-white rounded-lg text-xs font-medium hover:bg-[#d66d42] transition-colors">
                    Todos
                  </button>
                  <button class="px-4 py-2 bg-[#EEEEEE] dark:bg-[#16181A] text-[#757575] dark:text-[#82A1B1] border border-transparent dark:border-[#374B54] rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-[#374B54]/50 transition-colors">
                    En ruta
                  </button>
                  <button class="px-4 py-2 bg-[#EEEEEE] dark:bg-[#16181A] text-[#757575] dark:text-[#82A1B1] border border-transparent dark:border-[#374B54] rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-[#374B54]/50 transition-colors">
                    Detenidos
                  </button>
                </div>
              </div>
              
              <div class="aspect-video bg-gray-100 dark:bg-[#16181A] rounded-xl relative overflow-hidden border border-gray-200 dark:border-[#374B54]">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" alt="Mapa" class="w-full h-full object-cover opacity-30 grayscale dark:opacity-20" />
                
                <div class="absolute top-[30%] left-[20%] w-5 h-5">
                    <div class="w-5 h-5 bg-[#E67E50] rounded-full shadow-lg border-2 border-white dark:border-[#16181A] relative z-10"></div>
                    <div class="absolute inset-0 bg-[#E67E50] rounded-full animate-ping opacity-50"></div>
                </div>
                 <div class="absolute top-[60%] left-[70%] w-5 h-5">
                   <div class="w-5 h-5 bg-[#374B54] dark:bg-[#82A1B1] rounded-full shadow-lg border-2 border-white dark:border-[#16181A] relative z-10"></div>
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <div class="flex items-center justify-between p-4 bg-[#E67E50]/5 border border-[#E67E50]/20 rounded-xl hover:bg-[#E67E50]/10 transition-colors cursor-pointer">
                  <div class="flex items-center gap-3">
                    <div class="w-2.5 h-2.5 bg-[#E67E50] rounded-full"></div>
                    <span class="text-[#092C4C] dark:text-white font-medium">Vehículo #V-001</span>
                  </div>
                  <span class="text-[#E67E50] text-sm font-bold">En ruta</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-[#374B54]/5 dark:bg-[#374B54]/10 border border-[#374B54]/20 dark:border-[#374B54]/50 rounded-xl hover:bg-[#374B54]/10 dark:hover:bg-[#374B54]/30 transition-colors cursor-pointer">
                  <div class="flex items-center gap-3">
                    <div class="w-2.5 h-2.5 bg-[#374B54] dark:bg-[#82A1B1] rounded-full"></div>
                    <span class="text-[#092C4C] dark:text-white font-medium">Vehículo #V-002</span>
                  </div>
                  <span class="text-[#374B54] dark:text-[#82A1B1] text-sm font-bold">Parado 5min</span>
                </div>
              </div>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
            class="order-1 lg:order-2"
          >
            <div class="inline-flex items-center gap-2 bg-[#374B54]/10 dark:bg-[#82A1B1]/10 border border-[#374B54]/20 dark:border-[#82A1B1]/20 rounded-full px-5 py-2.5 mb-6">
              <Activity class="w-4 h-4 text-[#374B54] dark:text-[#82A1B1]" />
              <span class="text-[#374B54] dark:text-[#82A1B1] font-bold text-sm">Módulo #2</span>
            </div>
            <h2 class="text-3xl font-bold text-[#092C4C] dark:text-white mb-4">Seguimiento en Tiempo Real</h2>
            <p class="text-[#757575] dark:text-[#82A1B1] text-xl mb-8 leading-relaxed">
              Monitoriza cada vehículo de tu flota con actualización GPS cada 30 segundos. 
              Control total de tu operación desde cualquier lugar.
            </p>

            <div class="grid grid-cols-2 gap-4">
              <div v-for="(item, index) in trackingFeatures" :key="index" 
                class="bg-white dark:bg-[#272A30] p-6 rounded-xl border border-gray-200 dark:border-[#374B54] hover:shadow-lg dark:hover:shadow-[#E67E50]/5 transition-all">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" :style="{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }">
                  <component :is="item.icon" class="w-6 h-6" :class="item.color === '#E67E50' ? 'text-[#E67E50]' : 'text-[#374B54] dark:text-[#82A1B1]'" />
                </div>
                <h4 class="text-[#092C4C] dark:text-white font-bold mb-1">{{ item.title }}</h4>
                <p class="text-[#757575] dark:text-[#82A1B1] text-xs">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-white dark:bg-[#16181A] transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 bg-[#092C4C]/10 dark:bg-[#82A1B1]/10 border border-[#092C4C]/20 dark:border-[#82A1B1]/20 rounded-full px-5 py-2.5 mb-6">
            <Smartphone class="w-4 h-4 text-[#092C4C] dark:text-[#82A1B1]" />
            <span class="text-[#092C4C] dark:text-[#82A1B1] font-bold text-sm">Módulo #3</span>
          </div>
          <h2 class="text-3xl font-bold text-[#092C4C] dark:text-white mb-4">App Móvil Profesional</h2>
          <p class="text-[#757575] dark:text-[#82A1B1] text-xl max-w-3xl mx-auto leading-relaxed">
            Herramientas potentes para repartidores. Diseño intuitivo y rápido, optimizado para el día a día.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div v-for="(feature, index) in mobileFeatures" :key="index"
             class="group bg-white dark:bg-[#272A30] border border-gray-200 dark:border-[#374B54] p-8 rounded-2xl hover:shadow-2xl dark:hover:shadow-[#E67E50]/10 hover:border-[#E67E50]/30 dark:hover:border-[#E67E50]/50 transition-all duration-300">
             <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
              :style="{ backgroundColor: `${feature.color}15`, border: `2px solid ${feature.color}30` }">
               <component :is="feature.icon" class="w-8 h-8" :class="feature.color === '#E67E50' ? 'text-[#E67E50]' : 'text-[#092C4C] dark:text-[#82A1B1]'" />
             </div>
             <h3 class="font-bold text-[#092C4C] dark:text-white mb-3 text-lg">{{ feature.title }}</h3>
             <p class="text-[#757575] dark:text-[#82A1B1] leading-relaxed text-sm">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-gradient-to-br from-[#092C4C] via-[#374B54] to-[#092C4C] text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 60px 60px;"></div>
      
      <div class="max-w-7xl mx-auto px-6 relative">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2.5 mb-6">
            <BarChart3 class="w-4 h-4 text-[#E67E50]" />
            <span class="text-[#E67E50] font-bold text-sm">Módulo #4</span>
          </div>
          <h2 class="text-3xl font-bold mb-4">Analítica Avanzada</h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Dashboards interactivos con KPIs en tiempo real para tomar decisiones informadas
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(kpi, index) in [
              { icon: Package, label: 'Entregas Completadas', value: 1247, trend: '+12%', color: '#E67E50' },
              { icon: Clock, label: 'Tiempo Promedio', value: 28, suffix: 'min', trend: '-8%', color: '#E67E50' },
              { icon: DollarSign, label: 'Coste por Entrega', value: 4.20, prefix: '€', decimals: 2, trend: '-15%', color: '#E67E50' },
              { icon: TrendingUp, label: 'Eficiencia Global', value: 94, suffix: '%', trend: '+5%', color: '#E67E50' },
            ]" :key="index"
            class="bg-white/5 backdrop-blur-sm border border-white/20 p-8 rounded-2xl hover:bg-white/15 transition-all"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="w-12 h-12 bg-[#E67E50]/20 border border-[#E67E50]/30 rounded-xl flex items-center justify-center">
                <component :is="kpi.icon" class="w-6 h-6 text-[#E67E50]" />
              </div>
              <span class="text-[#E67E50] font-bold text-sm">{{ kpi.trend }}</span>
            </div>
            <div class="text-4xl font-bold mb-2">
              <ContadorAnimado :end="kpi.value" :suffix="kpi.suffix" :prefix="kpi.prefix" :decimals="kpi.decimals" />
            </div>
            <p class="text-gray-300">{{ kpi.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-[#EEEEEE] dark:bg-[#1A1D23] transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          
          <div
            v-motion
            :initial="{ opacity: 0, x: -50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          >
            <div class="inline-flex items-center gap-2 bg-[#E67E50]/10 border border-[#E67E50]/20 rounded-full px-5 py-2.5 mb-6">
              <Wrench class="w-4 h-4 text-[#E67E50]" />
              <span class="text-[#E67E50] font-bold text-sm">Módulo #5</span>
            </div>
            <h2 class="text-3xl font-bold text-[#092C4C] dark:text-white mb-4">Mantenimiento Predictivo</h2>
            <p class="text-[#757575] dark:text-[#82A1B1] text-xl mb-8 leading-relaxed">
              Motor de predicción basado en ML que anticipa necesidades de mantenimiento antes de fallos costosos.
            </p>

            <div class="space-y-4">
              <div class="flex items-center gap-4 p-5 bg-white dark:bg-[#272A30] border border-gray-100 dark:border-[#374B54] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                  <CheckCircle2 class="w-6 h-6" />
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-[#092C4C] dark:text-white text-sm">Vehículo #V-023</h4>
                  <p class="text-xs text-[#757575] dark:text-[#82A1B1]">Estado óptimo de motor</p>
                </div>
                <span class="text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-[10px] font-bold uppercase tracking-wider border border-transparent dark:border-emerald-800/50">Saludable</span>
              </div>

              <div class="flex items-center gap-4 p-5 bg-white dark:bg-[#272A30] border border-gray-100 dark:border-[#374B54] rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#E67E50] dark:border-l-[#E67E50]">
                <div class="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-[#E67E50] rounded-xl flex items-center justify-center border border-orange-100 dark:border-orange-800/50">
                  <Clock class="w-6 h-6" />
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-[#092C4C] dark:text-white text-sm">Vehículo #V-017</h4>
                  <p class="text-xs text-[#757575] dark:text-[#82A1B1]">Cambio de aceite - 200 km</p>
                </div>
                <span class="text-[#E67E50] px-3 py-1 bg-orange-50 dark:bg-orange-900/30 rounded-full text-[10px] font-bold uppercase tracking-wider border border-transparent dark:border-orange-800/50">Próximo</span>
              </div>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          >
            <div class="bg-white dark:bg-[#272A30] p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-[#374B54] shadow-xl max-w-md mx-auto">
              <h3 class="text-[#092C4C] dark:text-white mb-10 text-xl font-bold flex items-center gap-3">
                <Activity class="w-5 h-5 text-[#E67E50]" />
                Historial de Salud
              </h3>
              
              <div class="relative">
                <div class="absolute left-6 top-2 bottom-2 w-px bg-gray-200 dark:bg-[#374B54]"></div>
                
                <div class="space-y-10">
                  <div v-for="(item, index) in maintenanceEvents" :key="index" class="relative flex items-start group">
                    <div 
                      class="relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-1000 ease-in-out"
                      :class="[
                        activeEventIndex === index 
                          ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-400 dark:border-[#E67E50] text-[#E67E50] shadow-xl shadow-orange-200 dark:shadow-[#E67E50]/10 scale-110' 
                          : 'bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-gray-300 dark:text-[#82A1B1] scale-100 opacity-40 dark:opacity-50'
                      ]"
                    >
                      <component :is="item.icon" class="w-5 h-5" />
                    </div>

                    <div class="ml-6 transition-all duration-700" :class="activeEventIndex === index ? 'opacity-100 translate-x-1' : 'opacity-30 dark:opacity-50'">
                      <h4 class="font-bold text-base leading-tight transition-colors duration-700"
                          :class="activeEventIndex === index ? 'text-[#E67E50]' : 'text-[#092C4C] dark:text-white'">
                        {{ item.event }}
                      </h4>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs font-medium text-[#757575] dark:text-[#82A1B1]">{{ item.date }}</span>
                        <span v-if="item.status === 'completed'" class="w-1 h-1 bg-gray-300 dark:bg-[#374B54] rounded-full"></span>
                        <span v-if="item.status === 'completed'" 
                              class="text-[10px] font-bold uppercase tracking-tighter transition-colors duration-700"
                              :class="activeEventIndex === index ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'">
                          Finalizado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-24 bg-white dark:bg-[#16181A] transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 bg-[#092C4C]/10 dark:bg-[#82A1B1]/10 border border-[#092C4C]/20 dark:border-[#82A1B1]/20 rounded-full px-5 py-2.5 mb-6">
            <Shield class="w-4 h-4 text-[#092C4C] dark:text-[#82A1B1]" />
            <span class="text-[#092C4C] dark:text-[#82A1B1] font-bold text-sm">Módulo #6</span>
          </div>
          <h2 class="text-3xl font-bold text-[#092C4C] dark:text-white mb-4">Control de Acceso y Roles</h2>
          <p class="text-[#757575] dark:text-[#82A1B1] text-xl leading-relaxed">Sistema de permisos granular para máxima seguridad</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(rol, index) in roles" :key="index"
            class="bg-white dark:bg-[#272A30] border-2 border-gray-200 dark:border-[#374B54] p-8 rounded-2xl hover:shadow-2xl dark:hover:shadow-[#E67E50]/10 hover:border-[#E67E50]/30 dark:hover:border-[#E67E50]/50 transition-all duration-300 group">
             <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
               :style="{ backgroundColor: `${rol.color}15`, border: `2px solid ${rol.color}30` }">
               <component :is="rol.icon" class="w-8 h-8" :class="rol.color === '#E67E50' ? 'text-[#E67E50]' : 'text-[#092C4C] dark:text-[#82A1B1]'" />
             </div>
             <h3 class="font-bold text-[#092C4C] dark:text-white mb-6 text-xl">{{ rol.name }}</h3>
             <ul class="space-y-3">
               <li v-for="perm in rol.permissions" :key="perm" class="flex items-start gap-3 text-[#757575] dark:text-[#82A1B1] text-sm">
                 <CheckCircle2 class="w-5 h-5 flex-shrink-0 mt-0.5" :class="rol.color === '#E67E50' ? 'text-[#E67E50]' : 'text-[#374B54] dark:text-[#82A1B1]'" />
                 <span>{{ perm }}</span>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-gradient-to-br from-[#EEEEEE] to-white dark:from-[#1A1D23] dark:to-[#16181A] transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
           <div class="inline-flex items-center gap-2 bg-[#E67E50]/10 border border-[#E67E50]/20 rounded-full px-5 py-2.5 mb-6">
              <DollarSign class="w-4 h-4 text-[#E67E50]" />
              <span class="text-[#E67E50] font-bold text-sm">Módulo #7</span>
            </div>
            <h2 class="text-3xl font-bold text-[#092C4C] dark:text-white mb-4">Planes que escalan contigo</h2>
            <p class="text-[#757575] dark:text-[#82A1B1] text-xl leading-relaxed">
              Modelo de precios transparente y predecible
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
           <div v-for="(plan, index) in pricingPlans" :key="index"
              class="relative bg-white dark:bg-[#272A30] rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 transform hover:-translate-y-2"
              :class="plan.popular ? 'border-[#E67E50] dark:border-[#E67E50] shadow-2xl scale-105 z-10' : 'border-gray-200 dark:border-[#374B54] hover:border-[#E67E50]/30 dark:hover:border-[#E67E50]/50 hover:shadow-xl'">
              
              <div v-if="plan.popular" class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div class="bg-gradient-to-r from-[#E67E50] to-[#374B54] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md">
                  <Star class="w-4 h-4 fill-current" />
                  Más Popular
                </div>
              </div>

               <div class="text-center mb-8">
                  <h3 class="font-bold text-[#092C4C] dark:text-white text-2xl mb-2">{{ plan.name }}</h3>
                  <p class="text-[#757575] dark:text-[#82A1B1] mb-6 text-sm">{{ plan.description }}</p>
                  <div class="flex items-end justify-center gap-1">
                    <span v-if="plan.price !== 'Custom'" class="text-[#757575] dark:text-[#82A1B1] text-2xl font-medium">€</span>
                    <span class="text-5xl font-bold text-[#092C4C] dark:text-white">{{ plan.price }}</span>
                    <span v-if="plan.price !== 'Custom'" class="text-[#757575] dark:text-[#82A1B1] text-lg mb-1 font-medium">/mes</span>
                  </div>
                </div>

                <ul class="space-y-4 mb-8">
                  <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-3 text-sm">
                     <div class="w-6 h-6 bg-[#E67E50]/10 border border-[#E67E50]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 class="w-4 h-4 text-[#E67E50]" />
                      </div>
                      <span class="text-[#424242] dark:text-gray-300">{{ feature }}</span>
                  </li>
                </ul>

                <button 
                  class="w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  :class="plan.popular 
                    ? 'bg-gradient-to-r from-[#E67E50] to-[#374B54] text-white hover:shadow-lg shadow-md' 
                    : 'bg-[#EEEEEE] dark:bg-[#16181A] text-[#092C4C] dark:text-white border border-transparent dark:border-[#374B54] hover:bg-[#E67E50] dark:hover:bg-[#E67E50] dark:hover:border-[#E67E50] hover:text-white'"
                >
                  {{ plan.price === "Custom" ? "Contactar ventas" : "Comenzar ahora" }}
                  <ArrowRight class="w-5 h-5" />
                </button>
           </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-gradient-to-br from-[#092C4C] via-[#374B54] to-[#092C4C] text-white relative overflow-hidden">
       <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
        </div>
        <div class="max-w-4xl mx-auto px-6 text-center relative z-10">
           <h2 class="text-3xl md:text-4xl font-bold mb-6">¿Listo para transformar tu logística?</h2>
            <p class="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Únete a más de 500 empresas que ya optimizan sus operaciones con Moveo
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                @click="navegar('/contacto')"
                class="px-8 py-4 bg-[#E67E50] text-white rounded-xl hover:bg-[#d66d42] transition-all hover:shadow-2xl flex items-center justify-center gap-2 font-bold"
              >
                Solicitar Demo
                <ArrowRight class="w-5 h-5" />
              </button>
              <button 
                @click="navegar('/dashboard')"
                class="px-8 py-4 bg-white/10 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm font-bold"
              >
                Ver Dashboard
              </button>
            </div>
        </div>
    </section>

  </div>
</template>

<style scoped>
/* ─── Hero animations ─── */
.hero-badge {
  animation: entradaDesdeArriba 0.6s ease-out both;
}
.hero-subtitulo {
  animation: entradaDesdeIzquierda 0.7s ease-out 0.1s both;
}
.hero-titulo {
  animation: entradaDesdeIzquierda 0.7s ease-out 0.2s both;
}
.hero-botones {
  animation: entradaDesdeAbajo 0.7s ease-out 0.4s both;
}
.hero-stats-line {
  animation: entradaDesdeAbajo 0.7s ease-out 0.6s both;
}
.hero-dashboard {
  animation: entradaDesdeDerecha 0.9s ease-out 0.5s both;
}

/* ─── Floating badges ─── */
.insignia-flotante {
  animation: flotar 3s ease-in-out infinite;
}
.insignia-flotante-2 {
  animation: flotar 3s ease-in-out infinite 1.5s;
}

/* ─── Scroll reveal ─── */
.transicion-seccion {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.transicion-seccion.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ─── Keyframes ─── */
@keyframes entradaDesdeArriba {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes entradaDesdeIzquierda {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes entradaDesdeDerecha {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes entradaDesdeAbajo {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes flotar {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>