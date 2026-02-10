<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  Truck, Zap, Brain, Map, Bell, Clock, Shield, 
  BarChart3, Users, FileText, Lock, CheckCircle2 
} from 'lucide-vue-next'
import ContadorAnimado from '@/componentes/comunes/ContadorAnimado.vue'

// ─── Lógica de Roles (Carrusel Automático) ───
const rolActivo = ref(0)
let intervaloRoles: number | null = null
const TIEMPO_ROTACION = 4000 // 4 segundos por tarjeta

const roles = [
  {
    titulo: 'Administrador',
    icon: Lock,
    features: ['Acceso total', 'Gestión usuarios', 'Configuración sistema']
  },
  {
    titulo: 'Supervisor',
    icon: Zap,
    features: ['Ver dashboard', 'Asignar rutas', 'Monitoreo flota']
  },
  {
    titulo: 'Repartidor',
    icon: Truck,
    features: ['Ver ruta asignada', 'Confirmar entregas', 'Chat soporte']
  },
  {
    titulo: 'Cliente',
    icon: Users,
    features: ['Seguimiento pedido', 'Valoración servicio', 'Historial']
  }
]

const setRol = (index: number) => {
  rolActivo.value = index
  reiniciarIntervalo()
}

const reiniciarIntervalo = () => {
  if (intervaloRoles) clearInterval(intervaloRoles)
  intervaloRoles = setInterval(() => {
    rolActivo.value = (rolActivo.value + 1) % roles.length
  }, TIEMPO_ROTACION)
}

// ─── Lógica de Animaciones (Intersection Observer) ───
const seccionesVisibles = ref<Set<string>>(new Set())
let observer: IntersectionObserver | null = null

onMounted(() => {
  reiniciarIntervalo()

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
  if (intervaloRoles) clearInterval(intervaloRoles)
})

