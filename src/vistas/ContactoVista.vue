<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Mail, Phone, MapPin, ArrowRight, Zap, Clock, TrendingUp, Users
} from 'lucide-vue-next'
import FormularioContacto from '@/componentes/contacto/FormularioContacto.vue'
import PieDePagina from '@/componentes/PieDePagina.vue'

const router = useRouter()

function navegar(pagina: string) {
  router.push({ name: pagina })
}

const beneficios = [
  { icon: TrendingUp, text: 'Respuesta en < 2 horas' },
  { icon: Users, text: 'Asesoría personalizada' },
  { icon: Zap, text: 'Demo en vivo gratis' },
  { icon: Clock, text: 'Disponibilidad 24/7' }
]

const metodos = [
  {
    icon: Phone, title: 'Llámanos', value: '+34 900 123 456',
    description: 'Lun - Vie, 9:00 - 18:00', link: 'tel:+34900123456',
    gradient: 'from-[#E67E50] to-[#d66d40]'
  },
  {
    icon: Mail, title: 'Escríbenos', value: 'info@moveo.com',
    description: 'Respuesta en 24h', link: 'mailto:info@moveo.com',
    gradient: 'from-[#374B54] to-[#092C4C]'
  },
  {
    icon: MapPin, title: 'Visítanos', value: 'Madrid, España',
    description: 'Calle Innovación 123', link: '#map',
    gradient: 'from-[#092C4C] to-[#374B54]'
  }
]

const estadisticas = [
  { value: '500+', label: 'Empresas activas', icon: Users, color: 'from-[#E67E50] to-[#d66d40]' },
  { value: '98%', label: 'Satisfacción cliente', icon: TrendingUp, color: 'from-green-400 to-green-600' },
  { value: '24/7', label: 'Soporte técnico', icon: Clock, color: 'from-blue-400 to-blue-600' },
  { value: '< 2h', label: 'Tiempo respuesta', icon: Zap, color: 'from-purple-400 to-purple-600' }
]

const infoMapa = [
  { icon: MapPin, title: 'Dirección', content: 'Calle Innovación 123, 28001 Madrid, España', gradient: 'from-[#E67E50] to-[#d66d40]' },
  { icon: Clock, title: 'Horario', content: 'Lunes a Viernes: 9:00 - 18:00\nSábados: 10:00 - 14:00', gradient: 'from-[#374B54] to-[#092C4C]' },
  { icon: Phone, title: 'Reserva tu visita', content: 'Llámanos o envía un email para agendar', gradient: 'from-[#092C4C] to-[#374B54]' }
]

const puntosFlotantes = Array.from({ length: 5 }, (_, i) => ({
  left: `${20 + i * 15}%`,
  top: `${30 + (i % 2) * 40}%`,
  delay: `${i * 0.5}s`,
  duration: `${3 + i}s`
}))
</script>

