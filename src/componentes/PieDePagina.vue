<script setup lang="ts">
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Truck } from 'lucide-vue-next'

const productLinks = [
  { label: 'Características', href: '#' },
  { label: 'Integraciones', href: '#' },
  { label: 'Precios', href: '#' },
  { label: 'Changelog', href: '#' },
  { label: 'Documentación', href: '#' },
]

const resourceLinks = [
  { label: 'Blog', href: '#' },
  { label: 'Casos de éxito', href: '#' },
  { label: 'Soporte', href: '#' },
  { label: 'API', href: '#' },
  { label: 'Estado del servicio', href: '#' },
]

const socialLinks = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
]

const legalLinks = [
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Términos', href: '#' },
  { label: 'Cookies', href: '#' },
]
</script>

<template>
  <footer class="bg-[#092C4C] text-white border-t border-white/10">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid md:grid-cols-4 gap-8 mb-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-[#E67E50] rounded-lg flex items-center justify-center">
              <Truck class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-semibold text-[#E67E50]">Moveo</span>
          </div>
          <p class="text-gray-300 mb-4 text-sm leading-relaxed">
            Plataforma integral para la gestión de flotas y entregas en tiempo real.
          </p>
          <div class="flex gap-3">
            <a 
              v-for="social in socialLinks" 
              :key="social.label"
              :href="social.href" 
              :aria-label="social.label"
              class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#E67E50] transition-colors"
            >
              <component :is="social.icon" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Producto -->
        <div>
          <h4 class="font-semibold mb-4 text-[#E67E50]">Producto</h4>
          <ul class="space-y-2">
            <li v-for="link in productLinks" :key="link.label">
              <a :href="link.href" class="text-gray-300 hover:text-[#E67E50] transition-colors text-sm">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Recursos -->
        <div>
          <h4 class="font-semibold mb-4 text-[#E67E50]">Recursos</h4>
          <ul class="space-y-2">
            <li v-for="link in resourceLinks" :key="link.label">
              <a :href="link.href" class="text-gray-300 hover:text-[#E67E50] transition-colors text-sm">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Contacto -->
        <div>
          <h4 class="font-semibold mb-4 text-[#E67E50]">Contacto</h4>
          <ul class="space-y-3">
            <li class="flex items-center gap-2 text-gray-300 text-sm">
              <Mail class="w-4 h-4 text-[#E67E50] shrink-0" />
              info@moveo.com
            </li>
            <li class="flex items-center gap-2 text-gray-300 text-sm">
              <Phone class="w-4 h-4 text-[#E67E50] shrink-0" />
              +34 900 123 456
            </li>
            <li class="flex items-start gap-2 text-gray-300 text-sm">
              <MapPin class="w-4 h-4 text-[#E67E50] mt-1 shrink-0" />
              <span>Calle Innovación 123<br />28001 Madrid, España</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <p class="text-gray-400">© 2025 Moveo. Todos los derechos reservados.</p>
        <div class="flex gap-6 text-gray-400">
          <a 
            v-for="link in legalLinks" 
            :key="link.label"
            :href="link.href" 
            class="hover:text-[#E67E50] transition-colors"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
