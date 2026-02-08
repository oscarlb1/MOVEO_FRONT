<script setup lang="ts">
import { useRouter } from 'vue-router'
import { 
  FileText, Scale, AlertTriangle, CheckCircle, XCircle, ArrowLeft, 
  Shield 
} from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'inicio' })
}

const definitions = [
  { term: 'Plataforma', definition: 'Se refiere a la aplicación web y móvil Moveo para gestión de flotas y entregas.' },
  { term: 'Usuario', definition: 'Persona física o jurídica que accede o utiliza los servicios de Moveo.' },
  { term: 'Cliente', definition: 'Empresa o entidad que contrata los servicios de Moveo mediante suscripción.' },
  { term: 'Repartidor', definition: 'Usuario que utiliza la aplicación móvil para realizar entregas.' },
  { term: 'Contenido', definition: 'Datos, información, textos, gráficos o materiales cargados en la Plataforma.' },
]

const allowedUses = [
  'Gestionar flotas vehiculares de tu empresa',
  'Monitorear entregas en tiempo real',
  'Optimizar rutas y recursos logísticos',
  'Generar reportes y analíticas'
]

const prohibitedUses = [
  'Realizar ingeniería inversa o descompilar el software',
  'Revender o sublicenciar el servicio a terceros',
  'Utilizar la Plataforma para actividades ilegales',
  'Interferir con la seguridad o funcionalidad del sistema'
]

const accountRules = [
  'Debes proporcionar información precisa y completa durante el registro',
  'Eres responsable de mantener la confidencialidad de tus credenciales',
  'Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta',
  'Debes ser mayor de 18 años para crear una cuenta',
  'Una empresa puede tener múltiples cuentas de usuario bajo una única suscripción'
]

const liabilityExclusions = [
  'Pérdidas indirectas, incidentales o consecuentes',
  'Pérdida de beneficios, datos o oportunidades comerciales',
  'Daños causados por uso indebido de la Plataforma',
  'Interrupciones del servicio por mantenimiento o fuerza mayor',
  'Acciones de terceros (incluidos repartidores independientes)'
]

const ipRules = [
  'Conservas la propiedad de los datos que cargas en la Plataforma',
  'Otorgas a Moveo una licencia para procesar tus datos con el fin de proporcionar el servicio',
  'No puedes reproducir, modificar o distribuir ningún elemento de la Plataforma'
]