<template>
  <div class="bg-white dark:bg-[#16181A] transition-colors duration-300">

    <section class="relative bg-gradient-to-br from-[#092C4C] via-[#1a3a52] to-[#092C4C] pt-28 pb-40 lg:py-0 lg:min-h-[calc(100vh-80px)] flex items-center overflow-hidden">
      <div class="absolute inset-0 overflow-hidden">
        <div class="burbuja-naranja absolute top-0 right-0 w-[500px] h-[500px] bg-[#E67E50] rounded-full blur-[120px] opacity-20" />
        <div class="burbuja-azul absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#374B54] rounded-full blur-[120px] opacity-20" />
      </div>
      <div class="absolute inset-0 opacity-[0.03]">
        <div class="absolute inset-0" :style="{ backgroundImage: 'radial-gradient(circle, #E67E50 1px, transparent 1px)', backgroundSize: '40px 40px' }" />
      </div>

      <div class="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="animar-izquierda text-white lg:pr-4 text-center lg:text-left">
            <div class="animar-arriba inline-flex items-center gap-2 bg-[#E67E50]/20 border border-[#E67E50]/30 rounded-full px-5 py-2 mb-8">
              <Zap class="w-5 h-5 text-[#E67E50]" />
              <span class="text-white font-medium">Contáctanos ahora</span>
            </div>
            <h1 class="text-white text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Transforma tu <span class="text-[#E67E50]">logística</span> hoy mismo
            </h1>
            <p class="text-gray-300 text-xl mb-10 leading-relaxed">
              Completa el formulario y uno de nuestros expertos se pondrá en contacto
              contigo para mostrarte cómo Moveo puede revolucionar tu operación.
            </p>
            <div class="flex flex-col gap-4 mb-10 items-center lg:items-start">
              <div
                v-for="(b, i) in beneficios" :key="i"
                class="animar-beneficio flex items-center gap-4"
                :style="{ animationDelay: `${0.4 + i * 0.1}s` }"
              >
                <div class="w-12 h-12 bg-[#E67E50]/20 backdrop-blur-sm border border-[#E67E50]/30 rounded-xl flex items-center justify-center shrink-0">
                  <component :is="b.icon" class="w-6 h-6 text-[#E67E50]" />
                </div>
                <span class="text-white text-lg text-left">{{ b.text }}</span>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-[#E67E50] text-3xl font-bold mb-1">500+</div>
                <div class="text-gray-400 text-sm">Clientes</div>
              </div>
              <div class="text-center">
                <div class="text-[#E67E50] text-3xl font-bold mb-1">98%</div>
                <div class="text-gray-400 text-sm">Satisfacción</div>
              </div>
              <div class="text-center">
                <div class="text-[#E67E50] text-3xl font-bold mb-1">24/7</div>
                <div class="text-gray-400 text-sm">Soporte</div>
              </div>
            </div>
          </div>
          <div class="animar-formulario">
            <FormularioContacto />
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-[#16181A] dark:to-[#16181A] relative transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        <div class="animar-vista text-center mb-12">
          <h2 class="text-[#424242] dark:text-white text-3xl font-bold mb-4 transition-colors duration-300">Múltiples formas de contactar</h2>
          <p class="text-[#757575] dark:text-[#82A1B1] text-lg transition-colors duration-300">Elige la opción que más te convenga</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <a
            v-for="(m, i) in metodos" :key="i" :href="m.link"
            class="tarjeta-contacto group relative"
            :style="{ animationDelay: `${i * 0.1}s` }"
          >
            <div class="relative p-8 rounded-2xl text-white overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 bg-gradient-to-br" :class="m.gradient">
              <div class="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                <div class="absolute inset-0 patron-animado" :style="{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }" />
              </div>
              <div class="absolute -inset-1 bg-gradient-to-r from-white/50 to-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              <div class="relative">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-115 transition-transform duration-500">
                  <component :is="m.icon" class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-white text-2xl font-bold mb-3">{{ m.title }}</h3>
                <p class="text-white text-xl font-semibold mb-2">{{ m.value }}</p>
                <p class="text-white/90 text-base">{{ m.description }}</p>
              </div>
              <div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight class="w-5 h-5 text-white" />
                </div>
              </div>
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="py-20 bg-gradient-to-br from-[#092C4C] via-[#1a3a52] to-[#374B54] relative overflow-hidden">
      <div class="absolute inset-0">
        <div class="burbuja-stats-1 absolute top-0 left-1/4 w-96 h-96 bg-[#E67E50] rounded-full blur-[150px] opacity-20" />
        <div class="burbuja-stats-2 absolute bottom-0 right-1/4 w-96 h-96 bg-[#374B54] rounded-full blur-[150px] opacity-30" />
      </div>
      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-white text-3xl font-bold mb-4">Resultados que hablan por sí mismos</h2>
          <p class="text-gray-300 text-xl">Datos reales de nuestros clientes</p>
        </div>
        <div class="grid md:grid-cols-4 gap-8">
          <div
            v-for="(s, i) in estadisticas" :key="i"
            class="tarjeta-stat relative group"
            :style="{ animationDelay: `${i * 0.1}s` }"
          >
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
              <div class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br" :class="s.color" />
              <div class="relative">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 bg-gradient-to-br" :class="s.color">
                  <component :is="s.icon" class="w-8 h-8 text-white" />
                </div>
                <div class="text-5xl font-bold text-white mb-3">{{ s.value }}</div>
                <div class="text-gray-300 text-lg">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="map" class="py-20 bg-gradient-to-b from-white to-[#FAFAFA] dark:from-[#16181A] dark:to-[#16181A] transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-[#424242] dark:text-white text-3xl font-bold mb-4 transition-colors duration-300">Visítanos en Madrid</h2>
          <p class="text-[#757575] dark:text-[#82A1B1] text-lg transition-colors duration-300">Estaremos encantados de mostrarte en persona cómo funciona Moveo</p>
        </div>
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="animar-izquierda relative rounded-3xl overflow-hidden shadow-2xl group">
            <div class="aspect-square bg-gradient-to-br from-[#092C4C] via-[#374B54] to-[#092C4C] relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center z-10">
                  <div class="w-24 h-24 bg-[#E67E50] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <MapPin class="w-12 h-12 text-white" />
                  </div>
                  <h3 class="text-white text-3xl font-bold mb-3">Madrid</h3>
                  <p class="text-gray-300 text-lg">España</p>
                </div>
              </div>
              <div
                v-for="i in 3" :key="i"
                class="circulo-radar absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#E67E50] rounded-full"
                :style="{ animationDelay: `${(i - 1) * 1}s` }"
              />
              <div class="absolute inset-0 opacity-10">
                <div class="absolute inset-0" :style="{ backgroundImage: 'radial-gradient(circle, #E67E50 1px, transparent 1px)', backgroundSize: '30px 30px' }" />
              </div>
            </div>
          </div>
          <div class="animar-derecha flex flex-col gap-6">
            <div
              v-for="(item, i) in infoMapa" :key="i"
              class="tarjeta-info bg-white dark:bg-[#272A30] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-[#374B54] group"
            >
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br" :class="item.gradient">
                  <component :is="item.icon" class="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 class="text-[#424242] dark:text-white font-bold text-xl mb-2 transition-colors duration-300">{{ item.title }}</h4>
                  <p class="text-[#757575] dark:text-[#82A1B1] whitespace-pre-line transition-colors duration-300">{{ item.content }}</p>
                </div>
              </div>
            </div>
            <a
              href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
              class="block bg-gradient-to-r from-[#E67E50] to-[#d66d40] text-white px-8 py-4 min-h-[56px] flex items-center justify-center rounded-xl hover:shadow-lg hover:shadow-[#E67E50]/30 transition-all group font-semibold text-lg text-center hover:scale-[1.02] active:scale-[0.98]"
            >
              <span class="flex items-center justify-center gap-2">
                Abrir en Google Maps
                <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-gradient-to-br from-[#092C4C] via-[#E67E50] to-[#374B54] relative overflow-hidden">
      <div
        class="absolute inset-0 opacity-10 grid-animado"
        :style="{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '60px 60px' }"
      />
      <div
        v-for="(p, i) in puntosFlotantes" :key="i"
        class="absolute w-2 h-2 bg-white rounded-full punto-flotante"
        :style="{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }"
      />
      <div class="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div class="animar-contenido">
          <div class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl animar-icono">
            <Zap class="w-10 h-10 text-[#E67E50]" />
          </div>
          <h2 class="text-white mb-6 text-4xl lg:text-5xl font-bold leading-tight">
            ¿Listo para transformar tu logística?
          </h2>
          <p class="text-white/90 text-xl lg:text-2xl mb-12 leading-relaxed">
            Más de 500 empresas ya están optimizando sus entregas con Moveo
          </p>
          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <router-link
              to="/dashboard-demo"
              class="w-full sm:w-auto justify-center bg-white text-[#E67E50] px-10 py-4 sm:py-5 min-h-[56px] rounded-xl hover:bg-gray-100 transition-all flex items-center gap-3 group font-bold text-xl shadow-2xl hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Ver dashboard en vivo
              <ArrowRight class="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </router-link>
            <router-link
              to="/servicios"
              class="w-full sm:w-auto justify-center text-center flex items-center bg-transparent bg-white/10 backdrop-blur-xl border-2 border-white text-white px-10 py-4 sm:py-5 min-h-[56px] rounded-xl hover:bg-white/20 transition-all font-bold text-xl hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Explorar servicios
            </router-link>
          </div>
          <div class="mt-16 flex items-center justify-center gap-8 flex-wrap">
            <div v-for="(badge, i) in ['Sin compromiso', 'Soporte 24/7', 'Demo gratuita']" :key="i" class="text-white/90 text-lg font-semibold">
              {{ badge }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.burbuja-naranja { animation: flotar-naranja 8s ease-in-out infinite; }
.burbuja-azul { animation: flotar-azul 10s ease-in-out 1s infinite; }
.animar-izquierda { animation: deslizar-izquierda 0.8s ease-out both; }
.animar-arriba { animation: deslizar-arriba 0.6s ease-out 0.2s both; }
.animar-beneficio { animation: deslizar-izquierda 0.6s ease-out both; }
.animar-formulario { animation: deslizar-arriba 0.8s ease-out 0.3s both; }

/* Metodos */
.tarjeta-contacto { animation: deslizar-arriba 0.6s ease-out both; transition: transform 0.3s ease; }
.tarjeta-contacto:hover { transform: translateY(-12px); }
.patron-animado { animation: mover-patron 2s linear infinite; }

/* Stats */
.burbuja-stats-1 { animation: flotar-x 10s ease-in-out infinite; }
.burbuja-stats-2 { animation: flotar-x-inv 12s ease-in-out 1s infinite; }
.tarjeta-stat { animation: deslizar-arriba 0.6s ease-out both; transition: transform 0.3s ease; }
.tarjeta-stat:hover { transform: translateY(-8px) scale(1.05); }

/* Mapa */
.animar-derecha { animation: deslizar-derecha 0.8s ease-out both; }
.tarjeta-info { transition: transform 0.3s ease; }
.tarjeta-info:hover { transform: translateX(10px) scale(1.02); }
.circulo-radar { animation: radar 3s ease-out infinite; }

/* CTA */
.grid-animado { animation: mover-grid 20s linear infinite; }
.punto-flotante { animation: flotar-punto ease-in-out infinite; }
.animar-contenido { animation: deslizar-arriba 0.8s ease-out both; }
.animar-icono { animation: escalar-spring 0.8s ease-out both; }

@keyframes flotar-naranja {
  0%, 100% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.2) translate(50px, 30px); }
}
@keyframes flotar-azul {
  0%, 100% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.3) translate(-30px, -50px); }
}
@keyframes deslizar-izquierda {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes deslizar-arriba {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes deslizar-derecha {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes mover-patron {
  from { background-position: 0 0; }
  to { background-position: 20px 20px; }
}
@keyframes flotar-x {
  0%, 100% { transform: scale(1) translateX(0); }
  50% { transform: scale(1.2) translateX(50px); }
}
@keyframes flotar-x-inv {
  0%, 100% { transform: scale(1) translateX(0); }
  50% { transform: scale(1.3) translateX(-50px); }
}
@keyframes radar {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  66% { transform: translate(-50%, -50%) scale(2); opacity: 0.2; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}
@keyframes mover-grid {
  from { background-position: 0 0; }
  to { background-position: 60px 60px; }
}
@keyframes flotar-punto {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-30px); opacity: 1; }
}
@keyframes escalar-spring {
  from { transform: scale(0); }
  70% { transform: scale(1.1); }
  to { transform: scale(1); }
}
</style>