<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { storeToRefs } from 'pinia'
import { useCookiesStore } from '@/tiendas/cookies'
import { 
  Cookie, Settings, BarChart3, Shield, ArrowLeft, CheckCircle,
  Globe, Smartphone, CreditCard
} from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'inicio' })
}

// State
const store = useCookiesStore()

// State linked to store (using storeToRefs to maintain reactivity if object is replaced)
const { preferencias: cookieSettings } = storeToRefs(store)

const handleSavePreferences = () => {
  store.guardarPreferencias(cookieSettings.value)
  toast.success('Preferencias guardadas correctamente')
}

// Data for Cookie Types
const cookieTypes = [
  {
    key: 'essential',
    icon: Shield,
    title: 'Cookies Esenciales',
    description: 'Necesarias para el funcionamiento básico de la plataforma. No pueden ser desactivadas.',
    required: true,
    examples: [
      "Sesión de usuario autenticado",
      "Preferencias de seguridad",
      "Tokens de protección CSRF",
      "Balanceo de carga del servidor"
    ],
    duration: "Sesión o 24 horas"
  },
  {
    key: 'analytics',
    icon: BarChart3,
    title: 'Cookies Analíticas',
    description: 'Nos ayudan a entender cómo los usuarios interactúan con la plataforma para mejorar la experiencia.',
    required: false,
    examples: [
      "Google Analytics (tráfico y uso)",
      "Mapas de calor (Hotjar)",
      "Tiempo en página",
      "Rutas de navegación"
    ],
    duration: "2 años"
  },
  {
    key: 'marketing',
    icon: Cookie,
    title: 'Cookies de Marketing',
    description: 'Utilizadas para mostrar anuncios relevantes y medir la efectividad de campañas publicitarias.',
    required: false,
    examples: [
      "Google Ads (remarketing)",
      "Facebook Pixel",
      "LinkedIn Insight Tag",
      "Seguimiento de conversiones"
    ],
    duration: "1 año"
  },
  {
    key: 'preferences',
    icon: Settings,
    title: 'Cookies de Preferencias',
    description: 'Recuerdan tus elecciones y configuraciones personales para ofrecerte una experiencia personalizada.',
    required: false,
    examples: [
      "Idioma preferido",
      "Tema claro/oscuro",
      "Layout del dashboard",
      "Unidades de medida"
    ],
    duration: "1 año"
  }
]

