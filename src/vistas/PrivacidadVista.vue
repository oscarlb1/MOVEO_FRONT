<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Shield, Lock, Eye, Database, UserCheck, FileText, ArrowLeft,
  Truck, CheckCircle2 
} from 'lucide-vue-next'

const router = useRouter()

// Util for smooth scrolling or navigation
const goHome = () => {
  router.push({ name: 'inicio' })
}

const sections = [
  {
    icon: Eye,
    title: '1. Información que Recopilamos',
    content: [
      'Recopilamos diferentes tipos de información para proporcionarte nuestros servicios:',
      {
        type: 'list',
        items: [
          '<strong>Información de cuenta:</strong> Nombre, correo electrónico, teléfono, empresa y cargo.',
          '<strong>Información operativa:</strong> Datos de flotas, vehículos, repartidores, rutas y entregas.',
          '<strong>Información de ubicación:</strong> Geolocalización en tiempo real de vehículos (con consentimiento).',
          '<strong>Información técnica:</strong> Dirección IP, tipo de navegador, dispositivo y sistema operativo.',
          '<strong>Datos de uso:</strong> Páginas visitadas, funciones utilizadas y tiempo de actividad.'
        ]
      }
    ]
  },
  {
    icon: Database,
    title: '2. Cómo Usamos tu Información',
    content: [
      'Utilizamos la información recopilada para:',
      {
        type: 'list',
        items: [
          'Proporcionar, mantener y mejorar nuestros servicios de gestión de flotas',
          'Procesar transacciones y enviar notificaciones relacionadas',
          'Optimizar rutas y mejorar la eficiencia operativa',
          'Personalizar tu experiencia en la plataforma',
          'Enviar comunicaciones importantes sobre actualizaciones del servicio',
          'Prevenir fraudes y garantizar la seguridad de la plataforma',
          'Cumplir con obligaciones legales y regulatorias'
        ]
      }
    ]
  }
]

// Security items for section 3
const securityItems = [
  { title: 'Cifrado AES-256', desc: 'Todos los datos en reposo están cifrados' },
  { title: 'SSL/TLS', desc: 'Comunicaciones seguras extremo a extremo' },
  { title: 'Autenticación multifactor (MFA)', desc: 'Protección adicional de cuentas' },
  { title: 'Infraestructura AWS', desc: 'Servidores redundantes y copias de seguridad diarias' },
  { title: 'Auditorías regulares', desc: 'Evaluaciones de seguridad por terceros' }
]

