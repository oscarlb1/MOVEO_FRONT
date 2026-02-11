<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Cookie, X, Settings, Shield, BarChart3 } from 'lucide-vue-next'
import { useCookiesStore } from '@/tiendas/cookies'

const store = useCookiesStore()
const mostrar = ref(false)
const configurando = ref(false)

// Local state for configuration to allow cancelling
const localPreferences = ref({ ...store.preferencias })

onMounted(() => {
  if (!store.aceptadas) {
    setTimeout(() => {
      mostrar.value = true
    }, 1000)
  }
})

const abrirConfiguracion = () => {
  localPreferences.value = { ...store.preferencias }
  configurando.value = true
}

const guardarConfiguracion = () => {
  store.guardarPreferencias(localPreferences.value)
  configurando.value = false
  mostrar.value = false
}

const aceptar = () => {
  store.aceptarTodas()
  mostrar.value = false
}

const rechazar = () => {
  store.rechazarTodas()
  mostrar.value = false
}

const cookieTypes = [
  { key: 'essential', title: 'Esenciales', desc: 'Necesarias para el funcionamiento.', required: true, icon: Shield },
  { key: 'analytics', title: 'Analíticas', desc: 'Nos ayudan a mejorar la web.', required: false, icon: BarChart3 },
  { key: 'marketing', title: 'Marketing', desc: 'Para publicidad personalizada.', required: false, icon: Cookie },
  { key: 'preferences', title: 'Preferencias', desc: 'Guardan tus ajustes.', required: false, icon: Settings }
]
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-full opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="mostrar && !store.aceptadas" class="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      
      <!-- Main Banner -->
      <div v-if="!configurando" class="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:flex items-center justify-between gap-6 relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-[#E67E50]/10 rounded-full blur-3xl -z-10"></div>
        
        <div class="flex items-start gap-4">
          <div class="p-3 bg-[#E67E50]/10 rounded-xl hidden sm:block">
            <Cookie class="w-6 h-6 text-[#E67E50]" />
          </div>
          <div>
            <h3 class="font-bold text-[#092C4C] text-lg mb-1">🍪 Valoramos tu privacidad</h3>
            <p class="text-gray-500 text-sm leading-relaxed max-w-2xl">
              Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-6 md:mt-0 w-full md:w-auto flex-wrap">
          <button 
            @click="abrirConfiguracion"
            class="flex-1 md:flex-none py-2.5 px-6 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Configurar
          </button>
          <button 
            @click="rechazar"
            class="flex-1 md:flex-none py-2.5 px-6 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Rechazar
          </button>
          <button 
            @click="aceptar"
            class="flex-1 md:flex-none py-2.5 px-8 rounded-xl bg-[#E67E50] text-white font-bold hover:bg-[#d66d40] transition-colors shadow-lg shadow-[#E67E50]/20 text-sm"
          >
            Aceptar todas
          </button>
        </div>
      </div>

      <!-- Configuration Modal/Panel -->
      <div v-else class="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden animate-fade-in-up">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-[#092C4C] text-xl flex items-center gap-2">
            <Settings class="w-5 h-5 text-[#E67E50]" />
            Configuración de Cookies
          </h3>
          <button @click="configurando = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
          <div v-for="type in cookieTypes" :key="type.key" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div class="flex items-center gap-3">
              <component :is="type.icon" class="w-5 h-5 text-gray-500" />
              <div>
                <div class="font-bold text-[#092C4C] text-sm">{{ type.title }}</div>
                <div class="text-xs text-gray-500">{{ type.desc }}</div>
              </div>
            </div>
            
            <button
              @click="!type.required && (localPreferences[type.key as keyof typeof localPreferences] = !localPreferences[type.key as keyof typeof localPreferences])"
              :disabled="type.required"
              class="relative w-10 h-5 rounded-full transition-colors shrink-0 focus:outline-none"
              :class="[
                localPreferences[type.key as keyof typeof localPreferences] ? 'bg-[#E67E50]' : 'bg-gray-300',
                type.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              ]"
            >
              <span
                class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm"
                :class="localPreferences[type.key as keyof typeof localPreferences] ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="configurando = false"
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="guardarConfiguracion"
            class="flex-1 py-3 rounded-xl bg-[#E67E50] text-white font-bold hover:bg-[#d66d40] transition-colors shadow-lg shadow-[#E67E50]/20"
          >
            Guardar preferencias
          </button>
        </div>
      </div>

    </div>
  </Transition>
</template>
