import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCookiesStore = defineStore('cookies', () => {
    const aceptadas = ref(localStorage.getItem('moveo_cookies_accepted') === 'true');
    const preferencias = ref({
        essential: true,
        analytics: false,
        marketing: false,
        preferences: false
    });

    // Load saved preferences if they exist
    const savedPrefs = localStorage.getItem('moveo_cookie_preferences');
    if (savedPrefs) {
        try {
            preferencias.value = JSON.parse(savedPrefs);
        } catch (e) {
            console.error('Error parsing cookie preferences', e);
        }
    }

    function guardarPreferencias(nuevasPreferencias: any) {
        preferencias.value = { ...preferencias.value, ...nuevasPreferencias, essential: true };
        aceptadas.value = true;
        localStorage.setItem('moveo_cookie_preferences', JSON.stringify(preferencias.value));
        localStorage.setItem('moveo_cookies_accepted', 'true');
    }

    function aceptarTodas() {
        preferencias.value = {
            essential: true,
            analytics: true,
            marketing: true,
            preferences: true
        };
        aceptadas.value = true;
        localStorage.setItem('moveo_cookie_preferences', JSON.stringify(preferencias.value));
        localStorage.setItem('moveo_cookies_accepted', 'true');
    }

    function rechazarTodas() {
        preferencias.value = {
            essential: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
        aceptadas.value = true;
        localStorage.setItem('moveo_cookie_preferences', JSON.stringify(preferencias.value));
        localStorage.setItem('moveo_cookies_accepted', 'true');
    }

    function resetearConsentimiento() {
        aceptadas.value = false;
        localStorage.removeItem('moveo_cookies_accepted');
    }

    return {
        aceptadas,
        preferencias,
        guardarPreferencias,
        aceptarTodas,
        rechazarTodas,
        resetearConsentimiento
    };
});
