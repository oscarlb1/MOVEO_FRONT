<script setup lang="ts">
import { computed } from 'vue'
import { Search, Plus, Loader2 } from 'lucide-vue-next'

interface KPI {
  label: string
  value: string | number
  icon: any
  color: string
  subtitulo?: string
}

const props = withDefaults(defineProps<{
  title: string
  description?: string
  cargando?: boolean
  kpis?: KPI[]
  searchPlaceholder?: string
  searchQuery?: string
  showNewButton?: boolean
  newButtonLabel?: string
  themeColor?: 'blue' | 'emerald' | 'orange' | 'purple' | 'amber'
  headerIcon?: any
  sidePosition?: 'left' | 'right'
  viewMode?: 'table' | 'cards'
}>(), {
  themeColor: 'emerald',
  sidePosition: 'right',
  viewMode: 'table'
})

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'new-click'): void
}>()

// --- SISTEMA DE COLORES ---
const themeClasses = computed(() => {
  const colors = {
    blue: {
      accent: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-100 dark:border-blue-900/30',
      focus: 'focus:border-blue-500',
      kpiIcon: 'bg-blue-50 dark:bg-blue-900/20'
    },
    emerald: {
      accent: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-600 hover:bg-emerald-700',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      focus: 'focus:border-emerald-500',
      kpiIcon: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    orange: {
      accent: 'text-[#E67E50] dark:text-[#E67E50]',
      bg: 'bg-[#E67E50] hover:bg-[#d46b3f]',
      border: 'border-orange-100 dark:border-[#E67E50]/30',
      focus: 'focus:border-[#E67E50]',
      kpiIcon: 'bg-orange-50 dark:bg-orange-900/20'
    },
    purple: {
      accent: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-600 hover:bg-purple-700',
      border: 'border-purple-100 dark:border-purple-900/30',
      focus: 'focus:border-purple-500',
      kpiIcon: 'bg-purple-50 dark:bg-purple-900/20'
    },
    amber: {
      accent: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-600 hover:bg-amber-700',
      border: 'border-amber-100 dark:border-amber-900/30',
      focus: 'focus:border-amber-500',
      kpiIcon: 'bg-amber-50 dark:bg-amber-900/20'
    }
  }
  return colors[props.themeColor] || colors.emerald
})
</script>

<template>
  <div class="space-y-6 relative">
    <!-- Icono Decorativo de Fondo -->
    <div v-if="headerIcon" class="absolute -top-6 -right-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-opacity duration-700">
      <component :is="headerIcon" class="w-64 h-64 rotate-12" />
    </div>

    <!-- Header KPIs -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
      <template v-if="props.cargando">
        <div v-for="i in 4" :key="i" class="p-5 rounded-2xl border animate-pulse bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54]">
          <div class="h-10 bg-gray-200 dark:bg-[#374B54] rounded-lg w-10 mb-4"></div>
          <div class="h-6 bg-gray-200 dark:bg-[#374B54] w-16 mb-2 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-[#374B54] w-24 rounded"></div>
        </div>
      </template>
      <template v-else-if="props.kpis">
        <div v-for="kpi in props.kpis" :key="kpi.label" 
             class="p-5 rounded-2xl border transition-all shadow-sm bg-white dark:bg-[#272A30] border-gray-100 dark:border-[#374B54] hover:shadow-md group">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2.5 rounded-xl transition-transform group-hover:scale-110" :style="{ backgroundColor: `${kpi.color}18` }">
              <component :is="kpi.icon" class="w-5 h-5" :style="{ color: kpi.color }" />
            </div>
            <p class="text-sm font-medium text-[#757575] dark:text-[#82A1B1]">{{ kpi.label }}</p>
          </div>
          <div class="flex items-end gap-3 mt-2">
            <p class="text-3xl font-bold text-[#092C4C] dark:text-white">{{ kpi.value }}</p>
            <p v-if="kpi.subtitulo" class="text-xs pb-1 font-medium text-gray-400 dark:text-[#82A1B1]">{{ kpi.subtitulo }}</p>
          </div>
        </div>
      </template>
      <slot name="custom-kpis" v-else></slot>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 relative z-10" 
         :class="[ { 'items-start': $slots.side }, props.sidePosition === 'left' ? 'lg:flex-row-reverse' : '' ]">
      <!-- Main Card -->
      <div class="flex-1 min-w-0 border rounded-2xl flex flex-col overflow-hidden bg-white dark:bg-[#272A30] border-gray-200 dark:border-[#374B54] shadow-sm transition-colors duration-300">
        
        <!-- Actions Bar -->
        <div class="p-5 border-b space-y-4 border-gray-100 dark:border-[#374B54]"
             :class="[ props.viewMode === 'cards' ? 'bg-gray-50/30 dark:bg-[#16181A]/30' : '' ]">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold flex items-center gap-2 text-[#092C4C] dark:text-white">
                <div class="p-1.5 rounded-lg" :class="themeClasses.kpiIcon">
                  <slot name="title-icon"></slot>
                </div>
                {{ props.title }}
              </h2>
              <p v-if="props.description" class="text-xs text-gray-500 dark:text-[#82A1B1] mt-0.5 ml-11">{{ props.description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <slot name="header-actions"></slot>
              <button v-if="props.showNewButton" 
                      @click="emit('new-click')"
                      class="text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shrink-0 ml-2 shadow-sm active:scale-95"
                      :class="themeClasses.bg">
                 <Plus class="w-4 h-4"/> {{ props.newButtonLabel || 'Nuevo' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
             <div class="relative col-span-1" :class="[ $slots.filters ? 'md:col-span-1' : 'md:col-span-2' ]">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input :value="props.searchQuery" 
                       @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
                       type="text" 
                       :placeholder="props.searchPlaceholder || 'Buscar...'"
                       class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl transition-all bg-gray-50 dark:bg-[#16181A] border-gray-200 dark:border-[#374B54] text-[#424242] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:outline-none"
                       :class="themeClasses.focus"/>
              </div>
              
              <slot name="filters"></slot>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-2 overflow-x-auto" :class="{ 'p-4': props.viewMode === 'cards' }">
          <div v-if="props.cargando" class="py-24 flex flex-col items-center justify-center">
            <Loader2 class="w-12 h-12 animate-spin mb-4" :class="themeClasses.accent" />
            <p class="text-gray-500 dark:text-[#82A1B1] font-medium tracking-wide">Sincronizando datos...</p>
          </div>
          
          <template v-else>
            <slot v-if="props.viewMode === 'cards'" name="cards"></slot>
            <slot v-else name="table"></slot>
          </template>
        </div>
      </div>

      <!-- Side Panel Content -->
      <div v-if="$slots.side" class="w-full lg:w-80 shrink-0">
        <slot name="side"></slot>
      </div>
    </div>

    <!-- Modals -->
    <slot name="modals"></slot>
  </div>
</template>

<style scoped>
/* Transición suave para cambios de color de tema */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
