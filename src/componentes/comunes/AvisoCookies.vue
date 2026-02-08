<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cookie, X } from 'lucide-vue-next'

const visible = ref(false)

onMounted(() => {
  const consentimiento = localStorage.getItem('moveo_cookies_accepted')
  if (!consentimiento) {
    // Show after a small delay for better UX
    setTimeout(() => {
      visible.value = true
    }, 1000)
  }
})

const aceptar = () => {
  localStorage.setItem('moveo_cookies_accepted', 'true')
  visible.value = false
}

const rechazar = () => {
  // We mark as seen but not accepted, so we don't nag again in this session or ever?
  // legally 'reject' means don't track. For UI persistence implies we shouldn't ask again.
  localStorage.setItem('moveo_cookies_accepted', 'false') 
  visible.value = false
}
</script>

<template>
  <Transition name="slide-up">
    <div 
      v-if="visible" 
      class="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div class="max-w-4xl mx-auto bg-[#092C4C] rounded-2xl p-6 shadow-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center gap-6">
        
        <!-- Icon -->
        <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center shrink-0">
          <Cookie class="w-6 h-6 text-[#E67E50]" />
        </div>

        <!-- Text -->
        <div class="flex-1">
          <h3 class="text-white font-bold mb-1">🍪 Valoramos tu privacidad</h3>
          <p class="text-gray-300 text-sm leading-relaxed">
            Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el tráfico. 
            Puedes aceptar todas o configurar tus preferencias.
            <router-link to="/privacidad" class="text-[#E67E50] hover:underline">Ver política</router-link>.
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            @click="rechazar"
            class="px-6 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm"
          >
            Rechazar
          </button>
          <button 
            @click="aceptar"
            class="px-6 py-2.5 rounded-xl bg-[#E67E50] text-white font-bold hover:bg-[#d66d40] transition-colors shadow-lg shadow-[#E67E50]/20 text-sm whitespace-nowrap"
          >
            Aceptar todas
          </button>
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
</style>
