<script setup lang="ts">
import { 
  Truck, Route, BarChart3, Shield, Globe, Package, 
  ArrowRight, Users, Clock, ShieldCheck 
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const servicios = [
  {
    icon: Route,
    title: 'Optimización de Rutas Inteligente',
    description: 'Nuestros algoritmos de IA calculan las rutas más eficientes en tiempo real, considerando tráfico, clima y ventanas de entrega.',
    features: ['Reducción de kilometraje', 'Menor consumo de combustible', 'Entregas más rápidas']
  },
  {
    icon: Truck,
    title: 'Gestión de Flota en Tiempo Real',
    description: 'Control total de tus vehículos. Monitorea ubicación, estado del motor, y comportamiento del conductor desde un solo panel.',
    features: ['Rastreo GPS en vivo', 'Alertas de mantenimiento', 'Historial de recorridos']
  },
  {
    icon: BarChart3,
    title: 'Analítica Avanzada y Reportes',
    description: 'Transforma datos en decisiones. Obtén insights detallados sobre el rendimiento de tu operación logística.',
    features: ['KPIs personalizables', 'Reportes automáticos', 'Predicción de demanda']
  },
  {
    icon: Package,
    title: 'Prueba de Entrega Digital',
    description: 'Digitaliza todo el proceso de entrega. Captura firmas, fotos y escanea códigos de barras desde nuestra app móvil.',
    features: ['Firma digital', 'Escaneo de QR/Códigos', 'Georreferenciación']
  },
  {
    icon: Shield,
    title: 'Seguridad y Control',
    description: 'Protege tus activos y carga. Sistemas anti-robo y alertas inmediatas ante cualquier anomalía.',
    features: ['Botón de pánico', 'Bloqueo remoto', 'Geocercas']
  },
  {
    icon: Globe,
    title: 'Logística Internacional',
    description: 'Soluciones escalables para operaciones transfronterizas. Gestión documental y aduanera simplificada.',
    features: ['Multimoneda y multiidioma', 'Gestión de documentos', 'Compliance global']
  }
]
</script>

<template>
  <div class="bg-white">
    <!-- Hero Section -->
    <section class="relative py-24 bg-[#092C4C] overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" :style="{ backgroundImage: 'radial-gradient(circle, #E67E50 1px, transparent 1px)', backgroundSize: '30px 30px' }" />
      </div>
      
      <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <h1 class="text-4xl lg:text-6xl font-bold text-white mb-6">
          Soluciones integrales para tu <span class="text-[#E67E50]">logística</span>
        </h1>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Descubre cómo nuestra tecnología puede llevar tu operación al siguiente nivel.
          Herramientas potentes, intuitivas y escalables.
        </p>
        <button 
          @click="router.push('/contacto')"
          class="bg-[#E67E50] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#d66d40] transition-colors shadow-lg hover:shadow-[#E67E50]/30 flex items-center gap-2 mx-auto"
        >
          Solicitar demostración
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>
    </section>

    <!-- Servicios Grid -->
    <section class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(servicio, index) in servicios" 
            :key="index"
            class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div class="w-14 h-14 bg-[#E67E50]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#E67E50] transition-colors duration-300">
              <component :is="servicio.icon" class="w-7 h-7 text-[#E67E50] group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 class="text-xl font-bold text-[#092C4C] mb-4">{{ servicio.title }}</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              {{ servicio.description }}
            </p>
            <ul class="space-y-3">
              <li v-for="feature in servicio.features" :key="feature" class="flex items-center gap-2 text-sm text-gray-500">
                <ShieldCheck class="w-4 h-4 text-[#E67E50]" />
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats / Trust -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="bg-[#092C4C] rounded-3xl p-12 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-[#E67E50] rounded-full blur-[100px] opacity-20" />
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20" />
          
          <div class="grid md:grid-cols-3 gap-12 relative z-10 text-center">
            <div>
              <div class="text-4xl lg:text-5xl font-bold text-white mb-2">98%</div>
              <p class="text-gray-300">Satisfacción del cliente</p>
            </div>
            <div>
              <div class="text-4xl lg:text-5xl font-bold text-white mb-2">35%</div>
              <p class="text-gray-300">Ahorro promedio en costes</p>
            </div>
            <div>
              <div class="text-4xl lg:text-5xl font-bold text-white mb-2">24/7</div>
              <p class="text-gray-300">Soporte técnico especializado</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-gray-50 text-center">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-[#092C4C] mb-6">¿Listo para optimizar tu flota?</h2>
        <p class="text-gray-600 text-lg mb-10">
          Únete a las empresas líderes que ya confían en Moveo para sus operaciones logísticas.
        </p>
        <div class="flex justify-center gap-4">
          <button 
            @click="router.push('/contacto')"
            class="bg-[#E67E50] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#d66d40] transition-colors shadow-lg"
          >
            Empezar ahora
          </button>
          <button 
            @click="router.push('/dashboard')"
            class="bg-white text-[#092C4C] border-2 border-[#092C4C]/10 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            Ver demo en vivo
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
