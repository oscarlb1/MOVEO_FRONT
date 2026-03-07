import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

export type Tema = 'claro' | 'oscuro' | 'sistema'

export const useTemaStore = defineStore('tema', () => {
    const tema = ref<Tema>((localStorage.getItem('moveo-tema') as Tema) || 'sistema')

    const setTema = (nuevoTema: Tema) => {
        tema.value = nuevoTema
        localStorage.setItem('moveo-tema', nuevoTema)
        aplicarTema()
    }

    const isDark = computed(() =>
        tema.value === 'oscuro' ||
        (tema.value === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    )

    const aplicarTema = () => {
        const root = document.documentElement
        if (isDark.value) {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }

    // Inicializar
    aplicarTema()

    // Escuchar cambios del sistema si el tema es 'sistema'
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (tema.value === 'sistema') {
            aplicarTema()
        }
    })

    return {
        tema,
        isDark,
        setTema,
        aplicarTema
    }
})
