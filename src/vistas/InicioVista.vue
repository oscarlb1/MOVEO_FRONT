<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Truck, MapPin, BarChart3, Shield, Clock, Users,
  Zap, Globe, ArrowRight, CheckCircle2, Play,
  Route, Bell, Fuel, Package, Star, Smartphone, Wrench, Box
} from 'lucide-vue-next'
import MapaAnimado from '@/componentes/comunes/MapaAnimado.vue'
import ContadorAnimado from '@/componentes/comunes/ContadorAnimado.vue'
import PiePagina from '@/componentes/PieDePagina.vue'

const emit = defineEmits<{
  (e: 'navegar', pagina: string): void
}>()

/* ─── Datos ─── */

const beneficios = [
  {
    icon: Zap,
    titulo: 'Rutas optimizadas con IA',
    descripcion: 'Algoritmos inteligentes que reducen hasta un 30% el tiempo de entrega',
    color: 'text-[#E67E50]',
    bgColor: 'bg-[#E67E50]/10'
  },
  {
    icon: MapPin,
    titulo: 'Seguimiento en vivo',
    descripcion: 'Monitoreo GPS en tiempo real de toda tu flota vehicular',
    color: 'text-[#374B54]',
    bgColor: 'bg-[#374B54]/10'
  },
  {
    icon: Box,
    titulo: 'Firma digital y QR',
    descripcion: 'Confirmación de entregas con trazabilidad total y sin papeles',
    color: 'text-[#092C4C]',
    bgColor: 'bg-[#092C4C]/10'
  },
  {
    icon: Wrench,
    titulo: 'Mantenimiento predictivo',
    descripcion: 'Anticipa reparaciones y reduce costes de mantenimiento',
    color: 'text-[#E67E50]',
    bgColor: 'bg-[#E67E50]/10'
  }
]

const pasos = [
  {
    numero: '01',
    titulo: 'Planifica',
    descripcion: 'Crea rutas optimizadas considerando tráfico, clima y prioridades de entrega',
    icon: Clock,
    color: 'bg-[#E67E50]'
  },
  {
    numero: '02',
    titulo: 'Asigna',
    descripcion: 'Distribuye entregas entre tu equipo de forma inteligente y equitativa',
    icon: Users,
    color: 'bg-[#374B54]'
  },
  {
    numero: '03',
    titulo: 'Entrega',
    descripcion: 'Tus repartidores completan entregas con firma digital y escaneo QR',
    icon: Smartphone,
    color: 'bg-[#092C4C]'
  }
]

const tecnologias = [
  { icon: Route, nombre: 'Smart Routing', descripcion: 'Optimización de rutas con IA' },
  { icon: Bell, nombre: 'Alertas Inteligentes', descripcion: 'Notificaciones en tiempo real' },
  { icon: Fuel, nombre: 'Control de Combustible', descripcion: 'Monitoreo de consumo' },
  { icon: Package, nombre: 'Gestión de Entregas', descripcion: 'Tracking de paquetes' },
  { icon: Shield, nombre: 'Seguridad Avanzada', descripcion: 'Protección anti-robo' },
  { icon: Globe, nombre: 'Cobertura Global', descripcion: 'Operaciones internacionales' }
]

const testimonios = [
  {
    nombre: 'Carlos Rodríguez',
    cargo: 'Director de Operaciones, LogiTrans',
    texto: 'Moveo redujo nuestros costos operativos en un 28%. La visibilidad en tiempo real cambió completamente nuestra forma de trabajar.',
    estrellas: 5
  },
  {
    nombre: 'Ana García',
    cargo: 'CEO, Express Delivery',
    texto: 'La mejor inversión que hemos hecho. Nuestros clientes ahora pueden rastrear sus envíos en tiempo real.',
    estrellas: 5
  },
  {
    nombre: 'Roberto Méndez',
    cargo: 'Fleet Manager, TransCargo',
    texto: 'La optimización de rutas nos ahorra 2 horas diarias por conductor. El ROI fue inmediato.',
    estrellas: 5
  }
]

/* ─── Dashboard animado ─── */

