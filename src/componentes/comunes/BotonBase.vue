<template>
  <button 
    class="boton-base" 
    :class="{ 'boton-base--cargando': cargando }" 
    :disabled="disabled || cargando"
  >
    <div v-if="cargando" class="spinner"></div>
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  disabled?: boolean;
  cargando?: boolean;
}>(), {
  disabled: false,
  cargando: false
});
</script>

<style scoped>
.boton-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary, #6366f1);
  color: white;
  border: none;
  border-radius: var(--radius-md, 0.5rem);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 2.75rem;
}

.boton-base:hover:not(:disabled) {
  background-color: var(--color-primary-dark, #4f46e5);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
}

.boton-base:active:not(:disabled) {
  transform: translateY(0);
}

.boton-base:disabled {
  background-color: var(--color-text-light, #94a3b8);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