// Helper components logic is integrated directly into the template for simplicity in Vue
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-[#374B54] to-[#092C4C] text-white py-20 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute top-0 left-0 w-96 h-96 bg-[#E67E50]/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>

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
              <Scale class="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold mb-2">Términos y Condiciones</h1>
              <p class="text-white/80">Última actualización: 8 de febrero de 2026</p>
            </div>
          </div>
          <p class="text-xl text-white/90 leading-relaxed max-w-2xl">
            Lee atentamente estos términos antes de utilizar la plataforma Moveo.
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-6 py-16">
      
      <!-- Introduction -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 mb-12 animate-fade-in-up" style="animation-delay: 100ms;">
        <h2 class="text-2xl font-bold text-[#092C4C] mb-4">Acuerdo Legal</h2>
        <p class="text-gray-700 leading-relaxed">
          Al acceder y utilizar la plataforma Moveo, aceptas estar legalmente vinculado por estos Términos y Condiciones. 
          Si no estás de acuerdo con alguna parte de estos términos, no deberás utilizar nuestros servicios.
        </p>
      </div>

      <!-- Sections -->
      <div class="space-y-12">
        
        <!-- 1. Definitions -->
        <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-in-up" style="animation-delay: 200ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <FileText class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] mt-2">1. Definiciones</h2>
          </div>
          <div class="text-gray-600 leading-relaxed">
            <p class="mb-6">A los efectos de estos Términos y Condiciones:</p>
            <div class="space-y-3">
              <div v-for="(def, i) in definitions" :key="i" class="flex flex-col md:flex-row gap-2 md:gap-4 items-start bg-gray-50 rounded-lg p-4">
                <span class="font-semibold text-[#E67E50] min-w-[120px]">{{ def.term }}:</span>
                <span class="text-gray-700">{{ def.definition }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Uso de la Plataforma -->
        <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-in-up" style="animation-delay: 300ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <CheckCircle class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] mt-2">2. Uso de la Plataforma</h2>
          </div>
          <div class="text-gray-600 leading-relaxed">
            <p class="mb-4"><strong>Licencia de Uso:</strong></p>
            <p class="mb-6">
              Moveo te otorga una licencia limitada, no exclusiva, intransferible y revocable para utilizar la Plataforma 
              de acuerdo con estos términos.
            </p>
            
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h4 class="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle class="w-5 h-5" />
                Usos Permitidos
              </h4>
              <ul class="space-y-2">
                <li v-for="(use, i) in allowedUses" :key="i" class="flex items-start gap-2">
                  <span class="text-green-600 mt-1 font-bold">✓</span>
                  <span class="text-gray-700">{{ use }}</span>
                </li>
              </ul>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 class="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <XCircle class="w-5 h-5" />
                Usos Prohibidos
              </h4>
              <ul class="space-y-2">
                <li v-for="(use, i) in prohibitedUses" :key="i" class="flex items-start gap-2">
                  <span class="text-red-600 mt-1 font-bold">✗</span>
                  <span class="text-gray-700">{{ use }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 3. Cuentas y Registro -->
        <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-in-up" style="animation-delay: 400ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <Scale class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] mt-2">3. Cuentas y Registro</h2>
          </div>
          <div class="text-gray-600 leading-relaxed">
            <ul class="list-disc pl-5 space-y-3">
              <li v-for="(rule, i) in accountRules" :key="i">{{ rule }}</li>
            </ul>
          </div>
        </div>

        <!-- 4. Planes y Facturación -->
        <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-in-up" style="animation-delay: 500ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <FileText class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] mt-2">4. Planes y Facturación</h2>
          </div>
          <div class="text-gray-600 leading-relaxed">
            <p class="mb-4"><strong>Tipos de Suscripción:</strong></p>
            <div class="grid md:grid-cols-3 gap-4 mb-6">
              <div class="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#E67E50] transition-colors">
                <h4 class="font-semibold text-[#092C4C] mb-2">Starter</h4>
                <p class="text-2xl font-bold text-[#E67E50] mb-1">€49/mes</p>
                <p class="text-sm text-gray-500">Hasta 10 vehículos</p>
              </div>
              <div class="bg-gradient-to-br from-[#E67E50] to-[#d66d40] text-white rounded-lg p-4 shadow-lg transform hover:-translate-y-1 transition-all">
                <h4 class="font-semibold mb-2">Professional</h4>
                <p class="text-2xl font-bold mb-1">€149/mes</p>
                <p class="text-sm text-white/90">Hasta 50 vehículos</p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#E67E50] transition-colors">
                <h4 class="font-semibold text-[#092C4C] mb-2">Enterprise</h4>
                <p class="text-2xl font-bold text-[#E67E50] mb-1">Personalizado</p>
                <p class="text-sm text-gray-500">Ilimitado</p>
              </div>
            </div>
            <ul class="list-disc pl-5 space-y-2">
              <li>Los pagos se procesan de forma mensual o anual según tu elección</li>
              <li>Los precios no incluyen impuestos aplicables (IVA)</li>
              <li>Puedes cancelar tu suscripción en cualquier momento</li>
              <li>No se emiten reembolsos por períodos de facturación parciales</li>
              <li>El cambio de plan entra en vigor en el siguiente ciclo de facturación</li>
            </ul>
          </div>
        </div>

        <!-- 5. Limitación de Responsabilidad -->
        <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-in-up" style="animation-delay: 600ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <AlertTriangle class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] mt-2">5. Limitación de Responsabilidad</h2>
          </div>
          <div class="text-gray-600 leading-relaxed">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p class="text-gray-700 leading-relaxed">
                <strong class="text-yellow-900 block mb-2 uppercase tracking-wide text-sm">Importante</strong>
                La Plataforma se proporciona "tal cual" y "según disponibilidad". 
                Moveo no garantiza que el servicio sea ininterrumpido, seguro o libre de errores.
              </p>
            </div>
            <p class="mb-4">Moveo no será responsable de:</p>
            <ul class="list-disc pl-5 space-y-2 mb-6">
              <li v-for="(item, i) in liabilityExclusions" :key="i">{{ item }}</li>
            </ul>
            <p class="text-sm text-gray-500 italic border-l-4 border-gray-200 pl-4">
              En ningún caso, la responsabilidad total de Moveo excederá el monto pagado por el Cliente 
              durante los 12 meses anteriores al evento que dio lugar a la reclamación.
            </p>
          </div>
        </div>

        <!-- 6. Propiedad Intelectual -->
        <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-in-up" style="animation-delay: 700ms;">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center text-[#E67E50] shrink-0">
              <FileText class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-[#092C4C] mt-2">6. Propiedad Intelectual</h2>
          </div>
          <div class="text-gray-600 leading-relaxed">
            <p class="mb-4">
              Todos los derechos de propiedad intelectual sobre la Plataforma, incluyendo código fuente, diseño, 
              marcas registradas, logos y contenido, son propiedad exclusiva de Moveo.
            </p>
            <ul class="list-disc pl-5 space-y-2">
              <li v-for="(rule, i) in ipRules" :key="i">{{ rule }}</li>
            </ul>
          </div>
        </div>
        
        <!-- 7-8 Combined: Legal & Mods -->
        <div class="grid md:grid-cols-2 gap-6 animate-fade-in-up" style="animation-delay: 800ms;">
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
               <Scale class="w-5 h-5 text-[#E67E50]" />
               <h3 class="font-bold text-[#092C4C] text-lg">7. Ley Aplicable</h3>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
               Estos Términos se regirán e interpretarán de acuerdo con las leyes de España. 
               Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva 
               de los tribunales de Madrid, España.
            </p>
          </div>
          
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
             <div class="flex items-center gap-3 mb-4">
               <FileText class="w-5 h-5 text-[#E67E50]" />
               <h3 class="font-bold text-[#092C4C] text-lg">8. Modificaciones</h3>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Moveo se reserva el derecho de modificar estos Términos en cualquier momento. 
              Te notificaremos sobre cambios significativos. El uso continuado de los servicios constituye tu aceptación.
            </p>
          </div>
        </div>

      </div>

      <!-- Contact CTA -->
      <div class="mt-16 bg-gradient-to-r from-[#374B54] to-[#092C4C] rounded-2xl p-10 text-white text-center animate-fade-in-up" style="animation-delay: 900ms;">
        <h3 class="text-2xl font-bold mb-3">¿Necesitas aclarar algún término?</h3>
        <p class="mb-8 text-white/90 text-lg">
          Nuestro equipo legal está disponible para resolver tus dudas
        </p>
        <button
          @click="router.push({ name: 'contacto' })"
          class="bg-[#E67E50] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#d66d40] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Contactar con Soporte Legal
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
