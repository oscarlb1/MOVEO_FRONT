<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Vehicle {
  id: number
  x: number
  y: number
}

const vehicles = ref<Vehicle[]>([
  { id: 1, x: 20, y: 30 },
  { id: 2, x: 60, y: 50 },
  { id: 3, x: 40, y: 70 },
  { id: 4, x: 80, y: 40 },
])

let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  interval = setInterval(() => {
    vehicles.value = vehicles.value.map(v => ({
      ...v,
      x: (v.x + Math.random() * 2 - 1 + 100) % 100,
      y: (v.y + Math.random() * 2 - 1 + 100) % 100,
    }))
  }, 2000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<template>
  <div class="absolute inset-0 overflow-hidden opacity-20">
    <!-- Grid lines -->
    <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E67E50" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- Animated routes -->
      <path
        class="ruta-animada ruta-1"
        d="M 100 200 Q 300 100 500 300 T 900 200"
        stroke="#E67E50"
        stroke-width="2"
        fill="none"
      />
      <path
        class="ruta-animada ruta-2"
        d="M 50 400 Q 400 300 700 500"
        stroke="#374B54"
        stroke-width="2"
        fill="none"
      />
    </svg>

    <!-- Animated vehicles -->
    <div
      v-for="vehicle in vehicles"
      :key="vehicle.id"
      class="vehiculo absolute w-3 h-3 bg-[#E67E50] rounded-full shadow-lg transition-all duration-1000 ease-in-out"
      :style="{ left: `${vehicle.x}%`, top: `${vehicle.y}%` }"
    >
      <div class="absolute inset-0 bg-[#E67E50] rounded-full animate-ping opacity-30"></div>
    </div>
  </div>
</template>

<style scoped>
.ruta-animada {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  opacity: 0;
}

.ruta-1 {
  animation: dibujarRuta 3s ease-in-out infinite alternate;
}

.ruta-2 {
  animation: dibujarRuta 4s ease-in-out infinite alternate;
  animation-delay: 1s;
}

@keyframes dibujarRuta {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0.6;
  }
}

.vehiculo {
  animation: pulsar 2s ease-in-out infinite;
}

@keyframes pulsar {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}
</style>
