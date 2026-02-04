<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2,
  suffix: '',
  prefix: ''
})

const count = ref(0)
const elementRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)
const isVisible = ref(false)

let animationFrame: number | null = null
let observer: IntersectionObserver | null = null

const startAnimation = () => {
  if (hasAnimated.value) return
  hasAnimated.value = true

  let startTime: number | null = null

  const animate = (currentTime: number) => {
    if (!startTime) startTime = currentTime
    const progress = Math.min((currentTime - startTime) / (props.duration * 1000), 1)
    
    // Easing easingOutQuart
    const ease = 1 - Math.pow(1 - progress, 4)
    
    count.value = Math.floor(ease * props.end)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate)
    } else {
      count.value = props.end
    }
  }

  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible.value = true
          startAnimation()
        }
      })
    },
    { threshold: 0.1 }
  )

  if (elementRef.value) {
    observer.observe(elementRef.value)
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <span 
    ref="elementRef" 
    class="contador-animado inline-block font-numeric"
    :class="{ 'visible': isVisible }"
  >
    {{ props.prefix }}{{ count }}{{ props.suffix }}
  </span>
</template>

<style scoped>
.contador-animado {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  font-variant-numeric: tabular-nums;
}

.contador-animado.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
