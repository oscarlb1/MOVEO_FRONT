<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Send, CheckCircle2 } from 'lucide-vue-next'

// 1. Declaramos las variables reactivas (Esto es lo que faltaba)
const enviado = ref(false)
const cargando = ref(false)

const formulario = reactive({
  name: '',
  email: '',
  company: '',
  phone: '',
  subject: 'general',
  message: ''
})

// 2. Función de envío conectada a AWS
async function enviarFormulario() {
  cargando.value = true
  try {
    const urlAWS = 'https://xgxc4swa3a.execute-api.us-east-1.amazonaws.com/prod/contacto'

    const response = await fetch(urlAWS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formulario)
    })

    if (response.ok) {
      enviado.value = true
      
      // Limpiamos el formulario tras 3 segundos
      setTimeout(() => {
        enviado.value = false
        Object.assign(formulario, {
          name: '',
          email: '',
          company: '',
          phone: '',
          subject: 'general',
          message: ''
        })
      }, 3000)
    } else {
      throw new Error('Error en la comunicación con AWS')
    }
  } catch (error) {
    console.error("Error enviando a Moveo:", error)
    alert("No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.")
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="bg-gradient-to-br from-[#3A4A52]/90 via-[#4A5A62]/90 to-[#3A4A52]/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 lg:p-8 relative border border-white/10">
    <!-- Glow effect -->
    <div class="absolute -inset-1 bg-gradient-to-r from-[#E67E50] via-[#374B54] to-[#E67E50] rounded-2xl blur-xl opacity-20" />

    <div class="relative">
      <div class="text-center mb-6">
        <h3 class="text-white text-2xl font-bold mb-1">Solicita información</h3>
        <p class="text-gray-300">Te responderemos en menos de 24 horas</p>
      </div>

      <!-- Success State -->
      <div v-if="enviado" class="animar-exito py-12 text-center">
        <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 class="w-10 h-10 text-white" />
        </div>
        <h3 class="text-white text-2xl font-bold mb-3">¡Perfecto!</h3>
        <p class="text-gray-300 text-lg">
          Tu mensaje ha sido enviado. Nos pondremos en contacto contigo muy pronto.
        </p>
      </div>

      <!-- Form -->
      <form v-else class="flex flex-col gap-4" @submit.prevent="enviarFormulario">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-200 font-semibold mb-2">Nombre completo *</label>
            <input
              v-model="formulario.name"
              type="text"
              required
              class="w-full px-4 py-3 min-h-[48px] text-base bg-[#2A3A42]/50 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-[#E67E50] focus:border-[#E67E50] focus:bg-[#2A3A42]/70 outline-none transition-all text-white placeholder:text-gray-400"
              placeholder="Juan Perez"
            />
          </div>
          <div>
            <label class="block text-gray-200 font-semibold mb-2">Email *</label>
            <input
              v-model="formulario.email"
              type="email"
              required
              class="w-full px-4 py-3 min-h-[48px] text-base bg-[#2A3A42]/50 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-[#E67E50] focus:border-[#E67E50] focus:bg-[#2A3A42]/70 outline-none transition-all text-white placeholder:text-gray-400"
              placeholder="juan@empresa.com"
            />
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-200 font-semibold mb-2">Empresa</label>
            <input
              v-model="formulario.company"
              type="text"
              class="w-full px-4 py-3 min-h-[48px] text-base bg-[#2A3A42]/50 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-[#E67E50] focus:border-[#E67E50] focus:bg-[#2A3A42]/70 outline-none transition-all text-white placeholder:text-gray-400"
              placeholder="Tu empresa"
            />
          </div>
          <div>
            <label class="block text-gray-200 font-semibold mb-2">Teléfono</label>
            <input
              v-model="formulario.phone"
              type="tel"
              class="w-full px-4 py-3 min-h-[48px] text-base bg-[#2A3A42]/50 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-[#E67E50] focus:border-[#E67E50] focus:bg-[#2A3A42]/70 outline-none transition-all text-white placeholder:text-gray-400"
              placeholder="+34 600 000 000"
            />
          </div>
        </div>

        <div>
          <label class="block text-gray-200 font-semibold mb-2">¿Qué te interesa? *</label>
          <select
            v-model="formulario.subject"
            required
            class="w-full px-4 py-3 min-h-[48px] text-base bg-[#2A3A42]/50 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-[#E67E50] focus:border-[#E67E50] focus:bg-[#2A3A42]/70 outline-none transition-all text-white"
          >
            <option value="general">Consulta general</option>
            <option value="demo">Solicitar demostración</option>
            <option value="pricing">Información de precios</option>
            <option value="support">Soporte técnico</option>
            <option value="partnership">Alianzas comerciales</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-200 font-semibold mb-2">Mensaje *</label>
          <textarea
            v-model="formulario.message"
            required
            rows="3"
            class="w-full px-4 py-3 min-h-[48px] text-base bg-[#2A3A42]/50 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-[#E67E50] focus:border-[#E67E50] focus:bg-[#2A3A42]/70 outline-none transition-all resize-none text-white placeholder:text-gray-400"
            placeholder="Cuéntanos cómo podemos ayudarte..."
          />
        </div>
        <button type="submit" :disabled="cargando"
          class="w-full bg-gradient-to-r from-[#E67E50] to-[#d66d40] text-white px-8 py-4 min-h-[56px] rounded-xl hover:shadow-lg hover:shadow-[#E67E50]/30 transition-all duration-300 flex items-center justify-center gap-2 group font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed">
          {{ cargando ? 'Procesando...' : 'Enviar mensaje' }}
          <Send v-if="!cargando" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p class="text-gray-400 text-sm text-center">
          Tus datos están protegidos y seguros
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animar-exito {
  animation: escalar-entrada 0.5s ease-out both;
}
@keyframes escalar-entrada {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