// Rights items for section 4
const rights = [
  { title: 'Derecho de Acceso', desc: 'Solicitar copia de tus datos personales' },
  { title: 'Derecho de Rectificación', desc: 'Corregir datos inexactos o incompletos' },
  { title: 'Derecho de Supresión', desc: 'Eliminar tus datos personales' },
  { title: 'Derecho de Portabilidad', desc: 'Exportar tus datos en formato legible' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#16181A] transition-colors duration-300">
    <div class="bg-gradient-to-r from-[#092C4C] to-[#374B54] text-white py-20 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-[#E67E50]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
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
            <div class="w-16 h-16 bg-[#E67E50] rounded-2xl flex items-center justify-center shadow-lg shadow-[#E67E50]/20">
              <Shield class="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold mb-2">Política de Privacidad</h1>
              <p class="text-white/80">Última actualización: 8 de febrero de 2026</p>
            </div>
          </div>
          <p class="text-xl text-white/90 leading-relaxed max-w-2xl">
            En Moveo, tu privacidad es nuestra prioridad. Protegemos tus datos con los más altos estándares de seguridad.
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 py-16">
      
      <div class="grid md:grid-cols-3 gap-6 mb-16">
        <div class="bg-white dark:bg-[#272A30] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-[#374B54] hover:shadow-md transition-all duration-300 animate-fade-in-up" style="animation-delay: 100ms;">
          <Lock class="w-8 h-8 text-[#E67E50] mb-3" />
          <h3 class="font-semibold text-[#092C4C] dark:text-white mb-1 transition-colors">Cifrado SSL/TLS</h3>
          <p class="text-gray-500 dark:text-[#82A1B1] text-sm transition-colors">Todos los datos se transmiten de forma segura</p>
        </div>

        <div class="bg-white dark:bg-[#272A30] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-[#374B54] hover:shadow-md transition-all duration-300 animate-fade-in-up" style="animation-delay: 200ms;">
          <Database class="w-8 h-8 text-[#E67E50] mb-3" />
          <h3 class="font-semibold text-[#092C4C] dark:text-white mb-1 transition-colors">RGPD Compliant</h3>
          <p class="text-gray-500 dark:text-[#82A1B1] text-sm transition-colors">Cumplimos con la normativa europea</p>
        </div>

        <div class="bg-white dark:bg-[#272A30] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-[#374B54] hover:shadow-md transition-all duration-300 animate-fade-in-up" style="animation-delay: 300ms;">
          <UserCheck class="w-8 h-8 text-[#E67E50] mb-3" />
          <h3 class="font-semibold text-[#092C4C] dark:text-white mb-1 transition-colors">Tus Derechos</h3>
          <p class="text-gray-500 dark:text-[#82A1B1] text-sm transition-colors">Control total sobre tu información</p>
        </div>
      </div>

      <div class="space-y-12">
        
        <div 
          v-for="(section, idx) in sections" 
          :key="idx"
          class="bg-white dark:bg-[#272A30] rounded-xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] transition-colors duration-300 animate-fade-in-up"
          :style="{ animationDelay: `${(idx + 4) * 100}ms` }"
        >
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <component :is="section.icon" class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mt-2 transition-colors">{{ section.title }}</h2>
          </div>
          <div class="text-gray-600 dark:text-[#82A1B1] leading-relaxed space-y-4 transition-colors">
            <template v-for="(block, bIdx) in section.content" :key="bIdx">
              <p v-if="typeof block === 'string'">{{ block }}</p>
              <ul v-else-if="block.type === 'list'" class="space-y-2 list-disc pl-5 mt-2 [&_strong]:text-[#092C4C] dark:[&_strong]:text-white [&_strong]:transition-colors [&_strong]:font-bold">
                <li v-for="(item, iIdx) in block.items" :key="iIdx" v-html="item"></li>
              </ul>
            </template>
          </div>
        </div>

        <div class="bg-white dark:bg-[#272A30] rounded-xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] transition-colors duration-300 animate-fade-in-up" style="animation-delay: 600ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <Lock class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mt-2 transition-colors">3. Seguridad de los Datos</h2>
          </div>
          <div class="text-gray-600 dark:text-[#82A1B1] leading-relaxed transition-colors">
            <p class="mb-6">Implementamos medidas de seguridad de nivel empresarial:</p>
            <div class="bg-gradient-to-r from-[#E67E50]/5 to-[#374B54]/5 dark:from-[#E67E50]/10 dark:to-[#374B54]/10 rounded-xl p-6 border border-[#E67E50]/20 dark:border-[#374B54] transition-colors">
              <ul class="space-y-3">
                <li v-for="(item, sIdx) in securityItems" :key="sIdx" class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-[#E67E50] rounded-full mt-2 shrink-0"></div>
                  <span><strong class="text-[#092C4C] dark:text-white transition-colors">{{ item.title }}:</strong> {{ item.desc }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

         <div class="bg-white dark:bg-[#272A30] rounded-xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] transition-colors duration-300 animate-fade-in-up" style="animation-delay: 700ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <UserCheck class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mt-2 transition-colors">4. Tus Derechos (RGPD)</h2>
          </div>
          <div class="text-gray-600 dark:text-[#82A1B1] leading-relaxed transition-colors">
            <p class="mb-6">Tienes los siguientes derechos sobre tus datos personales:</p>
            <div class="grid md:grid-cols-2 gap-4">
              <div v-for="(right, rIdx) in rights" :key="rIdx" class="bg-gray-50 dark:bg-[#16181A] border border-gray-100 dark:border-[#374B54] rounded-lg p-4 hover:border-[#E67E50]/30 transition-colors">
                <h4 class="font-semibold text-[#092C4C] dark:text-white mb-1 flex items-center gap-2 transition-colors">
                  <CheckCircle2 class="w-4 h-4 text-[#E67E50]" />
                  {{ right.title }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-[#82A1B1] pl-6 transition-colors">{{ right.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-[#272A30] rounded-xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] transition-colors duration-300 animate-fade-in-up" style="animation-delay: 800ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <FileText class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mt-2 transition-colors">5. Compartir Información</h2>
          </div>
          <div class="text-gray-600 dark:text-[#82A1B1] leading-relaxed transition-colors">
            <p class="mb-4">Solo compartimos tu información en las siguientes circunstancias:</p>
            
            <ul class="space-y-2 list-disc pl-5 mb-6 [&_strong]:text-[#092C4C] dark:[&_strong]:text-white [&_strong]:transition-colors [&_strong]:font-bold">
              <li><strong>Con tu consentimiento:</strong> Cuando autorizas explícitamente compartir tus datos</li>
              <li><strong>Proveedores de servicios:</strong> AWS (hosting), servicios de análisis y soporte técnico</li>
              <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o proceso legal</li>
              <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, propiedad o seguridad</li>
            </ul>

            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-4 flex gap-3 text-sm text-yellow-800 dark:text-yellow-200 transition-colors">
              <Shield class="w-5 h-5 shrink-0 text-yellow-600 dark:text-yellow-500" />
              <p>
                <strong class="text-yellow-900 dark:text-yellow-100 transition-colors">Importante:</strong> Nunca vendemos ni alquilamos tus datos personales a terceros.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-[#272A30] rounded-xl p-8 shadow-sm border border-gray-100 dark:border-[#374B54] transition-colors duration-300 animate-fade-in-up" style="animation-delay: 900ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <Shield class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mt-2 transition-colors">6. Retención de Datos</h2>
          </div>
          <div class="text-gray-600 dark:text-[#82A1B1] leading-relaxed transition-colors">
            <p>
              Conservamos tus datos personales durante el tiempo necesario para cumplir con los fines descritos en esta política, 
              a menos que la ley exija o permita un período de retención más largo. Los datos de geolocalización se eliminan 
              automáticamente después de 90 días, excepto que se solicite lo contrario.
            </p>
          </div>
        </div>

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
  opacity: 0; /* Start hidden */
  animation: fadeInUp 0.8s ease-out forwards;
}

/* El bloque CSS anterior problemático ha sido eliminado por completo */
</style>