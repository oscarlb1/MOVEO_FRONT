<script setup lang="ts">
// Componente de pantalla de carga "Moveo"
// Contiene una animación de un camión desplazándose y una barra de progreso.

defineProps<{
  progreso: number;
  mostrar: boolean;
}>();
</script>

<template>
  <Transition name="loader-fade">
    <div v-if="mostrar" class="fixed inset-0 z-[100] bg-[#FAFAFA] dark:bg-[#16181A] flex flex-col items-center justify-center">
      <!-- Logo Text -->
      <h1 class="text-3xl font-black tracking-tight flex items-center gap-0.5 text-[#092C4C] dark:text-white mb-8 animate-pulse">
        MOVE<span class="text-[#E67E50]">O</span>
      </h1>
      
      <!-- Truck Animation Container -->
      <div class="relative w-48 h-24 mb-8 overflow-hidden">
        <img src="@/assets/camion-moveo.png" alt="Cargando..." class="w-full h-full object-contain truck-moving" />
      </div>

      <!-- Progress Bar Background -->
      <div class="w-64 h-2 bg-gray-200 dark:bg-[#374B54] rounded-full overflow-hidden shrink-0">
        <!-- Progress Indicator -->
        <div 
          class="h-full bg-gradient-to-r from-[#E67E50] to-[#f59e0b] transition-all duration-300 ease-out rounded-full"
          :style="{ width: `${progreso}%` }"
        ></div>
      </div>
      
      <!-- Progress Text -->
      <p class="mt-3 text-sm font-semibold text-[#757575] dark:text-[#82A1B1]">
        Cargando... {{ Math.round(progreso) }}%
      </p>
    </div>
  </Transition>
</template>

<style scoped>
.loader-fade-enter-active, .loader-fade-leave-active {
  transition: opacity 0.5s ease;
}
.loader-fade-enter-from, .loader-fade-leave-to {
  opacity: 0;
}

/* Animación del Camión (Lenta, de Izquierda a Derecha) */
.truck-moving {
  animation: conducir_lento 2s linear infinite;
}

@keyframes conducir_lento {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Brillo sutil para el texto del logo */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}
</style>