const statsHero = [
  { label: 'Vehículos', value: '500+', sublabel: 'Activos' },
  { label: 'Entregas', value: '1M+', sublabel: 'Mensuales' },
  { label: 'Ahorro', value: '35%', sublabel: 'Promedio' }
]

const heroCards = [
  { label: 'Vehículos', value: '35', icon: Truck },
  { label: 'Entregas', value: '248', icon: Box },
  { label: 'Eficiencia', value: '94%', icon: BarChart3 }
]

/* ─── Animaciones al scroll (IntersectionObserver) ─── */

const seccionesVisibles = ref<Set<string>>(new Set())

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          seccionesVisibles.value.add(entry.target.id)
        }
      })
    },
    { threshold: 0.15 }
  )

  document.querySelectorAll('[data-animar]').forEach(el => {
    observer!.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

function esVisible(id: string) {
  return seccionesVisibles.value.has(id)
}
</script>

<template>
  <div>
    <!-- ══════════════ HERO ══════════════ -->
    <section class="relative bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1E293B] min-h-screen flex items-center overflow-hidden">
      <MapaAnimado />
      
      <!-- Decorative background glows -->
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-[#E67E50]/5 blur-[120px] rounded-full"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#E67E50]/10 blur-[150px] rounded-full"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center w-full">
        <!-- Texto hero -->
        <div class="hero-texto">
          <div class="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-full mb-8 hero-badge">
            <Zap class="w-3.5 h-3.5 text-[#E67E50] fill-[#E67E50]" />
            <span class="text-[#E67E50] text-xs font-semibold">Plataforma SaaS para logística inteligente</span>
          </div>

          <h1 class="text-4xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 hero-titulo">
            Optimiza tu flota en <span class="text-[#E67E50]">tiempo real</span>
          </h1>

          <p class="text-lg text-gray-300 leading-relaxed mb-10 max-w-xl hero-subtitulo">
            La plataforma todo-en-uno para gestionar vehículos, rutas y entregas con tecnología de vanguardia. Reduce costes, aumenta eficiencia.
          </p>

          <div class="flex flex-wrap gap-4 mb-20 hero-botones">
            <button
              class="bg-[#E67E50] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#d66d40] transition-all shadow-[0_15px_30px_-10px_rgba(230,126,80,0.3)] flex items-center gap-2 group"
              @click="emit('navegar', 'contacto')"
            >
              Ver Dashboard Demo
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button class="bg-[#3D4D5C]/50 border border-white/10 text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#3D4D5C]/70 transition-all backdrop-blur-md">
              Explorar Servicios
            </button>
          </div>

          <!-- Hero stats -->
          <div class="flex gap-16 hero-stats-line">
            <div v-for="stat in statsHero" :key="stat.label" class="flex flex-col">
              <span class="text-3xl font-bold text-[#E67E50] tracking-tight">{{ stat.value }}</span>
              <span class="text-gray-400 text-sm font-medium">{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Dashboard preview mockup -->
        <div class="relative hero-dashboard">
          <!-- Live badge -->
          <div class="absolute -top-3 right-6 z-20 flex items-center gap-2 bg-[#00D97E] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-[#00D97E]/20 animate-pulse">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            Live
          </div>

          <!-- Outer container -->
          <div class="bg-[#2D3748]/40 backdrop-blur-md rounded-[3rem] p-10 border border-white/5 shadow-2xl relative">
            <!-- Glass cards grid -->
            <div class="grid grid-cols-3 gap-5 mb-10">
              <div v-for="card in heroCards" :key="card.label" class="bg-[#4A5568]/40 border border-white/5 rounded-2xl p-5">
                <div class="flex items-center gap-2 mb-3">
                  <component :is="card.icon" class="w-3.5 h-3.5 text-[#E67E50]" />
                  <span class="text-gray-400 text-[10px] uppercase tracking-wider font-bold">{{ card.label }}</span>
                </div>
                <div class="text-3xl font-bold text-white">{{ card.value }}</div>
              </div>
            </div>

            <!-- Main dashboard content -->
            <div class="bg-[#1A202C]/90 rounded-[2.5rem] p-8 border border-white/5">
              <div class="flex items-center justify-between mb-10 text-white/40">
                <div class="flex gap-3">
                  <div class="w-16 h-4 bg-white/5 rounded-full"></div>
                  <div class="w-10 h-4 bg-white/5 rounded-full"></div>
                </div>
                <div class="w-20 h-4 bg-white/5 rounded-full"></div>
              </div>

              <!-- Bar chart mockup -->
              <div class="flex items-end justify-between gap-2.5 h-40 px-4">
                <div v-for="(h, i) in [35, 55, 45, 75, 65, 50, 40]" :key="i" 
                     class="flex-1 rounded-t-xl bg-gradient-to-t from-[#E67E50]/10 via-[#E67E50]/60 to-[#FF9B71] transition-all duration-1000"
                     :style="{ height: `${h}%` }">
                </div>
              </div>

              <!-- Bottom elements -->
              <div class="grid grid-cols-3 gap-4 mt-10">
                <div v-for="j in 3" :key="j" class="h-12 bg-white/5 rounded-2xl"></div>
              </div>
            </div>
            
            <!-- Glow behind dashboard -->
            <div class="absolute -inset-4 bg-[#E67E50]/10 blur-[100px] -z-10 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ BENEFICIOS (TECNOLOGÍA) ══════════════ -->
    <section
      id="sec-beneficios"
      data-animar
      class="py-24 bg-white"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div
          class="text-center mb-20 transicion-seccion"
          :class="{ 'visible': esVisible('sec-beneficios') }"
        >
          <p class="text-gray-500 font-medium text-sm mb-3 uppercase tracking-wider">
            Tecnología que <span class="text-[#E67E50]">impulsa resultados</span>
          </p>
          <h2 class="text-3xl lg:text-4xl font-bold text-[#092C4C] max-w-4xl mx-auto text-balance">
            Características diseñadas para empresas que buscan excelencia operativa
          </h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(b, i) in beneficios"
            :key="b.titulo"
            class="bg-[#FAFAFA]/50 rounded-[2rem] p-8 border border-gray-100/50 hover:bg-white hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] transition-all duration-500 group transicion-seccion"
            :class="{ 'visible': esVisible('sec-beneficios') }"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div :class="[b.bgColor, 'w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500']">
              <component :is="b.icon" :class="['w-7 h-7', b.color]" />
            </div>
            <h3 class="text-lg font-bold text-[#092C4C] mb-4 leading-tight group-hover:text-[#E67E50] transition-colors">
              {{ b.titulo }}
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              {{ b.descripcion }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ CÓMO FUNCIONA ══════════════ -->
    <section
      id="sec-pasos"
      data-animar
      class="py-24 bg-gray-50/50"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div
          class="text-center mb-20 transicion-seccion"
          :class="{ 'visible': esVisible('sec-pasos') }"
        >
          <p class="text-gray-500 font-medium text-sm mb-3 uppercase tracking-wider">¿Cómo funciona?</p>
          <h2 class="text-3xl lg:text-4xl font-bold text-[#092C4C] text-balance">
            Tres pasos para transformar tu logística
          </h2>
        </div>

        <div class="relative">
          <!-- Línea conectora (visible solo en desktop) -->
          <div class="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

          <div class="grid md:grid-cols-3 gap-8 relative z-10">
            <div
              v-for="(paso, i) in pasos"
              :key="paso.numero"
              class="bg-white rounded-[2rem] p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-2 transition-all duration-500 group transicion-seccion"
              :class="{ 'visible': esVisible('sec-pasos') }"
              :style="{ transitionDelay: `${i * 200}ms` }"
            >
              <!-- Número de fondo -->
              <span class="absolute top-6 right-8 text-7xl font-bold text-gray-50/80 group-hover:text-gray-100 transition-colors pointer-events-none italic">
                {{ paso.numero }}
              </span>

              <div :class="[paso.color, 'w-16 h-16 rounded-full flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500']">
                <component :is="paso.icon" class="w-8 h-8 text-white" />
              </div>
              
              <h3 class="text-xl font-bold text-[#092C4C] mb-4">{{ paso.titulo }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed px-2">
                {{ paso.descripcion }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ STACK TECNOLÓGICO ══════════════ -->
    <section
      id="sec-tech"
      data-animar
      class="py-20 bg-[#092C4C]"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div
          class="text-center mb-16 transicion-seccion"
          :class="{ 'visible': esVisible('sec-tech') }"
        >
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4 text-balance">
            Tecnología de Vanguardia
          </h2>
          <p class="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Construido con las mejores tecnologías para máximo rendimiento
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(tech, i) in tecnologias"
            :key="tech.nombre"
            class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group transicion-seccion"
            :class="{ 'visible': esVisible('sec-tech') }"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="w-12 h-12 bg-[#E67E50]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#E67E50]/30 transition-colors">
              <component :is="tech.icon" class="w-6 h-6 text-[#E67E50]" />
            </div>
            <h3 class="text-lg font-semibold text-white mb-1">{{ tech.nombre }}</h3>
            <p class="text-gray-400 text-sm">{{ tech.descripcion }}</p>
          </div>
        </div>

        <!-- Stats -->
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10 transicion-seccion"
          :class="{ 'visible': esVisible('sec-tech') }"
          style="transition-delay: 400ms"
        >
          <div class="text-center">
            <div class="text-3xl lg:text-4xl font-bold text-[#E67E50]">
              <ContadorAnimado :end="500" suffix="+" />
            </div>
            <p class="text-gray-400 mt-2">Empresas activas</p>
          </div>
          <div class="text-center">
            <div class="text-3xl lg:text-4xl font-bold text-[#E67E50]">
              <ContadorAnimado :end="50" suffix="K+" />
            </div>
            <p class="text-gray-400 mt-2">Vehículos rastreados</p>
          </div>
          <div class="text-center">
            <div class="text-3xl lg:text-4xl font-bold text-[#E67E50]">
              <ContadorAnimado :end="99" suffix="%" />
            </div>
            <p class="text-gray-400 mt-2">Uptime garantizado</p>
          </div>
          <div class="text-center">
            <div class="text-3xl lg:text-4xl font-bold text-[#E67E50]">
              <ContadorAnimado :end="30" suffix="%" />
            </div>
            <p class="text-gray-400 mt-2">Reducción de costos</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ TESTIMONIOS ══════════════ -->
    <section
      id="sec-testimonios"
      data-animar
      class="py-20 bg-[#FAFAFA]"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div
          class="text-center mb-16 transicion-seccion"
          :class="{ 'visible': esVisible('sec-testimonios') }"
        >
          <h2 class="text-3xl lg:text-4xl font-bold text-[#092C4C] mb-4 text-balance">
            Lo que dicen nuestros clientes
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Empresas que ya transformaron su logística con Moveo
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="(t, i) in testimonios"
            :key="t.nombre"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transicion-seccion"
            :class="{ 'visible': esVisible('sec-testimonios') }"
            :style="{ transitionDelay: `${i * 150}ms` }"
          >
            <div class="flex gap-1 mb-4">
              <Star
                v-for="s in t.estrellas"
                :key="s"
                class="w-5 h-5 text-yellow-400 fill-yellow-400"
              />
            </div>
            <p class="text-gray-600 mb-6 leading-relaxed italic">{{ `"${t.texto}"` }}</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#E67E50]/10 rounded-full flex items-center justify-center">
                <span class="text-[#E67E50] font-semibold text-sm">{{ t.nombre.split(' ').map(n => n[0]).join('') }}</span>
              </div>
              <div>
                <p class="font-medium text-[#092C4C] text-sm">{{ t.nombre }}</p>
                <p class="text-gray-500 text-xs">{{ t.cargo }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════ CTA FINAL ══════════════ -->
    <section class="py-20 bg-gradient-to-r from-[#E67E50] to-[#d66d40]">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6 text-balance">
          Transforma tu logística hoy
        </h2>
        <p class="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          Únete a más de 500 empresas que ya optimizaron su operación con Moveo
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button
            class="bg-white text-[#E67E50] px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg flex items-center gap-2"
            @click="emit('navegar', 'contacto')"
          >
            Empezar Ahora
            <ArrowRight class="w-5 h-5" />
          </button>
          <button
            class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all"
            @click="emit('navegar', 'contacto')"
          >
            Solicitar Demo
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