function esVisible(id: string) {
  return seccionesVisibles.value.has(id)
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen font-sans text-slate-800 pb-20">
    
    <section 
      id="sec-header"
      data-animar
      class="py-20 bg-[#092C4C] text-center px-6"
    >
      <div 
        class="max-w-4xl mx-auto transicion-seccion"
        :class="{ 'visible': esVisible('sec-header') }"
      >
        <h2 class="text-white text-lg font-medium opacity-80 mb-2">Soluciones <span class="text-[#E67E50]">completas</span> para tu logística</h2>
        <p class="text-2xl md:text-3xl text-white font-semibold">
          Módulos profesionales que transforman la forma en que gestionas tu operación
        </p>
      </div>
    </section>

    <section 
      id="sec-serv-1"
      data-animar
      class="py-24 max-w-7xl mx-auto px-6"
    >
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div 
          class="transicion-seccion"
          :class="{ 'visible': esVisible('sec-serv-1') }"
        >
          <span class="bg-[#E67E50]/10 text-[#E67E50] px-4 py-1 rounded-full text-sm font-bold mb-6 inline-block">
            🚀 Servicio #1
          </span>
          <h2 class="text-3xl font-bold text-[#092C4C] mb-6">Optimización de Rutas con IA</h2>
          <p class="text-gray-600 mb-8 leading-relaxed">
            Algoritmos inteligentes que calculan la ruta perfecta considerando tráfico en tiempo real, condiciones climáticas e histórico de entregas.
          </p>

          <div class="space-y-6 mb-8">
            <div class="flex gap-4">
              <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <Clock class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 class="font-bold text-[#092C4C]">30% menos tiempo de entrega</h4>
                <p class="text-sm text-gray-500">Reducción promedio en tiempo total de ruta</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Brain class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 class="font-bold text-[#092C4C]">Aprendizaje continuo</h4>
                <p class="text-sm text-gray-500">La IA mejora con cada ruta completada</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Map class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 class="font-bold text-[#092C4C]">Replanificación dinámica</h4>
                <p class="text-sm text-gray-500">Adaptación automática a cambios e imprevistos</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h5 class="text-sm font-bold text-gray-500 mb-4">Comparativa de eficiencia</h5>
            <div class="mb-4">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Ruta manual</span>
                <span>125 min</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-gray-400 h-2.5 rounded-full" style="width: 100%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-bold text-[#E67E50] mb-1">
                <span>Ruta optimizada con IA</span>
                <span>87 min</span>
              </div>
              <div class="w-full bg-orange-100 rounded-full h-2.5">
                <div class="bg-[#E67E50] h-2.5 rounded-full" style="width: 70%"></div>
              </div>
            </div>
          </div>
        </div>

        <div 
          class="relative transicion-seccion"
          :class="{ 'visible': esVisible('sec-serv-1') }"
          style="transition-delay: 200ms"
        >
            <img 
              src="https://images.unsplash.com/photo-1586155638764-bf045442fcc3?auto=format&fit=crop&q=80&w=1000" 
              alt="Rutas IA" 
              class="rounded-2xl shadow-2xl w-full object-cover h-[500px]"
            />
            <div class="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm animate-pulse">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                Calculando ruta óptima...
            </div>
        </div>
      </div>
    </section>

    <section 
      id="sec-serv-2"
      data-animar
      class="py-24 bg-white border-y border-gray-100"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          
          <div 
            class="order-2 lg:order-1 bg-gray-50 p-8 rounded-3xl transicion-seccion flex justify-center"
            :class="{ 'visible': esVisible('sec-serv-2') }"
          >
             <div class="bg-white w-full rounded-3xl shadow-xl p-6 border border-gray-100/50">
                
                <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h4 class="font-bold text-[#092C4C] text-lg">Mapa en vivo</h4>
                    <div class="flex gap-2">
                        <button class="bg-[#E67E50] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#d66d40] transition-colors shadow-sm">Todos</button>
                        <button class="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">En ruta</button>
                        <button class="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">Detenidos</button>
                    </div>
                </div>

                <div class="relative rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100">
                    <img 
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" 
                        alt="Dashboard Móvil" 
                        class="w-full h-[250px] object-cover" 
                    />
                </div>

                <div class="space-y-3">
                    <div class="bg-emerald-50 rounded-xl p-4 flex justify-between items-center transition-colors hover:bg-emerald-100/50">
                        <div class="flex items-center gap-3">
                            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <span class="text-slate-700 font-medium text-sm">Vehículo #V-001</span>
                        </div>
                        <span class="text-emerald-600 font-bold text-sm">En ruta</span>
                    </div>

                    <div class="bg-amber-50 rounded-xl p-4 flex justify-between items-center transition-colors hover:bg-amber-100/50">
                        <div class="flex items-center gap-3">
                            <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <span class="text-slate-700 font-medium text-sm">Vehículo #V-002</span>
                        </div>
                        <span class="text-amber-600 font-bold text-sm">Parado 5min</span>
                    </div>
                </div>

             </div>
          </div>

          <div 
            class="order-1 lg:order-2 transicion-seccion"
            :class="{ 'visible': esVisible('sec-serv-2') }"
            style="transition-delay: 200ms"
          >
            <span class="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-bold mb-6 inline-block">
              📡 Servicio #2
            </span>
            <h2 class="text-3xl font-bold text-[#092C4C] mb-6">Seguimiento en Tiempo Real</h2>
            <p class="text-gray-600 mb-8 leading-relaxed">
              Monitoriza cada vehículo de tu flota con actualización GPS cada 30 segundos. Control total de tu operación desde cualquier lugar.
            </p>

            <div class="grid sm:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Map class="w-6 h-6 text-[#092C4C] mb-3" />
                <h4 class="font-bold text-[#092C4C] mb-1">GPS Premier</h4>
                <p class="text-xs text-gray-500">Localización exacta en tiempo real</p>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Bell class="w-6 h-6 text-[#092C4C] mb-3" />
                <h4 class="font-bold text-[#092C4C] mb-1">Alertas</h4>
                <p class="text-xs text-gray-500">Notificaciones instantáneas</p>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Clock class="w-6 h-6 text-[#092C4C] mb-3" />
                <h4 class="font-bold text-[#092C4C] mb-1">Histórico</h4>
                <p class="text-xs text-gray-500">Consulta rutas pasadas</p>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Shield class="w-6 h-6 text-[#092C4C] mb-3" />
                <h4 class="font-bold text-[#092C4C] mb-1">Geocercas</h4>
                <p class="text-xs text-gray-500">Zonas de seguridad</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section 
      id="sec-analitica"
      data-animar
      class="py-20 bg-[#1e293b] text-white relative overflow-hidden"
    >
      <div class="absolute top-0 right-0 w-64 h-64 bg-[#E67E50] rounded-full blur-[120px] opacity-10"></div>
      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div 
          class="text-center mb-16 transicion-seccion"
          :class="{ 'visible': esVisible('sec-analitica') }"
        >
          <span class="bg-[#1e293b] border border-gray-600 text-gray-300 px-4 py-1 rounded-full text-sm font-bold mb-4 inline-block">
            📊 Servicio #3
          </span>
          <h2 class="text-3xl font-bold mb-4">Analítica Avanzada</h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Dashboards interactivos con KPIs en tiempo real para tomar decisiones informadas.
          </p>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            class="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 transicion-seccion"
            :class="{ 'visible': esVisible('sec-analitica') }"
            style="transition-delay: 100ms"
          >
             <div class="text-[#E67E50] mb-2"><Truck class="w-6 h-6" /></div>
             <div class="text-3xl font-bold mb-1">
               <ContadorAnimado :end="1247" />
             </div>
             <div class="text-sm text-gray-400">Entregas Completadas</div>
          </div>
          <div 
            class="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 transicion-seccion"
            :class="{ 'visible': esVisible('sec-analitica') }"
            style="transition-delay: 200ms"
          >
             <div class="text-[#E67E50] mb-2"><Clock class="w-6 h-6" /></div>
             <div class="text-3xl font-bold mb-1 flex items-center">
               <ContadorAnimado :end="28" />
               <span class="text-2xl ml-1">min</span>
             </div>
             <div class="text-sm text-gray-400">Tiempo Promedio</div>
          </div>
          <div 
            class="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 transicion-seccion"
            :class="{ 'visible': esVisible('sec-analitica') }"
            style="transition-delay: 300ms"
          >
             <div class="text-[#E67E50] mb-2"><FileText class="w-6 h-6" /></div>
             <div class="text-3xl font-bold mb-1 flex items-center">
               <span class="text-2xl mr-1">€</span>
               <ContadorAnimado :end="4.20" :decimals="2" />
             </div>
             <div class="text-sm text-gray-400">Costo por Entrega</div>
          </div>
          <div 
            class="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 transicion-seccion"
            :class="{ 'visible': esVisible('sec-analitica') }"
            style="transition-delay: 400ms"
          >
             <div class="text-[#E67E50] mb-2"><BarChart3 class="w-6 h-6" /></div>
             <div class="text-3xl font-bold mb-1 flex items-center">
               <ContadorAnimado :end="94" />
               <span class="text-2xl ml-1">%</span>
             </div>
             <div class="text-sm text-gray-400">Eficiencia Global</div>
          </div>
        </div>
      </div>
    </section>

    <section 
      id="sec-roles"
      data-animar
      class="py-24 max-w-7xl mx-auto px-6"
    >
      <div 
        class="text-center mb-16 transicion-seccion"
        :class="{ 'visible': esVisible('sec-roles') }"
      >
        <h2 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Control de Acceso y Roles</h2>
        <h3 class="text-3xl font-bold text-[#092C4C]">Sistema de permisos granular para máxima seguridad</h3>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div 
          v-for="(rol, index) in roles"
          :key="index"
          @click="setRol(index)"
          class="p-8 rounded-2xl cursor-pointer transition-all duration-1000 ease-in-out transicion-seccion relative overflow-hidden group"
          :class="[
            'visible', 
            rolActivo === index 
              ? 'bg-white shadow-xl border-t-4 border-[#E67E50] -translate-y-2' 
              : 'bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1'
          ]"
          :style="{ transitionDelay: `${(index + 1) * 100}ms` }"
        >
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-1000 ease-in-out"
            :class="rolActivo === index ? 'bg-orange-100' : 'bg-gray-100'"
          >
             <component 
               :is="rol.icon" 
               class="w-6 h-6 transition-colors duration-1000 ease-in-out"
               :class="rolActivo === index ? 'text-[#E67E50]' : 'text-gray-600'"
             />
          </div>

          <h4 class="font-bold text-lg mb-4 text-[#092C4C]">{{ rol.titulo }}</h4>
          
          <ul class="space-y-3 text-sm text-gray-600">
            <li v-for="feat in rol.features" :key="feat" class="flex gap-2 items-center">
              <CheckCircle2 
                class="w-4 h-4 transition-colors duration-1000 ease-in-out"
                :class="rolActivo === index ? 'text-[#E67E50]' : 'text-gray-400'"
               /> 
              {{ feat }}
            </li>
          </ul>

        </div>

      </div>
    </section>

  </div>
</template>

<style scoped>
/* Scroll Reveal */
.transicion-seccion {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  will-change: opacity, transform;
}
.transicion-seccion.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>