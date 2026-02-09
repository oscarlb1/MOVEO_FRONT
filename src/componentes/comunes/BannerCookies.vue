<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cookie, X } from 'lucide-vue-next'

const mostrar = ref(false)

onMounted(() => {
  const aceptadas = localStorage.getItem('cookies-aceptadas')
  if (!aceptadas) {
    setTimeout(() => {
      mostrar.value = true
    }, 1000)
  }
})

const aceptar = () => {
  localStorage.setItem('cookies-aceptadas', 'true')
  mostrar.value = false
}

const rechazar = () => {
  localStorage.setItem('cookies-aceptadas', 'false')
  mostrar.value = false
}
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
    <div v-if="mostrar" class="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div class="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:flex items-center justify-between gap-6 relative overflow-hidden">
        
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
              Puedes aceptar todas las cookies o configurar tus preferencias.
              <router-link to="/cookies" class="text-[#E67E50] hover:underline font-medium">Leer política de cookies</router-link>.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-6 md:mt-0 w-full md:w-auto">
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

        <button @click="mostrar = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 sm:hidden">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>
