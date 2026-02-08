<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cookie, X, ChevronDown, ChevronUp, Shield, BarChart3, Settings } from 'lucide-vue-next'

const visible = ref(false)
const showConfig = ref(false)

const preferences = ref({
  essential: true,
  analytics: false,
  marketing: false
})

onMounted(() => {
  const consentimiento = localStorage.getItem('moveo_cookies_accepted')
  if (!consentimiento) {
    setTimeout(() => {
      visible.value = true
    }, 1000)
  }
})

const aceptarTodas = () => {
  preferences.value = { essential: true, analytics: true, marketing: true }
  guardar()
}

const rechazar = () => {
  preferences.value = { essential: true, analytics: false, marketing: false }
  guardar()
}

const guardar = () => {
  localStorage.setItem('moveo_cookie_preferences', JSON.stringify(preferences.value))
  localStorage.setItem('moveo_cookies_accepted', 'true')
  visible.value = false
}

const toggleConfig = () => {
  showConfig.value = !showConfig.value
}
</script>

<template>
  <Transition name="slide-up">
    <div 
      v-if="visible" 
      class="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div class="max-w-4xl mx-auto bg-[#092C4C] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        
        <!-- Main Banner Content -->
        <div class="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Icon -->
          <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center shrink-0">
            <Cookie class="w-6 h-6 text-[#E67E50]" />
          </div>

          <!-- Text -->
          <div class="flex-1">
            <h3 class="text-white font-bold mb-1">🍪 Valoramos tu privacidad</h3>
            <p class="text-gray-300 text-sm leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia. Puedes aceptar todas o configurar tus preferencias.
              <router-link to="/privacidad" class="text-[#E67E50] hover:underline">Ver política</router-link>.
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              @click="toggleConfig"
              class="px-4 py-2.5 rounded-xl text-gray-300 hover:text-white font-medium hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Settings class="w-4 h-4" />
              Configurar
              <ChevronUp v-if="showConfig" class="w-4 h-4" />
              <ChevronDown v-else class="w-4 h-4" />
            </button>
            <button 
              @click="rechazar"
              class="px-6 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm"
              v-if="!showConfig"
            >
              Rechazar
            </button>
            <button 
              @click="aceptarTodas"
              class="px-6 py-2.5 rounded-xl bg-[#E67E50] text-white font-bold hover:bg-[#d66d40] transition-colors shadow-lg shadow-[#E67E50]/20 text-sm whitespace-nowrap"
            >
              Aceptar todas
            </button>
          </div>
        </div>

        <!-- Configuration Panel (Expandable) -->
        <div v-if="showConfig" class="bg-[#0B1A28] border-t border-white/5 p-6 animate-fade-in">
          <div class="grid md:grid-cols-3 gap-4 mb-6">
            
            <!-- Essential -->
            <div class="bg-white/5 rounded-xl p-4 border border-white/5 opacity-75 cursor-not-allowed">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Shield class="w-4 h-4 text-[#E67E50]" />
                  <span class="text-white font-semibold text-sm">Esenciales</span>
                </div>
                <div class="w-8 h-4 bg-[#E67E50] rounded-full relative opacity-50">
                  <div class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <p class="text-xs text-gray-400">Estrictamente necesarias.</p>
            </div>

            <!-- Analytics -->
            <div 
              class="bg-white/5 rounded-xl p-4 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              @click="preferences.analytics = !preferences.analytics"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <BarChart3 class="w-4 h-4 text-[#E67E50]" />
                  <span class="text-white font-semibold text-sm">Analíticas</span>
                </div>
                <div class="w-8 h-4 rounded-full relative transition-colors" :class="preferences.analytics ? 'bg-[#E67E50]' : 'bg-gray-600'">
                  <div class="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all" :class="preferences.analytics ? 'right-0.5' : 'left-0.5'"></div>
                </div>
              </div>
              <p class="text-xs text-gray-400">Mejora de experiencia y estadísticas.</p>
            </div>

            <!-- Marketing -->
            <div 
              class="bg-white/5 rounded-xl p-4 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              @click="preferences.marketing = !preferences.marketing"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Cookie class="w-4 h-4 text-[#E67E50]" />
                  <span class="text-white font-semibold text-sm">Marketing</span>
                </div>
                <div class="w-8 h-4 rounded-full relative transition-colors" :class="preferences.marketing ? 'bg-[#E67E50]' : 'bg-gray-600'">
                  <div class="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all" :class="preferences.marketing ? 'right-0.5' : 'left-0.5'"></div>
                </div>
              </div>
              <p class="text-xs text-gray-400">Anuncios personalizados.</p>
            </div>

          </div>

          <div class="flex justify-end gap-3">
             <button 
              @click="rechazar"
              class="px-6 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm"
            >
              Rechazar todo
            </button>
            <button 
              @click="guardar"
              class="px-6 py-2.5 rounded-xl bg-white text-[#092C4C] font-bold hover:bg-gray-100 transition-colors text-sm"
            >
              Guardar selección
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