// Data for Table (Añadidas clases dark: para las etiquetas)
const cookieRows = [
  { name: 'moveo_session', type: 'Esencial', purpose: 'Mantener la sesión del usuario activa', duration: '24 horas', typeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
  { name: 'csrf_token', type: 'Esencial', purpose: 'Protección contra ataques CSRF', duration: 'Sesión', typeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
  { name: '_ga', type: 'Analítica', purpose: 'Google Analytics - ID único de usuario', duration: '2 años', typeClass: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
  { name: '_gid', type: 'Analítica', purpose: 'Google Analytics - ID de sesión', duration: '24 horas', typeClass: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
  { name: 'fbp', type: 'Marketing', purpose: 'Facebook Pixel - Rastreo de conversiones', duration: '3 meses', typeClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' },
  { name: 'theme_preference', type: 'Preferencia', purpose: 'Recordar tema claro/oscuro', duration: '1 año', typeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' },
  { name: 'lang', type: 'Preferencia', purpose: 'Idioma preferido del usuario', duration: '1 año', typeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' },
]

// Third Party
const thirdPartyCookies = [
  { name: 'Google Analytics', purpose: 'Análisis de tráfico y comportamiento', link: 'https://policies.google.com/privacy' },
  { name: 'Google Maps', purpose: 'Visualización de mapas interactivos', link: 'https://policies.google.com/privacy' },
  { name: 'AWS CloudFront', purpose: 'Distribución de contenido (CDN)', link: 'https://aws.amazon.com/privacy/' },
  { name: 'Stripe', purpose: 'Procesamiento de pagos seguros', link: 'https://stripe.com/privacy' }
]

const browsers = [
  { name: 'Chrome', icon: Globe, instructions: 'Configuración > Privacidad y seguridad > Cookies' },
  { name: 'Firefox', icon: Smartphone, instructions: 'Opciones > Privacidad y seguridad > Cookies' }, 
  { name: 'Safari', icon: Globe, instructions: 'Preferencias > Privacidad > Cookies' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#16181A] transition-colors duration-300">
    <div class="bg-gradient-to-r from-[#E67E50] to-[#d66d40] text-white py-20 relative overflow-hidden">
      <div class="max-w-4xl mx-auto px-6 relative z-10">
        <button
          @click="goHome"
          class="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group w-fit"
        >
          <ArrowLeft class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </button>
        
        <div class="animate-fade-in-up">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-white dark:bg-[#272A30] rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300">
              <Cookie class="w-8 h-8 text-[#E67E50]" />
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold mb-2">Política de Cookies</h1>
              <p class="text-white/80">Última actualización: 8 de febrero de 2026</p>
            </div>
          </div>
          <p class="text-xl text-white/90 leading-relaxed max-w-2xl">
            Información transparente sobre cómo utilizamos cookies y tecnologías similares en Moveo.
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 py-16">
      
      <div class="bg-white dark:bg-[#272A30] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] mb-12 animate-fade-in-up transition-colors duration-300" style="animation-delay: 100ms;">
        <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mb-4">¿Qué son las cookies?</h2>
        <p class="text-gray-700 dark:text-[#82A1B1] leading-relaxed mb-6">
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. 
          Nos ayudan a mejorar tu experiencia, recordar tus preferencias y analizar cómo utilizas nuestra plataforma.
        </p>
        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center transition-colors duration-300">
            <Cookie class="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p class="text-sm font-semibold text-blue-900 dark:text-blue-200">Archivos pequeños</p>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 text-center transition-colors duration-300">
            <Shield class="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p class="text-sm font-semibold text-green-900 dark:text-green-200">Seguras</p>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 text-center transition-colors duration-300">
            <Settings class="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p class="text-sm font-semibold text-purple-900 dark:text-purple-200">Configurables</p>
          </div>
        </div>
      </div>

      <div class="space-y-8 mb-12">
        <div 
          v-for="(type, idx) in cookieTypes" 
          :key="type.key"
          class="bg-white dark:bg-[#272A30] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-[#374B54] animate-fade-in-up transition-colors duration-300"
          :style="{ animationDelay: `${(idx + 2) * 100}ms` }"
        >
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
                <component :is="type.icon" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-[#092C4C] dark:text-white mb-1">{{ type.title }}</h3>
                <p class="text-gray-600 dark:text-[#82A1B1] text-sm leading-relaxed">{{ type.description }}</p>
              </div>
            </div>
            
            <button
              @click="!type.required && (cookieSettings[type.key as keyof typeof cookieSettings] = !cookieSettings[type.key as keyof typeof cookieSettings])"
              :disabled="type.required"
              class="relative w-12 h-6 rounded-full transition-colors shrink-0 focus:outline-none"
              :class="[
                cookieSettings[type.key as keyof typeof cookieSettings] ? 'bg-[#E67E50]' : 'bg-gray-300 dark:bg-gray-600',
                type.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-90'
              ]"
            >
              <span
                class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"
                :class="cookieSettings[type.key as keyof typeof cookieSettings] ? 'translate-x-6' : 'translate-x-0'"
              />
            </button>
          </div>

          <div class="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-[#374B54]">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Ejemplos:</p>
              <ul class="space-y-1">
                <li v-for="(ex, i) in type.examples" :key="i" class="flex items-start gap-2 text-sm text-gray-600 dark:text-[#82A1B1]">
                  <span class="text-[#E67E50] mt-1">•</span>
                  <span>{{ ex }}</span>
                </li>
              </ul>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Duración:</p>
              <p class="text-sm text-gray-700 dark:text-gray-200 font-medium">{{ type.duration }}</p>
              
              <div v-if="type.required" class="mt-3 inline-block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5 transition-colors duration-300">
                <p class="text-xs text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-1">
                  <Shield class="w-3 h-3" /> Siempre activas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-[#E67E50]/10 to-[#374B54]/10 rounded-2xl p-8 border border-[#E67E50]/20 dark:border-[#E67E50]/30 text-center mb-16 animate-fade-in-up" style="animation-delay: 600ms;">
        <h3 class="text-2xl font-bold text-[#092C4C] dark:text-white mb-3 transition-colors duration-300">Gestiona tus Preferencias</h3>
        <p class="text-gray-700 dark:text-[#82A1B1] mb-8 max-w-md mx-auto transition-colors duration-300">
          Haz clic en el botón para guardar tu configuración de cookies personalizada
        </p>
        <button
          @click="handleSavePreferences"
          class="bg-[#E67E50] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#d66d40] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center gap-2"
        >
          <CheckCircle class="w-5 h-5" />
          Guardar Preferencias
        </button>
      </div>

      <div class="bg-white dark:bg-[#272A30] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] mb-12 animate-fade-in-up transition-colors duration-300" style="animation-delay: 700ms;">
        <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mb-6">Tabla Detallada de Cookies</h2>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 dark:bg-[#16181A] transition-colors duration-300">
              <tr>
                <th class="px-4 py-3 font-semibold text-[#092C4C] dark:text-[#82A1B1] rounded-l-lg">Nombre</th>
                <th class="px-4 py-3 font-semibold text-[#092C4C] dark:text-[#82A1B1]">Tipo</th>
                <th class="px-4 py-3 font-semibold text-[#092C4C] dark:text-[#82A1B1]">Propósito</th>
                <th class="px-4 py-3 font-semibold text-[#092C4C] dark:text-[#82A1B1] rounded-r-lg">Duración</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-[#374B54]">
              <tr v-for="cookie in cookieRows" :key="cookie.name" class="hover:bg-gray-50/50 dark:hover:bg-[#16181A]/50 transition-colors">
                <td class="px-4 py-3 font-mono text-[#E67E50] font-medium">{{ cookie.name }}</td>
                <td class="px-4 py-3">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300" :class="cookie.typeClass">
                    {{ cookie.type }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-[#82A1B1]">{{ cookie.purpose }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ cookie.duration }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white dark:bg-[#272A30] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] mb-12 animate-fade-in-up transition-colors duration-300" style="animation-delay: 800ms;">
        <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mb-6">Cookies de Terceros</h2>
        <p class="mb-6 text-gray-700 dark:text-[#82A1B1]">
          Algunos de nuestros socios utilizan cookies en nuestro sitio. No tenemos control sobre estas cookies, 
          pero te proporcionamos información sobre ellas:
        </p>
        <div class="grid md:grid-cols-2 gap-4">
          <div v-for="tp in thirdPartyCookies" :key="tp.name" class="bg-gray-50 dark:bg-[#16181A] border border-gray-200 dark:border-[#374B54] rounded-xl p-5 hover:border-[#E67E50]/30 dark:hover:border-[#E67E50]/30 transition-colors duration-300">
            <h4 class="font-bold text-[#092C4C] dark:text-white mb-1">{{ tp.name }}</h4>
            <p class="text-sm text-gray-600 dark:text-[#82A1B1] mb-3">{{ tp.purpose }}</p>
            <a
              :href="tp.link"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs font-semibold text-[#E67E50] hover:underline inline-flex items-center gap-1"
            >
              Ver política de privacidad
              <ArrowLeft class="w-3 h-3 rotate-180" />
            </a>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-[#272A30] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] animate-fade-in-up transition-colors duration-300" style="animation-delay: 900ms;">
        <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mb-6">Cómo Gestionar las Cookies</h2>
        <p class="mb-6 text-gray-700 dark:text-[#82A1B1]">
          Puedes controlar y/o eliminar las cookies como desees. Puedes eliminar todas las cookies que ya están 
          en tu dispositivo y configurar la mayoría de los navegadores para evitar que se instalen.
        </p>
        
        <div class="grid md:grid-cols-3 gap-4">
          <div v-for="browser in browsers" :key="browser.name" class="bg-gradient-to-br from-gray-50 to-white dark:from-[#16181A] dark:to-[#16181A] border border-gray-200 dark:border-[#374B54] rounded-xl p-6 text-center group hover:shadow-md transition-all duration-300">
            <div class="w-12 h-12 bg-white dark:bg-[#272A30] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 text-2xl">
               <component :is="browser.icon" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <h4 class="font-bold text-[#092C4C] dark:text-white mb-1">{{ browser.name }}</h4>
            <p class="text-xs text-gray-500 dark:text-[#82A1B1] font-medium">{{ browser.instructions }}</p>
          </div>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-5 mt-8 flex gap-3 transition-colors duration-300">
          <div class="text-yellow-600 dark:text-yellow-500 shrink-0">
            <Shield class="w-5 h-5" />
          </div>
          <p class="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
            <strong>Nota:</strong> Si bloqueas todas las cookies, algunas funcionalidades de Moveo pueden no funcionar correctamente.
          </p>
        </div>
      </div>

      <div class="mt-16 bg-gradient-to-r from-[#092C4C] to-[#374B54] rounded-2xl p-10 text-white text-center animate-fade-in-up" style="animation-delay: 1000ms;">
        <h3 class="text-2xl font-bold mb-3">¿Tienes dudas sobre las cookies?</h3>
        <p class="mb-8 text-white/90 text-lg">
          Nuestro equipo está aquí para ayudarte con cualquier pregunta
        </p>
        <button
          @click="router.push({ name: 'contacto' })"
          class="bg-[#E67E50] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#d66d40] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Contactar con Soporte
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}
</style>